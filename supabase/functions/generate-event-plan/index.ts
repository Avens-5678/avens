import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json();
    const { event_type, event_date, guest_count, city, budget_min, budget_max, vibe, special_requirements, plan_id } = body;

    // Fetch available inventory for this city
    const { data: equipment } = await supabase
      .from("vendor_inventory")
      .select("id, name, description, categories, price_value, pricing_unit, service_type, address, image_url, quantity")
      .eq("is_available", true)
      .or(`service_type.eq.rental,service_type.is.null`)
      .limit(25);

    const { data: venues } = await supabase
      .from("vendor_inventory")
      .select("id, name, description, categories, price_value, pricing_unit, service_type, address, image_url")
      .eq("is_available", true)
      .eq("service_type", "venue")
      .limit(15);

    const { data: crew } = await supabase
      .from("vendor_inventory")
      .select("id, name, description, categories, price_value, pricing_unit, service_type, image_url")
      .eq("is_available", true)
      .eq("service_type", "crew")
      .limit(15);

    const inventorySummary = {
      equipment: (equipment || []).map((i) => ({
        id: i.id, name: i.name, category: i.categories?.[0] || "General",
        price: i.price_value, unit: i.pricing_unit || "Per Day", qty_available: i.quantity, city: i.address,
      })),
      venues: (venues || []).map((i) => ({
        id: i.id, name: i.name, category: i.categories?.[0] || "Venue",
        price: i.price_value, unit: i.pricing_unit || "Per Day", city: i.address,
      })),
      crew: (crew || []).map((i) => ({
        id: i.id, name: i.name, category: i.categories?.[0] || "Crew",
        price: i.price_value, unit: i.pricing_unit || "Per Event",
      })),
    };

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: `You are Evnting's AI event planner. Create 3 event packages using ONLY items from the provided inventory.

EVENT BRIEF:
- Type: ${event_type}
- Date: ${event_date}
- Guests: ${guest_count}
- City: ${city}
- Budget: ₹${budget_min || 0} — ₹${budget_max || 500000}
- Vibe: ${vibe || "Not specified"}
- Requirements: ${special_requirements || "None"}

AVAILABLE INVENTORY:
${JSON.stringify(inventorySummary, null, 1)}

Create 3 packages: Budget (~65% of max budget), Standard (~85%), Premium (~100%).
Each must use real IDs from the inventory. Quantities should match guest count (e.g. chairs = guests + 10%).
If a category has no inventory, skip it.

Respond with JSON only:
{"packages":[{"name":"string","tier":"budget|standard|premium","venue":{"id":"uuid","name":"string","price":0}|null,"equipment":[{"id":"uuid","name":"string","quantity":1,"price_per_unit":0,"total":0}],"crew":[{"id":"uuid","name":"string","price":0}],"total_cost":0,"description":"Why this works (2 sentences)"}]}`,
        }],
      }),
    });

    if (!claudeResponse.ok) {
      const errBody = await claudeResponse.text();
      console.error("Claude API error:", errBody);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const claudeData = await claudeResponse.json();
    const textContent = claudeData.content?.[0]?.text || "";
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const packages = JSON.parse(jsonMatch[0]);

    // Save to event_plans if plan_id provided
    if (plan_id) {
      await supabase.from("event_plans").update({
        generated_packages: packages.packages || packages,
        status: "generated",
      } as any).eq("id", plan_id);
    }

    return new Response(JSON.stringify({ packages: packages.packages || packages }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("generate-event-plan error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
