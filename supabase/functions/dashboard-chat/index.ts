import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOOLS = [
  {
    type: "function",
    function: {
      name: "create_rental_order",
      description: "Create a rental order / inquiry from a client. Call this as soon as the client confirms they want to proceed with renting equipment.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short title for the order, e.g. 'German Hangar Rental'" },
          equipment_category: { type: "string", description: "Category like Event Structures, Climate Control, Event Production Equipment, Branding & Décor, etc." },
          equipment_details: { type: "string", description: "Detailed description of what is needed" },
          location: { type: "string", description: "Event location" },
          event_date: { type: "string", description: "Event date in YYYY-MM-DD format" },
          client_name: { type: "string", description: "Client's name" },
          client_email: { type: "string", description: "Client's email" },
          client_phone: { type: "string", description: "Client's phone number" },
          budget: { type: "string", description: "Budget range if mentioned" },
          notes: { type: "string", description: "Any special requirements or notes" },
        },
        required: ["title", "equipment_category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_form_submission",
      description: "Submit a general inquiry or event planning request from a client. Call this when the client wants to submit an event planning inquiry.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Client's name" },
          email: { type: "string", description: "Client's email" },
          phone: { type: "string", description: "Client's phone" },
          event_type: { type: "string", description: "Type of event" },
          event_date: { type: "string", description: "Event date in YYYY-MM-DD format" },
          location: { type: "string", description: "Event location" },
          message: { type: "string", description: "Details about the inquiry" },
        },
        required: ["name", "email", "message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_vendor_listing",
      description: "Create a new inventory listing for a vendor. Call this when the vendor confirms they want to add a new item to their inventory.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Item name" },
          description: { type: "string", description: "Item description" },
          category: { type: "string", description: "Category like Event Structures, Exhibition & Stalls, Climate Control, Event Production Equipment, Branding & Décor" },
          price_per_day: { type: "number", description: "Price per day in INR" },
          quantity: { type: "integer", description: "Quantity available" },
        },
        required: ["name", "category"],
      },
    },
  },
];

const CLIENT_SYSTEM_PROMPT = `You are **Evnting AI**, the intelligent event-planning assistant for Evnting.com — India's leading online platform for event production and premium equipment rentals.

Your job is to help **clients** plan extraordinary events. You should:
- Help plan events across all categories: Corporate & Exhibitions, Government & Public Events, Social & Personal (Weddings, Birthdays), Entertainment & Lifestyle, Sports & Outdoor, Healthcare & Medical.
- Suggest themes, budgets, timelines, and guest management strategies.
- Recommend rental equipment from the Evnting catalog (provided below when available).
- Guide through creating event requests on the platform.
- Answer questions about event status and vendor assignments.
- Be warm, professional, and decisive. Never say "maybe" — always reassure the client.
- When recommending rentals, mention specific items from the catalog with their details.

## MANDATORY DATA COLLECTION
Before submitting ANY request (rental order or event inquiry), you MUST have collected these from the user:
1. **Name** — Ask: "May I have your name?"
2. **Phone Number** — Ask: "What's your phone number so our team can reach you?"
3. **Address/Location** — Ask: "Where will the event take place?" or "What's your city/address?"
If ANY of these are missing when the user wants to proceed, proactively ask for them BEFORE calling any tool.

## CATALOG STRICT GROUNDING (Rentals)
- You may ONLY confirm rental items that exist in the catalog provided below.
- If the user asks for something using a non-standard name (e.g., "couches" instead of "sofas", "tent" instead of "German Hangar"), search the catalog for the closest match and ask: "I found **[Exact Catalog Item Name]** in our catalog. Is this what you meant?"
- NEVER invent items or confirm availability of items not in the catalog. If no match exists, say: "I couldn't find that exact item in our current catalog. Let me submit an inquiry for our team to check."

## NO UPSELLING DURING CART BUILDING
- While the user is actively adding items to their request, do NOT suggest additional items.
- Only after the user says they are done (e.g., "that's all", "I'm done", "submit it") may you suggest logical add-ons: "Since you're renting a German Hangar, you might also need AC units or flooring. Would you like to add any?"

## SERVICE REQUEST RECOGNITION
- Recognize when a user is asking for a FULL EVENT SERVICE (e.g., "I'm planning a wedding", "I need to organize a corporate conference", "help me plan a birthday party").
- For full-service requests, trigger the Service Request flow by asking event-specific questions in order:
  1. Event type (if not already clear)
  2. Event date
  3. Expected guest count
  4. Venue/location
  5. Budget range
  6. Special requirements or theme preferences
- Then call create_form_submission with all collected data.

## TAKING ACTION
You have tools to create rental orders and form submissions. Once you have collected Name, Phone, and Location AND the client confirms:
- For rental inquiries: Call create_rental_order with all collected details.
- For event planning inquiries: Call create_form_submission with all collected details.
- Do NOT ask "shall I proceed?" after they already confirmed — just call the tool.

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
- Help vendors find and rent equipment from the Evnting rental catalog.
- Help with CSV bulk uploads for inventory.

## MANDATORY DATA COLLECTION
Before submitting ANY request (rental order or listing), you MUST have collected:
1. **Name** — The vendor's name or business name
2. **Phone Number** — For coordination
3. **Address/Location** — Godown or business address
If ANY are missing, ask for them before calling tools.

## CATALOG STRICT GROUNDING
- When vendors search for equipment to rent, only confirm items from the catalog.
- Use fuzzy matching: if they say "big tent", match to "German Tent (40m Width)" and ask for confirmation.
- Never confirm items not in the catalog.

## SERVICE REQUEST RECOGNITION
- If a vendor says "I need to organize an event" or similar, guide them through the event request flow (event type, date, guests, location, budget, requirements).

## TAKING ACTION
Once you have Name, Phone, and Location AND the vendor confirms:
- For new listings: Call create_vendor_listing with all details.
- For rental requests: Call create_rental_order with all details.
- Do NOT ask "shall I proceed?" after confirmation.

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

async function syncToZoho(endpoint: string, body: Record<string, unknown>) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const url = `${supabaseUrl}/functions/v1/${endpoint}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
        "apikey": serviceKey,
      },
      body: JSON.stringify(body),
    });
    const result = await resp.json();
    console.log(`Zoho sync (${endpoint}):`, result?.message || result);
  } catch (e) {
    console.error(`Zoho sync (${endpoint}) failed:`, e);
  }
}

