import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1. Pending milestones due in the next 3 days (or already overdue)
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 3);
    const horizonStr = horizon.toISOString().slice(0, 10);

    const { data: milestones, error } = await supabase
      .from("payment_milestones")
      .select("id, order_id, milestone_name, amount_due, due_date, status")
      .eq("status", "pending")
      .lte("due_date", horizonStr);
    if (error) throw error;
    if (!milestones || milestones.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let inserted = 0;
    for (const m of milestones) {
      // 2. Look up the order to find client_id + title
      const { data: order } = await supabase
        .from("rental_orders")
        .select("client_id, title")
        .eq("id", m.order_id)
        .maybeSingle();
      if (!order?.client_id) continue;

      // 3. Find or create the client's admin conversation
      let { data: convo } = await supabase
        .from("chat_conversations")
        .select("id, unread_count_client")
        .eq("client_id", order.client_id)
        .eq("type", "admin")
        .maybeSingle();
      if (!convo) {
        const { data: created } = await supabase
          .from("chat_conversations")
          .insert({
            client_id: order.client_id,
            type: "admin",
            title: "Evnting Admin",
            last_message: "Welcome",
            last_message_at: new Date().toISOString(),
          })
          .select("id, unread_count_client")
          .single();
        convo = created;
      }
      if (!convo) continue;

      // 4. Idempotency: skip if a system message for this milestone already exists today
      const today = new Date().toISOString().slice(0, 10);
      const { data: existingMsg } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("conversation_id", convo.id)
        .ilike("message", `%${m.id}%`)
        .gte("created_at", today)
        .maybeSingle();
      if (existingMsg) continue;

      // 5. Insert system message
      const dueDate = new Date(m.due_date as string);
      const dayDiff = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const dueLabel = dayDiff < 0 ? `${Math.abs(dayDiff)} day(s) overdue` : dayDiff === 0 ? "today" : `in ${dayDiff} day(s)`;
      const message = `💸 Payment of ₹${(m.amount_due ?? 0).toLocaleString("en-IN")} for "${order.title || "your order"}" is due ${dueLabel}. (Milestone: ${m.milestone_name}, ref ${m.id.slice(0, 8)})`;

      await supabase.from("chat_messages").insert({
        conversation_id: convo.id,
        sender_id: null,
        sender_type: "system",
        message,
        message_type: "system",
        is_read: false,
      });

      // 6. Bump conversation
      await supabase.from("chat_conversations").update({
        last_message: message,
        last_message_at: new Date().toISOString(),
        unread_count_client: ((convo as any).unread_count_client || 0) + 1,
      }).eq("id", convo.id);

      inserted++;
    }

    return new Response(JSON.stringify({ ok: true, processed: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
