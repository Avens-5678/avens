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

**CRITICAL - Taking Action Immediately:**
You have tools to create rental orders and form submissions. As soon as the client provides enough information and says "yes" or confirms, IMMEDIATELY call the appropriate tool. Do NOT wait for more messages. Do NOT ask "shall I proceed?" after they already confirmed.

- For rental inquiries: Call create_rental_order with whatever details you have. Missing fields are okay.
- For event planning inquiries: Call create_form_submission with whatever details you have.
- If you only have partial info (e.g. just the item name), still call the tool — partial data is fine.

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
- Suggest related/complementary items they might also need.
- Help with CSV bulk uploads for inventory.

**CRITICAL - Taking Action Immediately:**
You have tools to create vendor listings and rental orders. As soon as the vendor provides enough information and confirms, IMMEDIATELY call the appropriate tool. Do NOT wait. Do NOT ask "shall I proceed?" after they already said yes.

- For new listings: Call create_vendor_listing with whatever details you have.
- For rental requests: Call create_rental_order with the details.
- Partial data is fine — call the tool right away.

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

    // First call: may return tool calls or content
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
          tools: TOOLS,
          stream: false, // Non-streaming for tool call detection
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

    const result = await response.json();
    const choice = result.choices?.[0];
    const assistantMessage = choice?.message;

    // Check if there are tool calls
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: Array<{ name: string; result: unknown }> = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const fnName = toolCall.function.name;
        let fnArgs: Record<string, unknown>;
        try {
          fnArgs = JSON.parse(toolCall.function.arguments);
        } catch {
          fnArgs = {};
        }

        console.log(`Executing tool: ${fnName}`, fnArgs);
        const toolResult = await executeToolCall(fnName, fnArgs, userId);
        toolResults.push({ name: fnName, result: toolResult });
      }

      // Build tool result messages for the follow-up
      const toolMessages = assistantMessage.tool_calls.map((tc: any, i: number) => ({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(toolResults[i].result),
      }));

      // Second call: get the final response after tool execution (streaming)
      const followUpResponse = await fetch(
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
              assistantMessage,
              ...toolMessages,
            ],
            stream: true,
          }),
        }
      );

      if (!followUpResponse.ok) {
        // Fallback: return a simple confirmation
        const confirmations = toolResults.map(tr => {
          const r = tr.result as any;
          if (r.success) {
            if (r.type === "rental_order") return "✅ **Rental inquiry submitted successfully!** Our team will review it shortly.";
            if (r.type === "form_submission") return "✅ **Inquiry submitted successfully!** We'll get back to you soon.";
            if (r.type === "vendor_listing") return "✅ **Listing created successfully!** Check your Vendor Inventory to see it.";
          }
          return `⚠️ Could not complete action: ${r.error}`;
        });

        // Return as SSE format for frontend compatibility
        const text = confirmations.join("\n\n");
        const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;
        return new Response(sseData, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      // Prepend action markers before the stream so frontend knows what happened
      const actionMarkers = toolResults.map(tr => {
        const r = tr.result as any;
        return `data: ${JSON.stringify({ choices: [{ delta: { content: "" } }], action: { type: r.type, success: r.success, id: r.id, error: r.error } })}\n\n`;
      }).join("");

      // Create a combined stream: action markers + AI response stream
      const encoder = new TextEncoder();
      const markerBytes = encoder.encode(actionMarkers);
      
      const combinedStream = new ReadableStream({
        async start(controller) {
          // Send action markers first
          controller.enqueue(markerBytes);
          
          // Then pipe the AI response
          const reader = followUpResponse.body!.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } finally {
            controller.close();
          }
        },
      });

      return new Response(combinedStream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls — stream a regular response
    const streamResponse = await fetch(
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

    if (!streamResponse.ok) {
      const text = await streamResponse.text();
      console.error("AI stream error:", streamResponse.status, text);
      return new Response(
        JSON.stringify({ error: "AI service unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(streamResponse.body, {
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