async function executeToolCall(functionName: string, args: Record<string, unknown>, vendorId?: string) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  switch (functionName) {
    case "create_rental_order": {
      const { data, error } = await supabase
        .from("rental_orders")
        .insert({
          title: (args.title as string) || "Chatbot Inquiry",
          equipment_category: (args.equipment_category as string) || "General",
          equipment_details: args.equipment_details as string,
          location: args.location as string,
          event_date: args.event_date as string,
          client_name: args.client_name as string,
          client_email: args.client_email as string,
          client_phone: args.client_phone as string,
          budget: args.budget as string,
          notes: `[Via AI Chatbot] ${args.notes || ""}`.trim(),
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating rental order:", error);
        return { success: false, error: error.message };
      }

      // Sync to Zoho CRM Products (fire-and-forget)
      syncToZoho("zoho-crm-inventory", {
        action: "create",
        item: {
          name: `Order: ${args.title || "Chatbot Inquiry"}`,
          description: `Category: ${args.equipment_category || ""}\nDetails: ${args.equipment_details || ""}\nClient: ${args.client_name || ""}\nPhone: ${args.client_phone || ""}\nEmail: ${args.client_email || ""}\nBudget: ${args.budget || ""}`,
          price_value: 0,
          quantity: 1,
          category: args.equipment_category,
          is_available: true,
          address: args.location,
        },
      });

      return { success: true, id: data.id, type: "rental_order" };
    }

    case "create_form_submission": {
      const { data, error } = await supabase
        .from("form_submissions")
        .insert({
          form_type: "chatbot_inquiry",
          name: (args.name as string) || "Chatbot User",
          email: (args.email as string) || "via-chatbot@evnting.com",
          phone: args.phone as string,
          event_type: args.event_type as string,
          event_date: args.event_date as string,
          location: args.location as string,
          message: (args.message as string) || "Inquiry submitted via AI chatbot",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating form submission:", error);
        return { success: false, error: error.message };
      }

      // Sync to Zoho CRM Form_Submissions module (fire-and-forget)
      syncToZoho("zoho-crm-requests", {
        requestType: "event_request",
        data: {
          client_name: args.name || "Chatbot User",
          client_email: args.email || "via-chatbot@evnting.com",
          client_phone: args.phone,
          event_type: args.event_type,
          event_date: args.event_date,
          location: args.location,
          requirements: args.message || "Inquiry via AI chatbot",
        },
      });

      return { success: true, id: data.id, type: "form_submission" };
    }

    case "create_vendor_listing": {
      if (!vendorId) {
        return { success: false, error: "Vendor ID not available" };
      }
      const { data, error } = await supabase
        .from("vendor_inventory")
        .insert({
          vendor_id: vendorId,
          name: (args.name as string) || "New Item",
          description: args.description as string,
          category: (args.category as string) || "General",
          price_per_day: args.price_per_day as number,
          quantity: (args.quantity as number) || 1,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating vendor listing:", error);
        return { success: false, error: error.message };
      }

      // Sync to Zoho CRM Products (fire-and-forget)
      syncToZoho("zoho-crm-inventory", {
        action: "create",
        item: {
          name: args.name || "New Item",
          description: args.description,
          category: args.category || "General",
          price_value: args.price_per_day,
          quantity: args.quantity || 1,
        },
      });

      return { success: true, id: data.id, type: "vendor_listing" };
    }

    default:
      return { success: false, error: "Unknown function" };
  }
}

// Convert OpenAI-style TOOLS to Anthropic tool format
const ANTHROPIC_TOOLS = TOOLS.map((t: any) => ({
  name: t.function.name,
  description: t.function.description,
  input_schema: t.function.parameters,
}));

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

// Convert OpenAI-style chat messages to Anthropic format.
// Returns { system, messages } where system is a string and messages have user/assistant turns.
function toAnthropicMessages(systemPrompt: string, oaMessages: any[]) {
  const out: any[] = [];
  for (const m of oaMessages) {
    if (m.role === "system") continue; // handled separately
    if (m.role === "user" || m.role === "assistant") {
      out.push({ role: m.role, content: typeof m.content === "string" ? m.content : (m.content || "") });
    }
  }
  return { system: systemPrompt, messages: out };
}

async function callAnthropic(payload: any): Promise<any> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Anthropic ${res.status}: ${t}`);
  }
  return res.json();
}

function sseFromText(text: string, prelude = ""): Response {
  const lines: string[] = [];
  if (prelude) lines.push(prelude);
  lines.push(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`);
  lines.push(`data: [DONE]\n\n`);
  return new Response(lines.join(""), { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
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

    // Extract user ID from auth token for vendor operations
    let userId: string | undefined;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!
        );
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      } catch (e) {
        console.error("Error extracting user:", e);
      }
    }

    // Fetch rental catalog for context
    const rentalCatalog = await fetchRentalCatalog();
    const basePrompt = role === "vendor" ? VENDOR_SYSTEM_PROMPT : CLIENT_SYSTEM_PROMPT;
    const systemPrompt = basePrompt + rentalCatalog;

    const { system, messages: anthropicMessages } = toAnthropicMessages(systemPrompt, messages);

    // First Anthropic call — may stop with tool_use
    const first = await callAnthropic({
      model: ANTHROPIC_MODEL,
      max_tokens: 1500,
      system,
      tools: ANTHROPIC_TOOLS,
      messages: anthropicMessages,
    });

    const firstBlocks: any[] = first?.content || [];
    const toolUses = firstBlocks.filter((b) => b.type === "tool_use");

    // No tools requested — return assistant text as SSE
    if (toolUses.length === 0) {
      const text = firstBlocks.filter((b) => b.type === "text").map((b) => b.text).join("");
      return sseFromText(text || "");
    }

    // Execute each tool call
    const toolResults: Array<{ name: string; result: any; tool_use_id: string }> = [];
    for (const tu of toolUses) {
      const r = await executeToolCall(tu.name, tu.input || {}, userId);
      toolResults.push({ name: tu.name, result: r, tool_use_id: tu.id });
    }

    // Build the follow-up: assistant turn (the original blocks) + user turn with tool_result blocks
    const followupMessages = [
      ...anthropicMessages,
      { role: "assistant", content: firstBlocks },
      {
        role: "user",
        content: toolResults.map((tr) => ({
          type: "tool_result",
          tool_use_id: tr.tool_use_id,
          content: JSON.stringify(tr.result),
        })),
      },
    ];

    let finalText = "";
    try {
      const second = await callAnthropic({
        model: ANTHROPIC_MODEL,
        max_tokens: 1500,
        system,
        tools: ANTHROPIC_TOOLS,
        messages: followupMessages,
      });
      finalText = (second?.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
    } catch (_) {
      // Fallback confirmation messages
      finalText = toolResults.map((tr) => {
        const r = tr.result as any;
        if (r?.success) {
          if (r.type === "rental_order") return "✅ **Rental inquiry submitted successfully!** Our team will review it shortly.";
          if (r.type === "form_submission") return "✅ **Inquiry submitted successfully!** We'll get back to you soon.";
          if (r.type === "vendor_listing") return "✅ **Listing created successfully!** Check your Vendor Inventory to see it.";
          return "✅ Done.";
        }
        return `⚠️ Could not complete action: ${r?.error || "unknown"}`;
      }).join("\n\n");
    }

    // Prepend action markers (frontend uses these for UI affordances)
    const actionMarkers = toolResults.map((tr) => {
      const r = tr.result as any;
      return `data: ${JSON.stringify({ choices: [{ delta: { content: "" } }], action: { type: r?.type, success: r?.success, id: r?.id, error: r?.error } })}\n\n`;
    }).join("");

    return sseFromText(finalText, actionMarkers);
  } catch (e) {
    console.error("dashboard-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
