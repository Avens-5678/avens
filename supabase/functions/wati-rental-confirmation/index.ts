import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const watiApiKey = Deno.env.get("WATI_API_KEY");
    const watiApiUrl = Deno.env.get("WATI_API_URL");

    const { phone, name, order_id } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!watiApiKey || !watiApiUrl) {
      console.error("WATI credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "WATI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const cleanBaseUrl = watiApiUrl.replace(/\/+$/, "");
    const watiAuthToken = watiApiKey.replace(/^Bearer\s+/i, "");

    const orderRef = order_id ? order_id.substring(0, 8).toUpperCase() : "N/A";

    const watiUrl = `${cleanBaseUrl}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhone}`;
    const watiBody = {
      template_name: "rental_order_management",
      broadcast_name: `rental_order_${order_id || Date.now()}`,
      parameters: [
        { name: "1", value: name || "Customer" },
        { name: "2", value: orderRef },
      ],
    };

    console.log("WATI rental confirmation URL:", watiUrl);
    console.log("WATI rental confirmation body:", JSON.stringify(watiBody));

    const watiResponse = await fetch(watiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${watiAuthToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(watiBody),
    });

    if (watiResponse.ok) {
      const result = await watiResponse.json();
      console.log("WATI success:", JSON.stringify(result));
      return new Response(
        JSON.stringify({ success: true, message: "WhatsApp rental confirmation sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errText = await watiResponse.text();
      console.error("WATI error:", watiResponse.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: `WATI returned ${watiResponse.status}: ${errText}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
