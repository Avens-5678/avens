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
    // .trim() removes accidental whitespace/newlines from the Supabase secrets UI
    const keyId = Deno.env.get("RAZORPAY_KEY_ID")?.trim();
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")?.trim();

    // Secret presence diagnostics — safe to log (no actual values exposed)
    console.log("Key ID present:", !!keyId);
    console.log("Key ID prefix:", keyId?.substring(0, 8));
    console.log("Secret present:", !!keySecret);
    console.log("Secret length:", keySecret?.length);

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const body = await req.json();
    console.log("1. Raw body received:", JSON.stringify(body));

    // Debug endpoint — returns credential presence without calling Razorpay
    if (body.debug === true) {
      return new Response(
        JSON.stringify({
          key_id_present: !!keyId,
          key_id_prefix: keyId.substring(0, 8),
          key_id_length: keyId.length,
          secret_present: !!keySecret,
          secret_length: keySecret.length,
          secret_last4: keySecret.slice(-4),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Callers send amount in rupees. Support both `receipt` and legacy `order_id`.
    // currency defaults to INR if omitted.
    const { amount, currency = "INR", receipt, order_id, notes } = body;

    if (!amount) {
      return new Response(
        JSON.stringify({ error: "amount is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amountInPaise = Math.round(amount * 100); // callers send rupees
    console.log("2. Amount in paise:", amountInPaise, "(rupees received:", amount, ")");

    // receipt: prefer explicit, fall back to order_id, then auto-generate
    const receiptValue = (receipt || order_id || `order_${Date.now()}`).substring(0, 40);

    const razorpayPayload: Record<string, unknown> = {
      amount: amountInPaise,
      currency,
      receipt: receiptValue,
    };

    if (notes) {
      razorpayPayload.notes = notes;
    }

    console.log("3. Razorpay payload:", JSON.stringify(razorpayPayload));

    const credentials = btoa(`${keyId}:${keySecret}`);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(razorpayPayload),
    });

    console.log("4. Razorpay status:", razorpayResponse.status);
    const razorpayBody = await razorpayResponse.json();
    console.log("5. Razorpay body:", JSON.stringify(razorpayBody));

    if (!razorpayResponse.ok) {
      return new Response(
        JSON.stringify({
          error: razorpayBody.error?.description || "Razorpay error",
          razorpay_error: razorpayBody,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If caller also wants a payment link (for mobile native apps where
    // the Razorpay checkout modal doesn't work in WKWebView), create one.
    if (body.create_link) {
      const linkPayload: Record<string, unknown> = {
        amount: amountInPaise,
        currency,
        description: body.description || `Evnting Booking`,
        reference_id: receiptValue,
        callback_url: body.callback_url || "https://evnting.com/payment-callback",
        callback_method: "get",
      };
      if (body.customer) {
        linkPayload.customer = body.customer;
      }
      if (notes) {
        linkPayload.notes = notes;
      }

      const linkResponse = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(linkPayload),
      });

      const linkBody = await linkResponse.json();
      console.log("Payment link response:", JSON.stringify({ ok: linkResponse.ok, id: linkBody.id }));

      if (!linkResponse.ok) {
        return new Response(
          JSON.stringify({ error: linkBody.error?.description || "Payment link creation failed", razorpay_error: linkBody }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          razorpay_order_id: razorpayBody.id,
          payment_link_id: linkBody.id,
          payment_link_url: linkBody.short_url,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
