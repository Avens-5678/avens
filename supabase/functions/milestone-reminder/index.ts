import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find milestones due in 3 days that are still pending
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const targetDate = threeDaysFromNow.toISOString().split("T")[0];

    const today = new Date().toISOString().split("T")[0];

    // Get pending milestones due in 3 days OR overdue
    const { data: milestones, error } = await supabase
      .from("payment_milestones")
      .select("*, rental_orders!inner(id, title, client_name, client_phone, client_email, event_date, location)")
      .eq("status", "pending")
      .lte("due_date", targetDate)
      .order("due_date", { ascending: true });

    if (error) throw error;

    const results: { milestone_id: string; action: string; success: boolean }[] = [];

    for (const milestone of milestones || []) {
      const order = (milestone as any).rental_orders;
      const isOverdue = milestone.due_date && milestone.due_date < today;

      // Mark overdue
      if (isOverdue && milestone.status === "pending") {
        await supabase
          .from("payment_milestones")
          .update({ status: "overdue", updated_at: new Date().toISOString() })
          .eq("id", milestone.id);
      }

      // Send WhatsApp reminder if client has a phone number
      if (order?.client_phone) {
        try {
          const daysLabel = isOverdue ? "overdue" : "due in 3 days";
          await supabase.functions.invoke("wati-whatsapp", {
            body: {
              action: "send_template",
              phone: order.client_phone,
              template: "payment_reminder",
              params: [
                order.client_name || "Customer",
                milestone.milestone_name,
                `₹${milestone.amount_due.toLocaleString("en-IN")}`,
                order.title || "your booking",
                daysLabel,
              ],
            },
          });
          results.push({ milestone_id: milestone.id, action: "whatsapp_sent", success: true });
        } catch (err) {
          console.error("WhatsApp reminder failed for milestone:", milestone.id, err);
          results.push({ milestone_id: milestone.id, action: "whatsapp_failed", success: false });
        }
      }
    }

    return new Response(
      JSON.stringify({
        processed: milestones?.length || 0,
        results,
        checked_date: targetDate,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Milestone reminder error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
