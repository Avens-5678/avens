import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");

    if (!smtpHost || !smtpUser || !smtpPass) {
      return new Response(JSON.stringify({ error: "SMTP credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { order_type, order_id, title, client_name, client_email, client_phone, event_date, location, details, budget } = await req.json();

    if (!order_type || !order_id) {
      return new Response(JSON.stringify({ error: "order_type and order_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get admin email from company_settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settings } = await supabase
      .from("company_settings")
      .select("email, company_name")
      .limit(1)
      .single();

    const adminEmail = settings?.email || "leads@avens.in";
    const companyName = settings?.company_name || "Evnting";

    const orderRef = `#${order_id.substring(0, 8).toUpperCase()}`;
    const typeLabel = order_type === "rental_order" ? "Rental Order" 
      : order_type === "service_order" ? "Service Order" 
      : "Event Request";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:#1a1a2e;padding:24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">EVNTING</h1>
      <p style="color:#ccc;margin:4px 0 0;font-size:13px;">New Order Notification</p>
    </div>
    <div style="padding:24px;">
      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:14px;margin-bottom:20px;">
        <p style="margin:0;font-size:15px;color:#856404;font-weight:bold;">🔔 New ${typeLabel} Received</p>
        <p style="margin:4px 0 0;font-size:13px;color:#856404;">Order Ref: ${orderRef}</p>
      </div>

      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#777;width:140px;">Order Type</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;font-weight:600;">${typeLabel}</td>
        </tr>
        ${title ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#777;">Title</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;">${title}</td>
        </tr>` : ""}
        ${client_name ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#777;">Client Name</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;">${client_name}</td>
        </tr>` : ""}
        ${client_email ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#777;">Client Email</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;"><a href="mailto:${client_email}" style="color:#e67e22;">${client_email}</a></td>
        </tr>` : ""}
        ${client_phone ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#777;">Client Phone</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;"><a href="tel:${client_phone}" style="color:#e67e22;">${client_phone}</a></td>
        </tr>` : ""}
        ${event_date ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#777;">Event Date</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;">${event_date}</td>
        </tr>` : ""}
        ${location ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#777;">Location</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;">${location}</td>
        </tr>` : ""}
        ${budget ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#777;">Budget</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;">${budget}</td>
        </tr>` : ""}
        ${details ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#777;">Details</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;">${details}</td>
        </tr>` : ""}
      </table>

      <div style="text-align:center;margin:24px 0;">
        <a href="https://evnting.com/admin" style="display:inline-block;background:#e67e22;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">View in Dashboard</a>
      </div>
    </div>
    <div style="background:#f8f8f8;padding:16px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">${companyName} · Hyderabad, Telangana</p>
      <p style="margin:4px 0 0;font-size:12px;color:#999;">Powered by evnting.com</p>
    </div>
  </div>
</body>
</html>`;

    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");

    // Send to both company email and admin@evnting.com
    const recipients = new Set<string>();
    recipients.add(adminEmail);
    recipients.add("admin@evnting.com");
    const toList = Array.from(recipients);

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    await client.send({
      from: smtpUser,
      to: toList,
      subject: `🔔 New ${typeLabel} — ${title || orderRef}`,
      content: "auto",
      html: html,
    });

    await client.close();

    console.log(`Admin notification sent for ${order_type} ${orderRef} to ${adminEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Admin notification sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Admin notification error:", err);
    return new Response(JSON.stringify({ error: err.message || "Failed to send notification" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
