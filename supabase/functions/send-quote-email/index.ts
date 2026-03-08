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

    // Verify admin auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabaseAuth.auth.getUser(token);
    if (claimsError || !claims?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: claims.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { clientName, clientEmail, quoteNumber, acceptanceToken, sourceOrderId, lineItems, subtotal, discountAmount, taxLabel, taxPercent, taxAmount, total, notes } = await req.json();

    if (!clientEmail) {
      return new Response(JSON.stringify({ error: "Client email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const acceptanceLink = `https://avens.lovable.app/quote/${acceptanceToken}`;
    const orderRef = sourceOrderId ? `#${sourceOrderId.substring(0, 8).toUpperCase()}` : quoteNumber;

    // Build HTML email
    const itemRows = (lineItems || []).map((li: any) =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${li.item_description}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${li.quantity} ${li.unit}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">₹${Number(li.unit_price).toLocaleString("en-IN")}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">₹${Number(li.total_price).toLocaleString("en-IN")}</td>
      </tr>`
    ).join("");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:#1a1a2e;padding:24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">EVNTING</h1>
      <p style="color:#ccc;margin:4px 0 0;font-size:13px;">Premium Event Management & Rentals</p>
    </div>
    <div style="padding:24px;">
      <p style="font-size:16px;color:#333;">Hello <strong>${clientName}</strong>,</p>
      <p style="color:#555;">Please find your quotation details below. Order Ref: <strong>${orderRef}</strong></p>
      
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
        <thead>
          <tr style="background:#f8f8f8;">
            <th style="padding:10px 12px;text-align:left;font-weight:600;">Description</th>
            <th style="padding:10px 12px;text-align:center;font-weight:600;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;">Rate</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="text-align:right;font-size:14px;margin:16px 0;">
        <p style="margin:4px 0;color:#555;">Subtotal: <strong>₹${Number(subtotal).toLocaleString("en-IN")}</strong></p>
        ${Number(discountAmount) > 0 ? `<p style="margin:4px 0;color:#16a34a;">Discount: <strong>-₹${Number(discountAmount).toLocaleString("en-IN")}</strong></p>` : ""}
        ${Number(taxAmount) > 0 ? `<p style="margin:4px 0;color:#555;">${taxLabel} (${taxPercent}%): <strong>₹${Number(taxAmount).toLocaleString("en-IN")}</strong></p>` : ""}
        <hr style="border:none;border-top:1px solid #ddd;margin:8px 0;">
        <p style="margin:4px 0;font-size:18px;color:#1a1a2e;">Total: <strong>₹${Number(total).toLocaleString("en-IN")}</strong></p>
      </div>

      ${notes ? `<div style="background:#f8f8f8;padding:12px;border-radius:6px;margin:16px 0;"><p style="margin:0;font-size:13px;color:#555;"><strong>Notes:</strong> ${notes}</p></div>` : ""}

      <div style="text-align:center;margin:24px 0;">
        <a href="${acceptanceLink}" style="display:inline-block;background:#e67e22;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Review & Accept Quote</a>
      </div>

      <p style="font-size:12px;color:#999;text-align:center;">Click the button above to review, sign, and accept this quotation.</p>
    </div>
    <div style="background:#f8f8f8;padding:16px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">Evnting (Avens Events Pvt. Ltd.) · Hyderabad, Telangana</p>
      <p style="margin:4px 0 0;font-size:12px;color:#999;">Powered by evnting.com</p>
    </div>
  </div>
</body>
</html>`;

    // Send via SMTP using Deno's built-in SMTP (via raw TCP)
    // Using a lightweight approach with the Deno SMTP client
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
    
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
      to: clientEmail,
      subject: `Quotation from Evnting — ${orderRef}`,
      content: "auto",
      html: html,
    });

    await client.close();

    // Update quote status
    if (acceptanceToken) {
      await supabaseAdmin
        .from("quotes")
        .update({ sent_via: "email", sent_at: new Date().toISOString(), status: "sent" })
        .eq("acceptance_token", acceptanceToken);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Email send error:", err);
    return new Response(JSON.stringify({ error: err.message || "Failed to send email" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
