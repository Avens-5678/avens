import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

      const baseUrl = req.headers.get("origin") || "https://avens.lovable.app";
      const acceptUrl = `${baseUrl}/vendor/action?token=${order.action_token}&action=accept`;
      const quoteUrl = `${baseUrl}/vendor/action?token=${order.action_token}&action=quote`;

      // Build WhatsApp message
      const message = `🎪 *New Rental Order from Evnting*\n\nHi ${vendorName || "Vendor"},\n\n📦 *Order:* ${order.title}\n📁 *Category:* ${order.equipment_category}\n📍 *Location:* ${order.location || "TBD"}\n📅 *Event Date:* ${order.event_date || "TBD"}\n💰 *Budget:* ${order.budget || "Negotiable"}\n\n📋 *Details:* ${order.equipment_details || "See order for details"}\n\n👉 *Accept this order:*\n${acceptUrl}\n\n💬 *Send a quote:*\n${quoteUrl}\n\nThank you for partnering with Evnting!`;

      let whatsappSent = false;

      // Send via Wati API if configured
      if (watiApiKey && watiApiUrl) {
        try {
          const watiResponse = await fetch(
            `${watiApiUrl}/api/v1/sendSessionMessage/${vendorPhone}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${watiApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ messageText: message }),
            }
          );

          if (watiResponse.ok) {
            whatsappSent = true;
          } else {
            console.error("Wati API error:", await watiResponse.text());
          }
        } catch (watiError) {
          console.error("Wati API call failed:", watiError);
        }
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
            : "Order updated. Configure WATI_API_KEY and WATI_API_URL to enable WhatsApp messaging.",
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
