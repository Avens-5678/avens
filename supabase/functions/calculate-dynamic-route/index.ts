import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      warehouse_lat, warehouse_lng,
      venue_lat, venue_lng,
      total_volume_units,
      delivery_hour, // 0-23, optional for surge
    } = await req.json();

    if (!warehouse_lat || !warehouse_lng || !venue_lat || !venue_lng) {
      return new Response(
        JSON.stringify({ error: "warehouse_lat, warehouse_lng, venue_lat, venue_lng are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const volumeUnits = total_volume_units || 1;

    // Step 1: Get driving distance from OSRM (free, no API key)
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${warehouse_lng},${warehouse_lat};${venue_lng},${venue_lat}?overview=false`;
    
    let drivingDistanceKm = 0;
    let drivingDurationMin = 0;

    try {
      const osrmRes = await fetch(osrmUrl, {
        headers: { "User-Agent": "Evnting/1.0 (leads@avens.in)" },
      });
      const osrmData = await osrmRes.json();
      
      if (osrmData.code === "Ok" && osrmData.routes?.length > 0) {
        drivingDistanceKm = Math.round(osrmData.routes[0].distance / 1000 * 10) / 10;
        drivingDurationMin = Math.round(osrmData.routes[0].duration / 60);
      } else {
        // Fallback: Haversine * 1.4 road factor
        drivingDistanceKm = haversine(warehouse_lat, warehouse_lng, venue_lat, venue_lng) * 1.4;
        drivingDistanceKm = Math.round(drivingDistanceKm * 10) / 10;
      }
    } catch {
      // Fallback to Haversine
      drivingDistanceKm = Math.round(haversine(warehouse_lat, warehouse_lng, venue_lat, venue_lng) * 1.4 * 10) / 10;
    }

    // Step 2: Match vehicle tier based on volume
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: vehicleTiers } = await supabase
      .from("vehicle_tiers")
      .select("*")
      .order("min_volume_units");

    let matchedVehicle = {
      vehicle_type: "Tata Ace",
      base_fare: 800,
      per_km_rate: 25,
      night_surge_multiplier: 1.5,
    };

    if (vehicleTiers && vehicleTiers.length > 0) {
      for (const tier of vehicleTiers) {
        const inRange = tier.max_volume_units == null
          ? volumeUnits >= tier.min_volume_units
          : volumeUnits >= tier.min_volume_units && volumeUnits <= tier.max_volume_units;
        if (inRange) {
          matchedVehicle = tier;
          break;
        }
      }
    }

    // Step 3: Calculate transport fee
    // Formula: Base Fare + (Extra KM * Per-KM Rate) * Surge Multiplier
    const includedKm = 5; // First 5 km included in base fare
    const extraKm = Math.max(0, drivingDistanceKm - includedKm);
    let baseFee = matchedVehicle.base_fare + (extraKm * matchedVehicle.per_km_rate);

    // Apply night surge if delivery between 10 PM - 6 AM
    let surgeApplied = false;
    if (delivery_hour != null && (delivery_hour >= 22 || delivery_hour < 6)) {
      baseFee = baseFee * matchedVehicle.night_surge_multiplier;
      surgeApplied = true;
    }

    const finalFee = Math.round(baseFee);

    return new Response(
      JSON.stringify({
        distance_km: drivingDistanceKm,
        duration_min: drivingDurationMin,
        vehicle_type: matchedVehicle.vehicle_type,
        base_fare: matchedVehicle.base_fare,
        extra_km: Math.round(extraKm * 10) / 10,
        per_km_rate: matchedVehicle.per_km_rate,
        surge_applied: surgeApplied,
        surge_multiplier: surgeApplied ? matchedVehicle.night_surge_multiplier : 1,
        fee: finalFee,
        total_volume_units: volumeUnits,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("calculate-dynamic-route error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Haversine distance in km (fallback)
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
