import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    const body = await req.json();
    const { requestType, data } = body;

    if (!requestType || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing requestType or data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing Zoho CRM request sync: ${requestType}`);

    const accessToken = await getAccessToken();

    // Event requests sync to Zoho CRM Form_Submissions custom module
    const recordData: Record<string, unknown> = {};

    if (requestType === 'event_request') {
      const clientName = data.client_name || 'Unknown';
      recordData.Name = clientName;
      recordData.Email = data.client_email || '';
      recordData.Phone = data.client_phone || '';
      recordData.Form_Type = 'Event Request';
      recordData.Message = data.requirements || '';
      recordData.City = data.location || '';
      recordData.Event_Type = data.event_type || '';
      if (data.event_date) recordData.Event_Date = data.event_date;
      if (data.budget) recordData.Budget = data.budget;
      if (data.guest_count) recordData.Guest_Count = data.guest_count;
    }

    // Only event requests go to Form_Submissions module
    if (requestType === 'event_request') {
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

      return new Response(
        JSON.stringify({
          success: isSuccess,
          zohoRecordId,
          message: isSuccess ? 'Request synced to Zoho CRM Form_Submissions' : 'CRM sync failed',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rental orders and updates are no longer handled here - they go to Products via zoho-crm-inventory
    return new Response(
      JSON.stringify({ success: true, message: 'Request type not handled by this function' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Zoho CRM requests sync:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
