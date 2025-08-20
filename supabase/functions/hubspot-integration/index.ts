import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HubSpotContact {
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    message?: string;
    lifecyclestage?: string;
    lead_source?: string;
    event_type?: string;
    rental_items?: string;
    location?: string;
    form_type?: string;
  };
}

export async function handler(req: Request): Promise<Response> {
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

    const { submissionId, name, email, phone, message, formType, eventType, rentalTitle, location } = await req.json();

    if (!email || !name) {
      return new Response('Missing required fields: email and name', {
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log('Processing HubSpot integration for:', {
      submissionId,
      email,
      formType,
      eventType,
    });

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Prepare HubSpot contact data
    const hubspotContact: HubSpotContact = {
      properties: {
        email,
        firstname: firstName,
        lastname: lastName,
        phone: phone || '',
        message: message || '',
        lifecyclestage: 'lead',
        lead_source: 'Website Form',
        form_type: formType || 'general',
        location: location || '',
      }
    };

    // Add specific properties based on form type
    if (formType === 'event') {
      hubspotContact.properties.event_type = eventType || '';
    } else if (formType === 'rental') {
      hubspotContact.properties.rental_items = rentalTitle || '';
    }

    // Send to HubSpot
    const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY');
    if (!hubspotApiKey) {
      console.error('HubSpot API key not configured');
      return new Response('HubSpot integration not configured', {
        status: 500,
        headers: corsHeaders,
      });
    }

    const hubspotResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hubspotContact),
    });

    let hubspotResult;
    try {
      hubspotResult = await hubspotResponse.json();
    } catch (error) {
      console.error('Failed to parse HubSpot response:', error);
      hubspotResult = { error: 'Failed to parse response' };
    }

    if (!hubspotResponse.ok) {
      console.error('HubSpot API error:', hubspotResult);
      
      // If contact already exists, try to update instead
      if (hubspotResult.category === 'CONFLICT') {
        console.log('Contact exists, attempting to update...');
        // For now, we'll just log this. In production, you might want to update the existing contact
      }
    } else {
      console.log('Successfully created HubSpot contact:', hubspotResult.id);
    }

    // Update form submission with HubSpot sync status
    if (submissionId) {
      const { error: updateError } = await supabase
        .from('form_submissions')
        .update({ 
          status: hubspotResponse.ok ? 'synced_to_crm' : 'crm_sync_failed',
        })
        .eq('id', submissionId);

      if (updateError) {
        console.error('Error updating submission status:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: hubspotResponse.ok,
        hubspotContactId: hubspotResult?.id || null,
        message: hubspotResponse.ok 
          ? 'Lead successfully synced to HubSpot CRM' 
          : 'Lead saved locally, CRM sync failed',
        submissionId,
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
    console.error('Error in HubSpot integration function:', error);
    
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
}