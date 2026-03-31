import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodePincode(pincode: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pincode)}&country=India&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Evnting/1.0 (leads@avens.in)" },
  });
  const data = await res.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendor_pincode, client_pincode } = await req.json();

    if (!vendor_pincode || !client_pincode) {
      return new Response(
        JSON.stringify({ error: "Both vendor_pincode and client_pincode are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Geocode both pincodes
    const [vendorGeo, clientGeo] = await Promise.all([
      geocodePincode(vendor_pincode),
      geocodePincode(client_pincode),
    ]);

    if (!vendorGeo || !clientGeo) {
      return new Response(
        JSON.stringify({ error: "Could not geocode one or both pincodes", distance_km: 0, fee: 0, vehicle_type: "Unknown" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Straight-line distance × 1.4 road factor
    const straightLine = haversine(vendorGeo.lat, vendorGeo.lon, clientGeo.lat, clientGeo.lon);
    const roadDistance = Math.round(straightLine * 1.4 * 10) / 10;

    // Fetch transport tiers from DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: tiers } = await supabase
      .from("transport_tiers")
      .select("*")
      .order("min_km");

    let fee = 0;
    let vehicleType = "Tata Ace";

    if (tiers && tiers.length > 0) {
      const sorted = tiers.sort((a: any, b: any) => a.min_km - b.min_km);
      let matched = false;
      for (const tier of sorted) {
        const inRange = tier.max_km == null
          ? roadDistance >= tier.min_km
          : roadDistance >= tier.min_km && roadDistance < tier.max_km;
        if (inRange) {
          const extraKm = tier.max_km == null ? roadDistance - tier.min_km : 0;
          fee = tier.base_fee + extraKm * (tier.per_km_fee || 0);
          vehicleType = tier.vehicle_type || "Tata Ace";
          matched = true;
          break;
        }
      }
      if (!matched) {
        const last = sorted[sorted.length - 1];
        const extraKm = Math.max(0, roadDistance - last.min_km);
        fee = last.base_fee + extraKm * (last.per_km_fee || 0);
        vehicleType = last.vehicle_type || "Tata Ace";
      }
    }

    return new Response(
      JSON.stringify({ distance_km: roadDistance, fee: Math.round(fee), vehicle_type: vehicleType }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("calculate-transport error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
