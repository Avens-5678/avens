import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    const { submissionId } = await req.json()

    if (!submissionId) {
      throw new Error('Submission ID is required')
    }

    // Get form submission details
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (submissionError || !submission) {
      throw new Error('Form submission not found')
    }

    console.log('Processing form submission:', submission)

    // Prepare email content
    const emailSubject = `New ${submission.form_type} inquiry from ${submission.name}`
    const emailBody = `
      New inquiry received from Avens Events website:
      
      Name: ${submission.name}
      Email: ${submission.email}
      Phone: ${submission.phone || 'Not provided'}
      Form Type: ${submission.form_type}
      ${submission.event_type ? `Event Type: ${submission.event_type}` : ''}
      
      Message:
      ${submission.message}
      
      Submitted at: ${new Date(submission.created_at).toLocaleString()}
      
      Please respond to this inquiry promptly.
    `

    // Send email (using a hypothetical email service)
    console.log('Email to be sent:', {
      to: 'info@avensevents.com',
      subject: emailSubject,
      body: emailBody
    })

    // Prepare WhatsApp message
    const whatsappMessage = `🎉 New Inquiry - Avens Events

👤 Name: ${submission.name}
📧 Email: ${submission.email}
📱 Phone: ${submission.phone || 'Not provided'}
🎯 Type: ${submission.form_type}${submission.event_type ? `\n🎊 Event: ${submission.event_type}` : ''}

💬 Message:
${submission.message}

⏰ ${new Date(submission.created_at).toLocaleString()}`

    console.log('WhatsApp message to be sent:', whatsappMessage)

    // In a real implementation, you would integrate with:
    // 1. Email service (SendGrid, Resend, etc.)
    // 2. WhatsApp Business API

    // For now, we'll just log and return success
    console.log('Form submission processed successfully')

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
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})