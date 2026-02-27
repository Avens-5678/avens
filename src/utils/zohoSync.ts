import { supabase } from "@/integrations/supabase/client";

/**
 * Sync inventory item to Zoho CRM Products module
 */
export const syncInventoryToZoho = async (
  action: 'create' | 'update',
  item: Record<string, unknown>
) => {
  try {
    const { data, error } = await supabase.functions.invoke('zoho-crm-inventory', {
      body: { action, item },
    });
    if (error) {
      console.error('Zoho CRM inventory sync error:', error);
    } else {
      console.log('Zoho CRM inventory sync:', data?.message);
    }
    return data;
  } catch (err) {
    console.error('Zoho CRM inventory sync failed:', err);
  }
};

/**
 * Sync event request / rental order to Zoho CRM Leads module
 */
export const syncRequestToZoho = async (
  requestType: 'event_request' | 'rental_order' | 'rental_order_update',
  data: Record<string, unknown>
) => {
  try {
    const { data: result, error } = await supabase.functions.invoke('zoho-crm-requests', {
      body: { requestType, data },
    });
    if (error) {
      console.error('Zoho CRM request sync error:', error);
    } else {
      console.log('Zoho CRM request sync:', result?.message);
    }
    return result;
  } catch (err) {
    console.error('Zoho CRM request sync failed:', err);
  }
};
