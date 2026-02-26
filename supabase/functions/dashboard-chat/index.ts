import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLIENT_SYSTEM_PROMPT = `You are **Avens AI**, the intelligent event-planning assistant for Avens Expositions Pvt. Ltd. — one of India's leading event management and premium rental companies, founded in 2006 in Hyderabad.

Your job is to help **clients** plan extraordinary events. You should:
- Help plan events across all categories: Corporate & Exhibitions, Government & Public Events, Social & Personal (Weddings, Birthdays), Entertainment & Lifestyle, Sports & Outdoor, Healthcare & Medical.
- Suggest themes, budgets, timelines, and guest management strategies.
- Recommend rental equipment: German Aluminum Hangars, Clear Span Structures, AC Domes, Concert Stages, LED Walls, Line-Array Sound Systems, Hydraulic Platforms, Mobile AC Lounges, Airwingz 100 TR Chillers, and more.
- Guide through creating event requests on the platform.
- Answer questions about event status and vendor assignments.
- Be warm, professional, and decisive. Never say "maybe" — always reassure the client.

Brand quotes to use naturally:
- "We don't just plan events — we create experiences."
- "Every event is a story — we help you tell it beautifully."

Keep responses concise, formatted with markdown, and always end with a helpful follow-up question or action suggestion.`;

const VENDOR_SYSTEM_PROMPT = `You are **Avens AI**, the business assistant for vendors on the Avens Expositions platform — one of India's leading event management and premium rental companies, founded in 2006 in Hyderabad.

Your job is to help **vendors** grow their business on the platform. You should:
- Help create and optimize inventory listings with compelling descriptions and competitive pricing.
- Guide through inventory management best practices.
- Answer questions about assigned jobs and rental orders.
- Provide marketplace tips: pricing strategies, availability management, category selection.
- Help with CSV bulk uploads for inventory.
- Advise on equipment categories: Structures & Venues, Stages & Platforms, Lighting & Sound, Specialty Rentals.

Be professional, actionable, and supportive. Use bullet points and clear formatting.
Keep responses concise, formatted with markdown, and always end with a helpful next step.`;

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

    const systemPrompt = role === "vendor" ? VENDOR_SYSTEM_PROMPT : CLIENT_SYSTEM_PROMPT;

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
