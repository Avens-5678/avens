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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const watiApiKey = Deno.env.get("WATI_API_KEY");
    const watiApiUrl = Deno.env.get("WATI_API_URL");

    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
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

    const { action, orderId, vendorPhone, vendorName, orderDetails } = await req.json();

    if (action === "send_to_vendor") {
      // Get the order
      const { data: order, error: orderError } = await supabaseAdmin
        .from("rental_orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const baseUrl = req.headers.get("origin") || "https://evnting.com";
      const acceptUrl = `${baseUrl}/vendor/action?token=${order.action_token}&action=accept`;
      const quoteUrl = `${baseUrl}/vendor/action?token=${order.action_token}&action=quote`;

      let whatsappSent = false;
      let watiError = "";

      // Send via Wati API if configured
      if (watiApiKey && watiApiUrl) {
        try {
          const phone = vendorPhone.replace(/[^0-9]/g, "");
          const cleanBaseUrl = watiApiUrl.replace(/\/+$/, "");
          const watiAuthToken = watiApiKey.startsWith("Bearer ") ? watiApiKey : watiApiKey;

          // Use v1 endpoint: POST /api/v1/sendTemplateMessage/{whatsappNumber}
          const watiResponse = await fetch(
            `${cleanBaseUrl}/api/v1/sendTemplateMessage/${phone}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${watiAuthToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                template_name: "vendor_order_notification",
                broadcast_name: `order_${orderId}`,
                parameters: [
                  { name: "vendor_name", value: vendorName || "Vendor" },
                  { name: "order_title", value: order.title || "New Order" },
                  { name: "category", value: order.equipment_category || "General" },
                  { name: "location", value: order.location || "TBD" },
                  { name: "event_date", value: order.event_date || "TBD" },
                  { name: "budget", value: order.budget || "Negotiable" },
                  { name: "accept_url", value: acceptUrl },
                  { name: "quote_url", value: quoteUrl },
                ],
              }),
            }
          );

          if (watiResponse.ok) {
            whatsappSent = true;
          } else {
            const errText = await watiResponse.text();
            console.error("Wati API error:", watiResponse.status, errText);
            watiError = `WATI API returned ${watiResponse.status}: ${errText || "empty response"}`;
          }
        } catch (err) {
          console.error("Wati API call failed:", err);
          watiError = `WATI API call failed: ${err.message || String(err)}`;
        }
      } else {
        watiError = "WATI_API_KEY and WATI_API_URL not configured.";
      }

      // Update order status
      await supabaseAdmin
        .from("rental_orders")
        .update({
          status: "sent_to_vendors",
          whatsapp_sent_at: whatsappSent ? new Date().toISOString() : null,
        })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({
          success: true,
          whatsapp_sent: whatsappSent,
          message: whatsappSent
            ? "WhatsApp message sent successfully"
            : `Order updated but WhatsApp failed. ${watiError}`,
          accept_url: acceptUrl,
          quote_url: quoteUrl,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
