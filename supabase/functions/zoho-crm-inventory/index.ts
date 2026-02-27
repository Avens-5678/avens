import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { action, item } = body;

    if (!item || !item.name) {
      return new Response(
        JSON.stringify({ error: 'Invalid inventory item data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing Zoho CRM inventory ${action}:`, item.name);

    const accessToken = await getAccessToken();

    // Map inventory item to Zoho CRM custom module or Products
    const productData: Record<string, unknown> = {
      Product_Name: item.name,
      Description: item.description || '',
      Unit_Price: item.price_value || item.price_per_day || 0,
      Qty_in_Stock: item.quantity || 1,
      Product_Category: item.categories?.join(', ') || item.category || 'General',
      Product_Active: item.is_available !== false,
    };

    // Add extra fields as custom fields
    if (item.pricing_unit) productData.Pricing_Unit = item.pricing_unit;
    if (item.address) productData.Vendor_Address = item.address;
    if (item.short_description) productData.Short_Description = item.short_description;
    if (item.vendor_id) productData.Vendor_ID = item.vendor_id;
    if (item.has_variants) productData.Has_Variants = item.has_variants;

    let zohoResponse;
    let zohoResult;

    if (action === 'update' && item.zoho_product_id) {
      // Update existing product
      productData.id = item.zoho_product_id;
      zohoResponse = await fetch('https://www.zohoapis.in/crm/v2/Products', {
        method: 'PUT',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [productData] }),
      });
    } else {
      // Create new product
      zohoResponse = await fetch('https://www.zohoapis.in/crm/v2/Products', {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [productData] }),
      });
    }

    try {
      zohoResult = await zohoResponse.json();
    } catch {
      zohoResult = { data: [{ status: 'error' }] };
    }

    const isSuccess = zohoResult?.data?.[0]?.status === 'success';
    const zohoProductId = zohoResult?.data?.[0]?.details?.id || null;

    if (isSuccess) {
      console.log('Successfully synced inventory to Zoho CRM Products:', zohoProductId);
    } else {
      console.error('Zoho CRM Products API error:', JSON.stringify(zohoResult));
    }

    return new Response(
      JSON.stringify({
        success: isSuccess,
        zohoProductId,
        message: isSuccess
          ? 'Inventory synced to Zoho CRM Products'
          : 'Inventory sync to Zoho CRM failed',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Zoho CRM inventory sync:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
