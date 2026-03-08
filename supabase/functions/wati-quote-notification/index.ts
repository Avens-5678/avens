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

    // Verify admin auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabaseAuth.auth.getUser(token);
    if (claimsError || !claims?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: claims.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { clientName, clientPhone, quoteNumber, acceptanceToken, sourceOrderId } = await req.json();

    if (!clientPhone || !acceptanceToken) {
      return new Response(JSON.stringify({ error: "clientPhone and acceptanceToken are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!watiApiKey || !watiApiUrl) {
      return new Response(
        JSON.stringify({ error: "WATI_API_KEY and WATI_API_URL not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const phone = clientPhone.replace(/[^0-9]/g, "");
    const normalizedPhone = phone.length === 10 ? `91${phone}` : phone;
    const cleanBaseUrl = watiApiUrl.replace(/\/+$/, "");
    const watiAuthToken = watiApiKey.replace(/^Bearer\s+/i, "");

    // Build the acceptance link path: /quote/<token>
    const linkPath = `quote/${acceptanceToken}`;

    const watiUrl = `${cleanBaseUrl}/api/v1/sendTemplateMessage?whatsappNumber=${normalizedPhone}`;
    const watiBody = {
      template_name: "new_quotation",
      broadcast_name: `quote_${quoteNumber}`,
      parameters: [
        { name: "1", value: clientName || "Customer" },
        { name: "2", value: sourceOrderId ? `#${sourceOrderId.substring(0, 8).toUpperCase()}` : (quoteNumber || "N/A") },
        { name: "3", value: linkPath },
      ],
    };

    console.log("WATI quote notification URL:", watiUrl);
    console.log("WATI quote notification body:", JSON.stringify(watiBody));

    const watiResponse = await fetch(watiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${watiAuthToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(watiBody),
    });

    if (watiResponse.ok) {
      // Update quote sent_via and sent_at
      await supabaseAdmin
        .from("quotes")
        .update({ sent_via: "whatsapp", sent_at: new Date().toISOString(), status: "sent" })
        .eq("acceptance_token", acceptanceToken);

      return new Response(
        JSON.stringify({ success: true, message: "WhatsApp quote sent successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errText = await watiResponse.text();
      console.error("WATI API error:", watiResponse.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: `WATI API returned ${watiResponse.status}: ${errText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
