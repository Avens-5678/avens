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
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { token, action, quote_amount, vendor_response } = await req.json();

    if (!token || !action) {
      return new Response(
        JSON.stringify({ error: "Token and action are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find order by action token
    const { data: order, error: orderError } = await supabaseAdmin
      .from("rental_orders")
      .select("*")
      .eq("action_token", token)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (order.status === "confirmed" || order.status === "completed" || order.status === "cancelled") {
      return new Response(
        JSON.stringify({ error: "This order has already been finalized", order_status: order.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const updateData: Record<string, unknown> = {
      vendor_responded_at: new Date().toISOString(),
    };

    if (action === "accept") {
      updateData.status = "accepted";
      updateData.vendor_response = vendor_response || "Accepted";
    } else if (action === "quote") {
      updateData.status = "quoted";
      updateData.vendor_response = vendor_response || "Quote submitted";
      if (quote_amount) {
        updateData.vendor_quote_amount = quote_amount;
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'accept' or 'quote'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("rental_orders")
      .update(updateData)
      .eq("id", order.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: action === "accept"
          ? "Order accepted successfully! The Evnting team will be in touch."
          : "Quote submitted successfully! The Evnting team will review and get back to you.",
        order_title: order.title,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Vendor action error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
