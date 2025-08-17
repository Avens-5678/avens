import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if admin user exists
    const { data: adminUser, error: queryError } = await supabase
      .from('admin_users')
      .select('id, email, full_name')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (queryError || !adminUser) {
      // Don't reveal if email exists or not for security
      return new Response(
        JSON.stringify({ message: "If the email exists, a reset link has been sent." }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Generate reset token (in production, use a proper JWT or secure token)
    const resetToken = crypto.randomUUID();
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetExpiry.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', adminUser.id);

    if (updateError) {
      throw new Error('Failed to generate reset token');
    }

    // Create reset URL
    const resetUrl = `${req.headers.get('origin')}/admin/reset-password?token=${resetToken}`;

    // Send reset email
    const emailResponse = await resend.emails.send({
      from: "Avens Events <admin@avensevents.com>",
      to: [email],
      subject: "Admin Password Reset",
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello ${adminUser.full_name},</p>
        <p>You requested a password reset for your admin account at Avens Events.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>Avens Events Team</p>
      `,
    });

    console.log("Password reset email sent:", emailResponse);

    return new Response(
      JSON.stringify({ message: "Password reset email sent successfully." }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in admin-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);