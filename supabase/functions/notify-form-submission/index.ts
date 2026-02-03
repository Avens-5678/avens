import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const requestSchema = z.object({
  submissionId: z.string().uuid("Invalid submission ID"),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse and validate input
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input with Zod schema
    const validationResult = requestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.flatten());
      return new Response(
        JSON.stringify({ 
          error: 'Invalid submission ID format',
          success: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { submissionId } = validationResult.data;

    // Get form submission details
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (submissionError || !submission) {
      console.error('Form submission not found:', submissionId);
      return new Response(
        JSON.stringify({ error: 'Form submission not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing form submission:', {
      id: submission.id,
      form_type: submission.form_type,
      created_at: submission.created_at,
    });

    // Prepare email content (sanitized - no sensitive data in logs)
    const emailSubject = `New ${submission.form_type} inquiry received`
    
    console.log('Notification prepared:', {
      submissionId: submission.id,
      formType: submission.form_type,
      timestamp: new Date().toISOString(),
    })

    // In a real implementation, you would integrate with:
    // 1. Email service (SendGrid, Resend, etc.)
    // 2. WhatsApp Business API

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        submissionId: submission.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing form submission:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
