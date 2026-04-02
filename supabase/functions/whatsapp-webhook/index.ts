import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const metaToken = Deno.env.get("META_WHATSAPP_TOKEN");
  const phoneNumberId = Deno.env.get("META_PHONE_NUMBER_ID");
  const verifyToken = Deno.env.get("META_WHATSAPP_VERIFY_TOKEN") || Deno.env.get("META_WEBHOOK_VERIFY_TOKEN");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // GET = webhook verification from Meta
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Webhook verified successfully");
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // POST = incoming messages
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // Handle message status updates (delivery receipts)
      if (value?.statuses) {
        for (const status of value.statuses) {
          const phone = status.recipient_id;
          const messageStatus = status.status; // sent, delivered, read, failed
          const metaMsgId = status.id;

          // Update campaign recipient status
          if (messageStatus === "delivered") {
            await supabase
              .from("whatsapp_campaign_recipients")
              .update({ status: "delivered", delivered_at: new Date().toISOString() })
              .eq("phone_number", phone)
              .eq("status", "sent");
          } else if (messageStatus === "read") {
            await supabase
              .from("whatsapp_campaign_recipients")
              .update({ status: "read", read_at: new Date().toISOString() })
              .eq("phone_number", phone)
              .in("status", ["sent", "delivered"]);
          } else if (messageStatus === "failed") {
            await supabase
              .from("whatsapp_campaign_recipients")
              .update({ status: "failed", error_message: status.errors?.[0]?.title || "Unknown error" })
              .eq("phone_number", phone)
              .eq("status", "pending");
          }

          // Also update whatsapp_message_logs for delivery tracking
          if (metaMsgId) {
            const logUpdate: Record<string, any> = { status: messageStatus };
            if (messageStatus === "delivered") logUpdate.delivered_at = new Date().toISOString();
            if (messageStatus === "read") logUpdate.read_at = new Date().toISOString();
            if (messageStatus === "failed") logUpdate.error_message = status.errors?.[0]?.title || "Unknown error";
            await supabase
              .from("whatsapp_message_logs")
              .update(logUpdate)
              .eq("meta_message_id", metaMsgId);
          }
        }
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // Handle incoming messages
      if (!value?.messages?.[0]) {
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      const message = value.messages[0];
      const from = message.from; // sender phone number
      const msgBody = message.text?.body?.trim() || "";
      const msgLower = msgBody.toLowerCase();

      console.log(`Incoming message from ${from}: ${msgBody}`);

      // Get or create session
      let { data: session } = await supabase
        .from("whatsapp_sessions")
        .select("*")
        .eq("phone_number", from)
        .single();

      if (!session) {
        const { data: newSession } = await supabase
          .from("whatsapp_sessions")
          .insert({ phone_number: from, current_flow: "idle" })
          .select()
          .single();
        session = newSession;
      } else {
        await supabase
          .from("whatsapp_sessions")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", session.id);
      }

      // Detect user type from profiles
      if (!session.user_type || session.user_type === "customer") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("phone", from)
          .single();

        if (profile) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.user_id)
            .single();

          if (roleData) {
            await supabase
              .from("whatsapp_sessions")
              .update({ user_id: profile.user_id, user_type: roleData.role })
              .eq("id", session.id);
            session.user_type = roleData.role;
            session.user_id = profile.user_id;
          }
        }
      }

      // Update/create contact
      await supabase
        .from("whatsapp_contacts")
        .upsert({
          phone_number: from,
          user_id: session.user_id || null,
          last_message_at: new Date().toISOString(),
        }, { onConflict: "phone_number" });

      // Store inbound message
      await supabase.from("whatsapp_conversations").insert({
        session_id: session.id,
        phone_number: from,
        direction: "inbound",
        message_text: msgBody,
        sent_by: "customer",
      });

      // If in human_handoff mode, don't auto-reply (admin handles it)
      if (session.current_flow === "human_handoff") {
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // Check for immediate handoff triggers
      if (["agent", "human", "help", "talk to a person"].includes(msgLower)) {
        await handleHandoff(supabase, session, from, metaToken!, phoneNumberId!);
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // Check for menu/restart
      if (["menu", "restart", "return", "back", "main menu", "hi", "hello", "start"].includes(msgLower)) {
        await supabase.from("whatsapp_sessions").update({ current_flow: "idle", flow_data: {} }).eq("id", session.id);
        await sendMainMenu(from, session.user_type || "customer", metaToken!, phoneNumberId!, supabase, session.id);
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // Route based on current flow
      const flow = session.current_flow || "idle";

      if (flow === "idle") {
        await handleIdleMenu(supabase, session, from, msgLower, msgBody, metaToken!, phoneNumberId!);
      } else if (flow === "track_order") {
        await handleTrackOrder(supabase, session, from, msgBody, metaToken!, phoneNumberId!);
      } else if (flow === "support") {
        await handleSupport(supabase, session, from, msgBody, metaToken!, phoneNumberId!);
      } else if (flow === "vendor_add_item") {
        await handleVendorAddItem(supabase, session, from, msgBody, metaToken!, phoneNumberId!);
      } else {
        // Default: show menu
        await sendMainMenu(from, session.user_type || "customer", metaToken!, phoneNumberId!, supabase, session.id);
      }

      return new Response("OK", { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("OK", { status: 200, headers: corsHeaders });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});

// Send WhatsApp text message
async function sendMessage(to: string, text: string, token: string, phoneNumberId: string, supabase: any, sessionId?: string) {
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });

  // Store outbound message
  if (supabase && sessionId) {
    await supabase.from("whatsapp_conversations").insert({
      session_id: sessionId,
      phone_number: to,
      direction: "outbound",
      message_text: text,
      sent_by: "bot",
    });
  }
}

// Main menu
async function sendMainMenu(to: string, userType: string, token: string, phoneNumberId: string, supabase: any, sessionId: string) {
  let menu = `🎉 *Welcome to Evnting!*\n\nHow can we help you today?\n\n`;
  menu += `1️⃣ Track Order\n`;
  menu += `2️⃣ My Orders\n`;
  menu += `3️⃣ Browse Catalog\n`;
  menu += `4️⃣ Customer Care\n`;
  menu += `5️⃣ Talk to a Person\n`;

  if (userType === "vendor") {
    menu += `\n--- *Vendor Options* ---\n`;
    menu += `6️⃣ My Catalog\n`;
    menu += `7️⃣ Toggle Availability\n`;
    menu += `8️⃣ Add New Item\n`;
    menu += `9️⃣ My Assigned Orders\n`;
  }

  menu += `\n_Reply with a number to proceed._`;

  await sendMessage(to, menu, token, phoneNumberId, supabase, sessionId);
}

// Handle idle menu selections
async function handleIdleMenu(supabase: any, session: any, from: string, msgLower: string, msgBody: string, token: string, phoneNumberId: string) {
  const choice = msgLower.replace(/[^0-9]/g, "");

  switch (choice) {
    case "1": // Track Order
      await supabase.from("whatsapp_sessions").update({ current_flow: "track_order" }).eq("id", session.id);
      await sendMessage(from, "📦 *Track Your Order*\n\nPlease enter your Order ID (e.g., the ID you received in your confirmation):", token, phoneNumberId, supabase, session.id);
      break;

    case "2": // My Orders
      await handleMyOrders(supabase, session, from, token, phoneNumberId);
      break;

    case "3": // Browse Catalog
      await handleBrowseCatalog(supabase, session, from, token, phoneNumberId);
      break;

    case "4": // Customer Care
      await supabase.from("whatsapp_sessions").update({ current_flow: "support", flow_data: { attempts: 0 } }).eq("id", session.id);
      await sendMessage(from, "🤝 *Customer Care*\n\nPlease describe your question or issue, and I'll try to help!\n\n_Type 'agent' at any time to speak with a person._", token, phoneNumberId, supabase, session.id);
      break;

    case "5": // Talk to a Person
      await handleHandoff(supabase, session, from, token, phoneNumberId);
      break;

    // Vendor options
    case "6":
      if (session.user_type === "vendor") {
        await handleVendorCatalog(supabase, session, from, token, phoneNumberId);
      } else {
        await sendMainMenu(from, session.user_type, token, phoneNumberId, supabase, session.id);
      }
      break;

    case "7":
      if (session.user_type === "vendor") {
        await handleVendorToggle(supabase, session, from, token, phoneNumberId);
      }
      break;

    case "8":
      if (session.user_type === "vendor") {
        await supabase.from("whatsapp_sessions").update({ current_flow: "vendor_add_item", flow_data: { step: "name" } }).eq("id", session.id);
        await sendMessage(from, "➕ *Add New Item*\n\nWhat's the name of the item?", token, phoneNumberId, supabase, session.id);
      }
      break;

    case "9":
      if (session.user_type === "vendor") {
        await handleVendorOrders(supabase, session, from, token, phoneNumberId);
      }
      break;

    default:
      await sendMainMenu(from, session.user_type || "customer", token, phoneNumberId, supabase, session.id);
  }
}

// Track order flow
async function handleTrackOrder(supabase: any, session: any, from: string, orderId: string, token: string, phoneNumberId: string) {
  const cleanId = orderId.trim();

  // Try lookup via RPC
  const { data: orderData } = await supabase.rpc("lookup_order_by_id", { order_id: cleanId });

  if (orderData) {
    const o = orderData;
    const msg = `📋 *Order Found!*\n\n` +
      `🏷️ Type: ${o.type === "rental" ? "Rental" : "Service"}\n` +
      `📌 Title: ${o.title}\n` +
      `📊 Status: *${o.status}*\n` +
      `📅 Event Date: ${o.event_date || "Not set"}\n` +
      `📍 Location: ${o.location || "Not set"}\n` +
      `👤 Client: ${o.client_name || "N/A"}\n\n` +
      `_Reply 'menu' to go back._`;
    await sendMessage(from, msg, token, phoneNumberId, supabase, session.id);
  } else {
    await sendMessage(from, "❌ Order not found. Please check your Order ID and try again.\n\n_Reply 'menu' to go back._", token, phoneNumberId, supabase, session.id);
  }

  await supabase.from("whatsapp_sessions").update({ current_flow: "idle" }).eq("id", session.id);
}

// My Orders
async function handleMyOrders(supabase: any, session: any, from: string, token: string, phoneNumberId: string) {
  if (!session.user_id) {
    await sendMessage(from, "⚠️ Your phone number isn't linked to an account yet. Please register on our website first.\n\n_Reply 'menu' to go back._", token, phoneNumberId, supabase, session.id);
    return;
  }

  const { data: rentalOrders } = await supabase
    .from("rental_orders")
    .select("id, title, status, created_at")
    .eq("client_id", session.user_id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!rentalOrders?.length) {
    await sendMessage(from, "📭 No orders found for your account.\n\n_Reply 'menu' to go back._", token, phoneNumberId, supabase, session.id);
    return;
  }

  let msg = "📋 *Your Recent Orders*\n\n";
  for (const order of rentalOrders) {
    msg += `• *${order.title}*\n  Status: ${order.status} | ID: ${order.id.substring(0, 8)}\n\n`;
  }
  msg += "_Reply with an Order ID to track, or 'menu' to go back._";

  await sendMessage(from, msg, token, phoneNumberId, supabase, session.id);
}

// Browse Catalog
async function handleBrowseCatalog(supabase: any, session: any, from: string, token: string, phoneNumberId: string) {
  const { data: rentals } = await supabase
    .from("rentals")
    .select("title, short_description, price_value, pricing_unit, service_type")
    .eq("is_active", true)
    .order("display_order")
    .limit(10);

  if (!rentals?.length) {
    await sendMessage(from, "📭 No items available right now.\n\n_Reply 'menu' to go back._", token, phoneNumberId, supabase, session.id);
    return;
  }

  let msg = "🛍️ *Our Catalog*\n\n";
  for (const item of rentals) {
    const price = item.price_value ? `₹${item.price_value} ${item.pricing_unit || ""}` : "Contact for price";
    msg += `• *${item.title}*\n  ${item.short_description}\n  💰 ${price}\n\n`;
  }
  msg += "_Visit evnting.com/ecommerce for full catalog!\nReply 'menu' to go back._";

  await sendMessage(from, msg, token, phoneNumberId, supabase, session.id);
}

// Support flow with FAQ lookup
async function handleSupport(supabase: any, session: any, from: string, question: string, token: string, phoneNumberId: string) {
  const flowData = session.flow_data || { attempts: 0 };
  const attempts = (flowData.attempts || 0) + 1;

  // Search FAQ
  const { data: faqs } = await supabase
    .from("faq")
    .select("question, answer")
    .eq("is_active", true);

  if (faqs?.length) {
    const qLower = question.toLowerCase();
    const match = faqs.find((f: any) =>
      f.question.toLowerCase().includes(qLower) ||
      qLower.includes(f.question.toLowerCase().split(" ").slice(0, 3).join(" "))
    );

    if (match) {
      await sendMessage(from, `💡 *${match.question}*\n\n${match.answer}\n\n_Did this help? Reply 'menu' to go back or ask another question._`, token, phoneNumberId, supabase, session.id);
      await supabase.from("whatsapp_sessions").update({ current_flow: "idle", flow_data: {} }).eq("id", session.id);
      return;
    }
  }

  if (attempts >= 2) {
    await sendMessage(from, "I couldn't find an answer. Let me connect you with our team...", token, phoneNumberId, supabase, session.id);
    await handleHandoff(supabase, session, from, token, phoneNumberId);
  } else {
    await supabase.from("whatsapp_sessions").update({ flow_data: { attempts } }).eq("id", session.id);
    await sendMessage(from, "🤔 I couldn't find a match. Could you rephrase your question?\n\n_Or type 'agent' to speak with a person._", token, phoneNumberId, supabase, session.id);
  }
}

// Human handoff
async function handleHandoff(supabase: any, session: any, from: string, token: string, phoneNumberId: string) {
  // Check auto-assign rules
  const { data: rules } = await supabase
    .from("whatsapp_assignment_rules")
    .select("*")
    .limit(1)
    .single();

  let assignedTo: string | null = null;
  let assignmentType = "manual";

  if (rules?.is_auto_assign && rules.eligible_employee_ids?.length > 0) {
    const nextIndex = (rules.last_assigned_index || 0) % rules.eligible_employee_ids.length;
    assignedTo = rules.eligible_employee_ids[nextIndex];
    assignmentType = "auto";

    await supabase
      .from("whatsapp_assignment_rules")
      .update({ last_assigned_index: nextIndex + 1 })
      .eq("id", rules.id);
  }

  await supabase
    .from("whatsapp_sessions")
    .update({
      current_flow: "human_handoff",
      assigned_employee_id: assignedTo,
      assigned_at: assignedTo ? new Date().toISOString() : null,
      assignment_type: assignmentType,
    })
    .eq("id", session.id);

  await sendMessage(from, "🙋 *You're now connected to our support team!*\n\nA team member will respond shortly. Please share your query and we'll get back to you as soon as possible.\n\n_Type 'menu' to return to the main menu._", token, phoneNumberId, supabase, session.id);
}

// Vendor: List catalog
async function handleVendorCatalog(supabase: any, session: any, from: string, token: string, phoneNumberId: string) {
  if (!session.user_id) {
    await sendMessage(from, "⚠️ Phone not linked to a vendor account.\n\n_Reply 'menu' to go back._", token, phoneNumberId, supabase, session.id);
    return;
  }

  const { data: items } = await supabase
    .from("vendor_inventory")
    .select("name, price_per_day, is_available, quantity")
    .eq("vendor_id", session.user_id)
    .limit(10);

  if (!items?.length) {
    await sendMessage(from, "📭 No items in your catalog. Reply '8' to add one!\n\n_Reply 'menu' to go back._", token, phoneNumberId, supabase, session.id);
    return;
  }

  let msg = "📦 *Your Catalog*\n\n";
  for (const item of items) {
    const status = item.is_available ? "✅ Available" : "❌ Unavailable";
    msg += `• *${item.name}* — ₹${item.price_per_day || "N/A"}/day — Qty: ${item.quantity} — ${status}\n`;
  }
  msg += "\n_Reply 'menu' to go back._";
  await sendMessage(from, msg, token, phoneNumberId, supabase, session.id);
}

// Vendor: Toggle availability
async function handleVendorToggle(supabase: any, session: any, from: string, token: string, phoneNumberId: string) {
  const { data: items } = await supabase
    .from("vendor_inventory")
    .select("id, name, is_available")
    .eq("vendor_id", session.user_id)
    .limit(10);

  if (!items?.length) {
    await sendMessage(from, "No items to toggle.\n\n_Reply 'menu' to go back._", token, phoneNumberId, supabase, session.id);
    return;
  }

  let msg = "🔄 *Toggle Availability*\n\nReply with the item number:\n\n";
  items.forEach((item: any, i: number) => {
    msg += `${i + 1}. ${item.name} — ${item.is_available ? "✅" : "❌"}\n`;
  });

  // For simplicity, toggle first item. In production, you'd track the flow.
  // Here we just toggle all for demo — the real flow would be multi-step
  await sendMessage(from, msg + "\n_Feature in progress. Contact admin to toggle items._\n\n_Reply 'menu' to go back._", token, phoneNumberId, supabase, session.id);
}

// Vendor: Assigned orders
async function handleVendorOrders(supabase: any, session: any, from: string, token: string, phoneNumberId: string) {
  const { data: orders } = await supabase
    .from("rental_orders")
    .select("id, title, status, event_date")
    .eq("assigned_vendor_id", session.user_id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!orders?.length) {
    await sendMessage(from, "📭 No orders assigned to you.\n\n_Reply 'menu' to go back._", token, phoneNumberId, supabase, session.id);
    return;
  }

  let msg = "📋 *Your Assigned Orders*\n\n";
  for (const o of orders) {
    msg += `• *${o.title}*\n  Status: ${o.status} | Date: ${o.event_date || "TBD"} | ID: ${o.id.substring(0, 8)}\n\n`;
  }
  msg += "_Reply 'menu' to go back._";
  await sendMessage(from, msg, token, phoneNumberId, supabase, session.id);
}

// Vendor: Add item flow
async function handleVendorAddItem(supabase: any, session: any, from: string, msgBody: string, token: string, phoneNumberId: string) {
  const flowData = session.flow_data || { step: "name" };

  switch (flowData.step) {
    case "name":
      await supabase.from("whatsapp_sessions").update({
        flow_data: { ...flowData, step: "price", name: msgBody },
      }).eq("id", session.id);
      await sendMessage(from, `Great! *${msgBody}*\n\nWhat's the price per day (in ₹)?`, token, phoneNumberId, supabase, session.id);
      break;

    case "price":
      const price = parseFloat(msgBody.replace(/[^0-9.]/g, ""));
      if (isNaN(price)) {
        await sendMessage(from, "Please enter a valid number for the price.", token, phoneNumberId, supabase, session.id);
        return;
      }
      await supabase.from("whatsapp_sessions").update({
        flow_data: { ...flowData, step: "category", price },
      }).eq("id", session.id);
      await sendMessage(from, `💰 ₹${price}/day\n\nWhat category? (e.g., Lighting, Sound, Staging, Decor, Other)`, token, phoneNumberId, supabase, session.id);
      break;

    case "category":
      // Insert the item
      const { error } = await supabase.from("vendor_inventory").insert({
        vendor_id: session.user_id,
        name: flowData.name,
        price_per_day: flowData.price,
        category: msgBody,
        quantity: 1,
        is_available: true,
        service_type: "rental",
      });

      if (error) {
        await sendMessage(from, `❌ Error adding item: ${error.message}\n\n_Reply 'menu' to go back._`, token, phoneNumberId, supabase, session.id);
      } else {
        await sendMessage(from, `✅ *Item Added!*\n\n📦 ${flowData.name}\n💰 ₹${flowData.price}/day\n📁 ${msgBody}\n\n_Reply 'menu' to go back._`, token, phoneNumberId, supabase, session.id);
      }

      await supabase.from("whatsapp_sessions").update({ current_flow: "idle", flow_data: {} }).eq("id", session.id);
      break;
  }
}
