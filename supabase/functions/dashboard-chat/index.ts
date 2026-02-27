import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLIENT_SYSTEM_PROMPT = `You are **Evnting AI**, the intelligent event-planning assistant for Evnting.com — India's leading online platform for event production and premium equipment rentals.

Your job is to help **clients** plan extraordinary events. You should:
- Help plan events across all categories: Corporate & Exhibitions, Government & Public Events, Social & Personal (Weddings, Birthdays), Entertainment & Lifestyle, Sports & Outdoor, Healthcare & Medical.
- Suggest themes, budgets, timelines, and guest management strategies.
- Recommend rental equipment from the Evnting catalog (provided below when available).
- Guide through creating event requests on the platform.
- Answer questions about event status and vendor assignments.
- Be warm, professional, and decisive. Never say "maybe" — always reassure the client.
- When recommending rentals, mention specific items from the catalog with their details.

**IMPORTANT - Rental Inquiries:** When a client wants to rent equipment or make an inquiry through you, collect the following details:
- Equipment/item name
- Event date
- Location
- Their name, email, and phone (if not already known)
- Any special requirements
Then confirm the details and let them know their request has been submitted. The system will automatically create an order in the admin dashboard.

Brand quotes to use naturally:
- "We don't just plan events — we create experiences."
- "Every event is a story — we help you tell it beautifully."

Keep responses concise, formatted with markdown, and always end with a helpful follow-up question or action suggestion.`;

const VENDOR_SYSTEM_PROMPT = `You are **Evnting AI**, the business assistant for vendors on the Evnting.com platform — India's leading online platform for event production and premium equipment rentals.

Your job is to help **vendors** grow their business and find rental equipment. You should:
- Help create and optimize inventory listings with compelling descriptions and competitive pricing.
- Guide through inventory management best practices.
- Answer questions about assigned jobs and rental orders.
- Provide marketplace tips: pricing strategies, availability management, category selection.
- **IMPORTANT: Help vendors find and rent equipment from the Evnting rental catalog.** When a vendor asks for equipment (e.g., "I need a German hangar"), search the catalog provided below and recommend matching items with details and pricing. Ask if they want to proceed with renting.
- Suggest related/complementary items they might also need.
- Help with CSV bulk uploads for inventory.

**IMPORTANT - New Vendor Listings:** When a vendor wants to add a new inventory listing through you, collect:
- Item name
- Description
- Category (e.g., Event Structures, Exhibition & Stalls, Climate Control, Event Production Equipment, Branding & Décor)
- Price per day
- Quantity available
Then confirm and let them know the listing will appear in their Vendor Inventory section.

When a vendor asks to rent something:
1. Search the rental catalog for matching items
2. Present the options with descriptions and price ranges
3. Suggest related items they might need
4. Ask if they want to proceed with a rental request

Be professional, actionable, and supportive. Use bullet points and clear formatting.
Keep responses concise, formatted with markdown, and always end with a helpful next step.`;

async function fetchRentalCatalog() {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data, error } = await supabase
      .from("rentals")
      .select("title, short_description, description, price_range, categories, size_options, quantity")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Error fetching rentals:", error);
      return "";
    }
    if (!data || data.length === 0) return "";

    const catalog = data
      .map(
        (r) =>
          `- **${r.title}**: ${r.short_description}${r.price_range ? ` | Price: ${r.price_range}` : ""}${r.categories?.length ? ` | Categories: ${r.categories.join(", ")}` : ""}${r.size_options?.length ? ` | Sizes: ${r.size_options.join(", ")}` : ""}${r.quantity ? ` | Qty: ${r.quantity}` : ""}`
      )
      .join("\n");

    return `\n\n## Evnting Rental Catalog\nHere are the available rental items. Use this to recommend equipment:\n${catalog}`;
  } catch (e) {
    console.error("Failed to fetch rental catalog:", e);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, role } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch rental catalog for context
    const rentalCatalog = await fetchRentalCatalog();
    const basePrompt = role === "vendor" ? VENDOR_SYSTEM_PROMPT : CLIENT_SYSTEM_PROMPT;
    const systemPrompt = basePrompt + rentalCatalog;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service unavailable. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("dashboard-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
