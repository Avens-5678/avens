import { supabase } from "@/integrations/supabase/client";

/**
 * Sync vendor inventory item to Zoho CRM Products module
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
 * Sync event request to Zoho CRM Form_Submissions custom module
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

/**
 * Sync admin rental catalog item (Enhanced Rental Management) to Zoho CRM Products
 */
export const syncRentalToZohoProducts = async (
  action: 'create' | 'update',
  item: Record<string, unknown>
) => {
  try {
    const { data, error } = await supabase.functions.invoke('zoho-crm-inventory', {
      body: {
        action,
        item: {
          name: item.title,
          description: item.description,
          short_description: item.short_description,
          price_value: item.price_value,
          pricing_unit: item.pricing_unit,
          quantity: item.quantity,
          categories: item.categories,
          is_available: item.is_active,
          has_variants: item.has_variants,
          address: item.address,
          search_keywords: item.search_keywords,
          zoho_product_id: item.zoho_product_id,
        },
      },
    });
    if (error) {
      console.error('Zoho CRM rental catalog sync error:', error);
    } else {
      console.log('Zoho CRM rental catalog sync:', data?.message);
    }
    return data;
  } catch (err) {
    console.error('Zoho CRM rental catalog sync failed:', err);
  }
};

/**
 * Sync rental order to Zoho CRM Products module
 */
export const syncRentalOrderToZohoProducts = async (
  action: 'create' | 'update',
  order: Record<string, unknown>
) => {
  try {
    const { data, error } = await supabase.functions.invoke('zoho-crm-inventory', {
      body: {
        action,
        item: {
          name: `Order: ${order.title}`,
          description: `Category: ${order.equipment_category || ''}\nDetails: ${order.equipment_details || ''}\nClient: ${order.client_name || ''}\nPhone: ${order.client_phone || ''}\nEmail: ${order.client_email || ''}\nBudget: ${order.budget || ''}\nStatus: ${order.status || ''}`,
          price_value: 0,
          quantity: 1,
          category: order.equipment_category,
          is_available: true,
          address: order.location,
          zoho_product_id: order.zoho_product_id,
        },
      },
    });
    if (error) {
      console.error('Zoho CRM rental order sync error:', error);
    } else {
      console.log('Zoho CRM rental order sync:', data?.message);
    }
    return data;
  } catch (err) {
    console.error('Zoho CRM rental order sync failed:', err);
  }
};
