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
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET not configured");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase credentials not configured");

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,   // rental_orders.id (our DB UUID)
      phone,
      name,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Signature verification ---
    // Razorpay signs: razorpay_order_id + "|" + razorpay_payment_id
    // using HMAC-SHA256 with the key secret.
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(keySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(body)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch", { expected: expectedSignature, received: razorpay_signature });
      return new Response(
        JSON.stringify({ success: false, error: "Payment signature verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Signature valid — update database ---
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mark order as confirmed
    const { error: orderError } = await supabase
      .from("rental_orders")
      .update({ status: "confirmed" })
      .eq("id", order_id);

    if (orderError) {
      console.error("Order update error:", orderError);
      throw orderError;
    }

    // Mark first payment milestone as paid
    const { error: milestoneError } = await supabase
      .from("payment_milestones")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", order_id)
      .eq("milestone_order", 1);

    if (milestoneError) {
      console.error("Milestone update error:", milestoneError);
      throw milestoneError;
    }

    // --- Fire WhatsApp confirmation via Meta API ---
    if (phone) {
      try {
        const cleanPhone = phone.replace(/\D/g, "");
        const wa_phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: wa_phone,
            template_name: "payment_received",
            template_params: [name || "Customer", String(amount_due), order_id.slice(0, 8).toUpperCase()],
            recipient_name: name,
            recipient_type: "customer",
          }),
        });
      } catch (waErr) {
        console.error("WhatsApp notification failed:", waErr);
      }
    }

    console.log(`Payment verified for order ${order_id}, payment ${razorpay_payment_id}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-razorpay-payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
