import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }

    const { submissionId, name, email, phone, message, formType, eventType } = await req.json();

    if (!submissionId || !name || !email || !message) {
      return new Response('Missing required fields', {
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log('Processing form submission notification:', {
      submissionId,
      name,
      email,
      formType,
      eventType,
    });

    // Update submission status to 'contacted'
    const { error: updateError } = await supabase
      .from('form_submissions')
      .update({ status: 'contacted' })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission status:', updateError);
    }

    // In a real implementation, you would integrate with:
    // 1. Email service (like SendGrid, Mailgun, or Resend)
    // 2. WhatsApp Business API
    // 3. SMS service (like Twilio)

    // For now, we'll just log the notification details
    console.log('Form submission notification sent:', {
      to: 'admin@avensevents.com',
      subject: `New ${formType} submission from ${name}`,
      content: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone || 'Not provided'}
        Event Type: ${eventType || 'Not specified'}
        Message: ${message}
        
        Form Type: ${formType}
        Submission ID: ${submissionId}
      `,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully',
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in form notification function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});