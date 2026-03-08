import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const vendorActionSchema = z.object({
  token: z.string().min(1, "Token is required"),
  action: z.enum(["accept", "quote", "decline"], { errorMap: () => ({ message: "Invalid action. Use 'accept', 'quote', or 'decline'" }) }),
  quote_amount: z.number().positive("Quote amount must be positive").optional(),
  vendor_response: z.string().max(1000, "Response must be under 1000 characters").optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const parsed = vendorActionSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0]?.message || "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { token, action, quote_amount, vendor_response } = parsed.data;

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
    } else if (action === "decline") {
      updateData.status = "declined";
      updateData.vendor_response = vendor_response || "Declined";
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
          : action === "quote"
          ? "Quote submitted successfully! The Evnting team will review and get back to you."
          : "Order declined. The Evnting team has been notified.",
        order_title: order.title,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Vendor action error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
