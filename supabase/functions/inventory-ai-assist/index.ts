import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RENTAL_CATEGORIES = [
  "Structures & Venues", "Stages & Platforms", "Lighting & Sound",
  "Furniture", "Climate Control", "Branding & Signage",
  "AV Equipment", "Power & Generators", "Décor", "Others",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, name = "", description = "", category = "", dimensions = {} } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";
    let responseFormat: any = null;

    switch (action) {
      case "polish_description":
        systemPrompt = "You polish and enhance vendor product descriptions for an Indian event rental marketplace. Return ONLY the polished description (no preamble). Keep facts intact, fix grammar, make it engaging, 2-4 sentences. Add useful detail when obvious from context.";
        userPrompt = `Item: ${name}\nCategory: ${category}\nDraft description: ${description}\n\nReturn the polished description only.`;
        break;
      case "suggest_keywords":
        systemPrompt = "You suggest 6-10 search keywords for vendor inventory items. Return JSON: {\"keywords\":[\"...\"]}";
        userPrompt = `Item: ${name}\nDescription: ${description}\nCategory: ${category}`;
        responseFormat = { type: "json_object" };
        break;
      case "suggest_category":
        systemPrompt = `You pick the best category from this list: ${RENTAL_CATEGORIES.join(", ")}. Return JSON: {"category":"..."}`;
        userPrompt = `Item: ${name}\nDescription: ${description}`;
        responseFormat = { type: "json_object" };
        break;
      case "estimate_volume_and_weight":
        systemPrompt = "You estimate logistics for event rental items. Volume units = stacked CBM (cubic meters). Labor weight kg. Return JSON: {\"volume_units\":number, \"labor_weight\":number, \"reasoning\":\"...\"}";
        userPrompt = `Item: ${name}\nCategory: ${category}\nDescription: ${description}\nDimensions: ${JSON.stringify(dimensions)}`;
        responseFormat = { type: "json_object" };
        break;
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        ...(responseFormat ? { response_format: responseFormat } : {}),
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail: text }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content || "";

    let result: any = { text: content };
    if (responseFormat) {
      try { result = JSON.parse(content); } catch { result = { text: content }; }
    }

    return new Response(JSON.stringify({ ok: true, action, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
