import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const requestSchema = z.object({
  submissionId: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).toLowerCase(),
  phone: z.string().max(20).regex(/^[\d\s+()-]*$/).optional().nullable(),
  message: z.string().max(2000).trim().optional(),
  formType: z.enum(['inquiry', 'contact', 'rental', 'event', 'general']).optional(),
  eventType: z.string().max(100).optional().nullable(),
  eventDate: z.string().optional().nullable(),
  rentalTitle: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
});

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('ZOHO_CLIENT_ID');
  const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
  const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Zoho CRM credentials not configured');
  }

  const tokenUrl = `https://accounts.zoho.in/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;
  const res = await fetch(tokenUrl, { method: 'POST' });
  const rawText = await res.text();

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Zoho token endpoint returned non-JSON (status ${res.status})`);
  }

  if (!data.access_token) {
    throw new Error(`Failed to obtain Zoho access token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = requestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.flatten());
      return new Response(
        JSON.stringify({ error: 'Invalid input data', details: validationResult.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { submissionId, name, email, phone, message, formType, eventType, eventDate, rentalTitle, location } = validationResult.data;

    console.log('Processing Zoho CRM form submission:', { submissionId, email, formType });

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '-';

    // Build record for Zoho CRM custom module "Form_Submissions"
    const recordData: Record<string, unknown> = {
      Name: `${firstName} ${lastName}`.trim(),
      Email: email,
      Phone: phone || '',
      Message: message || '',
      Form_Type: formType || 'general',
      City: location || '',
    };

    if (eventType) recordData.Event_Type = eventType;
    if (eventDate) recordData.Event_Date = eventDate;
    if (rentalTitle) recordData.Rental_Items = rentalTitle;

    const accessToken = await getAccessToken();

    // Send to custom module "Form_Submissions" instead of Leads
    const zohoResponse = await fetch('https://www.zohoapis.in/crm/v2/Form_Submissions', {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [recordData] }),
    });

    let zohoResult;
    try {
      zohoResult = await zohoResponse.json();
    } catch {
      zohoResult = { data: [{ status: 'error' }] };
    }

    const isSuccess = zohoResult?.data?.[0]?.status === 'success';
    const zohoRecordId = zohoResult?.data?.[0]?.details?.id || null;

    if (isSuccess) {
      console.log('Successfully created Zoho CRM Form_Submissions record:', zohoRecordId);
    } else {
      console.error('Zoho CRM API error:', JSON.stringify(zohoResult));
    }

    // Update form submission status
    if (submissionId) {
      const { error: updateError } = await supabase
        .from('form_submissions')
        .update({ status: isSuccess ? 'synced_to_crm' : 'crm_sync_failed' })
        .eq('id', submissionId);

      if (updateError) {
        console.error('Error updating submission status:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: isSuccess,
        zohoRecordId,
        message: isSuccess ? 'Form submission synced to Zoho CRM (Form_Submissions module)' : 'Form saved locally, CRM sync failed',
        submissionId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Zoho CRM integration:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
