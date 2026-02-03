import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  submissionId: z.string().uuid("Invalid submission ID"),
  name: z.string().min(2, "Name too short").max(100, "Name too long").trim(),
  email: z.string().email("Invalid email").max(255, "Email too long"),
  phone: z.string().max(20, "Phone too long").optional().nullable(),
  message: z.string().min(1, "Message required").max(2000, "Message too long").trim(),
  formType: z.string().max(50, "Form type too long").optional(),
  eventType: z.string().max(100, "Event type too long").optional().nullable(),
});

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

    // Parse and validate input
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input with Zod schema
    const validationResult = requestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.flatten());
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validationResult.error.flatten().fieldErrors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { submissionId, name, email, phone, message, formType, eventType } = validationResult.data;

    console.log('Processing form submission notification:', {
      submissionId,
      name: name.substring(0, 20), // Log only partial name for privacy
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

    // For now, we'll just log the notification details (without sensitive data)
    console.log('Form submission notification processed:', {
      formType,
      submissionId,
      timestamp: new Date().toISOString(),
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
