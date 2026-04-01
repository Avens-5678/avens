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
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // amount is in INR (rupees). Razorpay requires paise.
    // receipt: callers may pass either `receipt` or `order_id` (legacy)
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));

    const { amount, currency = "INR", receipt, order_id, notes } = body;
    const receiptValue = receipt || order_id; // support both callers

    if (!amount) {
      return new Response(
        JSON.stringify({ error: "amount is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = btoa(`${keyId}:${keySecret}`);

    const razorpayPayload: Record<string, unknown> = {
      amount: Math.round(amount * 100), // convert rupees → paise
      currency,
    };

    if (receiptValue) {
      razorpayPayload.receipt = String(receiptValue).substring(0, 40); // max 40 chars
    }

    if (notes) {
      razorpayPayload.notes = notes;
    }

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(razorpayPayload),
    });

    console.log("Razorpay status:", razorpayResponse.status);
    const razorpayBody = await razorpayResponse.json();
    console.log("Razorpay response:", JSON.stringify(razorpayBody));

    if (!razorpayResponse.ok) {
      return new Response(
        JSON.stringify({
          error: razorpayBody.error?.description || "Razorpay error",
          razorpay_error: razorpayBody,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ razorpay_order_id: razorpayBody.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("create-razorpay-order error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
