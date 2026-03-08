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
    const { quote_id } = await req.json();
    if (!quote_id) {
      return new Response(JSON.stringify({ error: "quote_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch quote
    const { data: quote, error: qErr } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quote_id)
      .single();

    if (qErr || !quote) {
      return new Response(JSON.stringify({ error: "Quote not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!quote.source_order_id) {
      return new Response(
        JSON.stringify({ ok: true, message: "No linked order to sync" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch line items
    const { data: lineItems } = await supabase
      .from("quote_line_items")
      .select("*")
      .eq("quote_id", quote_id)
      .order("display_order", { ascending: true });

    const items = (lineItems || []).map((li: any) => ({
      title: li.item_description,
      quantity: li.quantity,
      pricing_unit: li.unit,
      price_value: li.unit_price,
      total: li.total_price,
    }));

    const summaryText = items
      .map(
        (it: any, i: number) =>
          `${i + 1}. ${it.title} — ${it.quantity} ${it.pricing_unit} × ₹${it.price_value} = ₹${it.total}`
      )
      .join("\n");

    if (quote.source_type === "rental_order") {
      const cartPayload = JSON.stringify({ cart_items: items, synced_from_quote: quote_id });
      const { error } = await supabase
        .from("rental_orders")
        .update({ equipment_details: cartPayload, status: "confirmed" })
        .eq("id", quote.source_order_id);
      if (error) throw error;
    } else if (quote.source_type === "service_order") {
      const detailsText = `[Quote #${quote.quote_number} accepted]\n${summaryText}\nTotal: ₹${quote.total}`;
      const { error } = await supabase
        .from("service_orders")
        .update({ service_details: detailsText, status: "confirmed" })
        .eq("id", quote.source_order_id);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ ok: true, message: "Order synced successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
