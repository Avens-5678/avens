import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RENTAL_CATEGORIES = [
  "Tents & Canopies","German Hangars","Pagoda Tents","Marquees & Shamianas","Geodesic Domes",
  "Trussing & Rigging","Stages & Platforms","Risers & Ramps","Dance Floors","Flooring & Carpets",
  "Exhibition Stalls","Octanorm Booths","Modular Kiosks","Display Counters","Pop-up Displays",
  "Chairs & Seating","Sofa & Lounge Furniture","Tables & Round Tables","Bar Counters & Bar Stools","Cocktail Tables","VIP Furniture","Outdoor Furniture",
  "Line Array Sound Systems","PA Systems","Microphones (Wired/Wireless)","DJ Consoles & Mixers","Conference Audio Systems","Speakers & Monitors",
  "Stage Lighting","Par Cans & LED Pars","Moving Heads","Follow Spots","Truss Lighting","Ambient & Decorative Lighting","Architectural Lighting","Smoke / Haze / Fog Machines",
  "LED Walls & Screens","Projectors & Screens","Video Walls","Live Streaming Equipment","Cameras & Camcorders","Teleprompters","Translation Booths",
  "Air Conditioners (Spot/Cassette)","Air Coolers","Heaters & Patio Warmers","Industrial Fans","Misting Systems",
  "DG Sets / Generators","Power Distribution Boards","Cabling & Extensions","UPS & Inverters","Stabilizers",
  "Backdrops & Step-and-Repeat","Floral Décor","Theme Décor","Drapes & Fabric Décor","Signage & Standees","Flags & Banners","Balloon Décor","Centerpieces",
  "Buffet Counters","Chafing Dishes","Crockery & Cutlery","Glassware","Live Counters","BBQ & Tandoor","Bar Equipment","Refrigeration",
  "Cold Pyro & Sparklers","Confetti & CO2 Cannons","Bubble Machines","Laser Shows",
  "Barricades","Crowd Barriers","Fire Extinguishers","First Aid Kits","Walkie-Talkies","Metal Detectors",
  "Portable Toilets","VIP Restrooms","Hand Wash Stations",
  "Photo Booths","Gaming & Arcade","Inflatables & Bouncy Castles","Carnival Games","VR Experiences",
  "Golf Carts","Buggies","Transport Vehicles",
  "Walkie Stackers","Forklifts","Scissor Lifts","Others",
];

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

function extractJSON(text: string): any | null {
  if (!text) return null;
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return null;
}

async function callClaude(opts: {
  apiKey: string;
  system?: string;
  userText: string;
  imageUrl?: string;
  maxTokens?: number;
}): Promise<string> {
  const content: any[] = [];
  if (opts.imageUrl) {
    try {
      const imgRes = await fetch(opts.imageUrl);
      if (imgRes.ok) {
        const buf = new Uint8Array(await imgRes.arrayBuffer());
        let bin = "";
        for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
        const b64 = btoa(bin);
        const mediaType = imgRes.headers.get("content-type") || "image/jpeg";
        content.push({
          type: "image",
          source: { type: "base64", media_type: mediaType, data: b64 },
        });
      }
    } catch (_) {}
  }
  content.push({ type: "text", text: opts.userText });

  const body: any = {
    model: MODEL,
    max_tokens: opts.maxTokens || 1024,
    messages: [{ role: "user", content }],
  };
  if (opts.system) body.system = opts.system;

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": opts.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data?.content?.[0]?.text || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // verify_jwt:true on the function already validates the caller's JWT.
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      action,
      name = "",
      description = "",
      category = "",
      image_url = "",
    } = await req.json();

    let result: any = {};

    switch (action) {
      case "polish_description": {
        const text = await callClaude({
          apiKey: ANTHROPIC_API_KEY,
          system: "You polish vendor product descriptions for an Indian event rental marketplace. Return ONLY the polished description as plain text — no preamble, no quotes, no markdown. Keep facts intact, fix grammar, make it engaging, 2–4 sentences.",
          userText: `Item: ${name}\nCategory: ${category}\nDraft description: ${description || "(none)"}\n\nReturn the polished description only.`,
          maxTokens: 400,
        });
        result = { text: text.trim() };
        break;
      }
      case "suggest_short_description": {
        const text = await callClaude({
          apiKey: ANTHROPIC_API_KEY,
          system: "You write punchy 8–12 word product taglines for an event rental marketplace. Return ONLY the tagline — no quotes, no preamble.",
          userText: `Item name: ${name}\nCategory: ${category || "(unknown)"}\nWrite the tagline.`,
          maxTokens: 80,
        });
        result = { text: text.trim().replace(/^["']|["']$/g, "") };
        break;
      }
      case "suggest_category": {
        const text = await callClaude({
          apiKey: ANTHROPIC_API_KEY,
          system: `You pick the single best category from this exact list: ${RENTAL_CATEGORIES.join(", ")}. Return ONLY JSON: {"category":"..."}`,
          userText: `Item: ${name}\nDescription: ${description}`,
          maxTokens: 100,
        });
        const parsed = extractJSON(text);
        result = { category: parsed?.category || null };
        break;
      }
      case "suggest_keywords": {
        const text = await callClaude({
          apiKey: ANTHROPIC_API_KEY,
          system: "Suggest 6–10 search keywords for vendor inventory. Return ONLY JSON: {\"keywords\":[\"...\"]}",
          userText: `Item: ${name}\nDescription: ${description}\nCategory: ${category}`,
          maxTokens: 200,
        });
        const parsed = extractJSON(text);
        result = { keywords: parsed?.keywords || [] };
        break;
      }
      case "estimate_logistics": {
        const text = await callClaude({
          apiKey: ANTHROPIC_API_KEY,
          system: "You estimate logistics for event-rental items. volume_units = stacked CBM (cubic meters, decimal). labor_weight = kilograms (integer). Use the image if provided plus typical sizes for similar items in India. Return ONLY JSON: {\"volume_units\":number,\"labor_weight\":number,\"source_notes\":\"short reasoning\"}",
          userText: `Item name: ${name}\nCategory: ${category || "(unknown)"}\nDescription: ${description || "(none)"}\nEstimate the logistics for one unit.`,
          imageUrl: image_url || undefined,
          maxTokens: 300,
        });
        const parsed = extractJSON(text);
        result = parsed || { volume_units: null, labor_weight: null, source_notes: text };
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
