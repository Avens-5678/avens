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

function mapLeadSource(requestType: string): string {
  const mapping: Record<string, string> = {
    'event_request': 'Event Booking',
    'rental_order': 'Rental Request',
    'inquiry': 'Event Booking',
    'contact': 'Contact Form',
    'rental': 'Rental Request',
    'general': 'General Inquiry',
  };
  return mapping[requestType] || 'Website';
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

    let leadData: Record<string, unknown> = {};

    if (requestType === 'event_request') {
      // Event request from client
      const clientName = data.client_name || 'Unknown';
      const nameParts = clientName.trim().split(' ');
      leadData = {
        First_Name: nameParts[0],
        Last_Name: nameParts.slice(1).join(' ') || '-',
        Email: data.client_email || '',
        Phone: data.client_phone || '',
        Lead_Source: mapLeadSource(requestType),
        Description: data.requirements || '',
        City: data.location || '',
        Event_Type: data.event_type || '',
      };
      if (data.event_date) leadData.Event_Date = data.event_date;
      if (data.budget) leadData.Budget = data.budget;
      if (data.guest_count) leadData.No_of_Employees = data.guest_count;

    } else if (requestType === 'rental_order') {
      // Rental order from admin
      const clientName = data.client_name || 'Unknown';
      const nameParts = clientName.trim().split(' ');
      leadData = {
        First_Name: nameParts[0],
        Last_Name: nameParts.slice(1).join(' ') || '-',
        Email: data.client_email || '',
        Phone: data.client_phone || '',
        Lead_Source: mapLeadSource(requestType),
        Description: `Equipment: ${data.title || ''}\nCategory: ${data.equipment_category || ''}\nDetails: ${data.equipment_details || ''}\nNotes: ${data.notes || ''}`,
        City: data.location || '',
        Rental_Items: data.title || '',
      };
      if (data.event_date) leadData.Event_Date = data.event_date;
      if (data.budget) leadData.Budget = data.budget;

    } else if (requestType === 'rental_order_update') {
      // Rental order status update
      const clientName = data.client_name || 'Unknown';
      const nameParts = clientName.trim().split(' ');
      leadData = {
        First_Name: nameParts[0],
        Last_Name: nameParts.slice(1).join(' ') || '-',
        Email: data.client_email || '',
        Phone: data.client_phone || '',
        Lead_Source: 'Rental Update',
        Description: `Status: ${data.status || ''}\nEquipment: ${data.title || ''}\nCategory: ${data.equipment_category || ''}\nDetails: ${data.equipment_details || ''}\nVendor Response: ${data.vendor_response || ''}\nNotes: ${data.notes || ''}`,
        City: data.location || '',
        Rental_Items: data.title || '',
      };
      if (data.event_date) leadData.Event_Date = data.event_date;
    }

    const zohoResponse = await fetch('https://www.zohoapis.in/crm/v2/Leads', {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [leadData] }),
    });

    let zohoResult;
    try {
      zohoResult = await zohoResponse.json();
    } catch {
      zohoResult = { data: [{ status: 'error' }] };
    }

    const isSuccess = zohoResult?.data?.[0]?.status === 'success';
    const zohoLeadId = zohoResult?.data?.[0]?.details?.id || null;

    if (isSuccess) {
      console.log('Successfully created Zoho CRM lead from request:', zohoLeadId);
    } else {
      console.error('Zoho CRM API error:', JSON.stringify(zohoResult));
    }

    return new Response(
      JSON.stringify({
        success: isSuccess,
        zohoLeadId,
        message: isSuccess ? 'Request synced to Zoho CRM' : 'CRM sync failed',
      }),
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
