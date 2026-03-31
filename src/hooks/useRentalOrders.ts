import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { syncRentalOrderToZohoProducts } from "@/utils/zohoSync";
import { normalizePhoneNumber } from "@/utils/phoneUtils";

const sendRentalConfirmationWhatsApp = async (
  order: {
    id: string;
    client_name?: string | null;
    client_phone?: string | null;
  },
  toastFn?: (opts: { title: string; description: string; variant?: "destructive" }) => void
) => {
  if (!order.client_phone) {
    toastFn?.({ title: "WhatsApp Not Sent", description: "No client phone number provided.", variant: "destructive" });
    return;
  }
  try {
    const normalizedPhone = normalizePhoneNumber(order.client_phone);
    await supabase.functions.invoke("wati-rental-confirmation", {
      body: {
        phone: normalizedPhone,
        name: order.client_name || "Customer",
        order_id: order.id,
      },
    });
  } catch (err) {
    console.error("WhatsApp rental confirmation failed:", err);
  }
};

export interface RentalOrder {
  id: string;
  title: string;
  equipment_category: string;
  equipment_details: string | null;
  location: string | null;
  event_date: string | null;
  budget: string | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  status: string;
  assigned_vendor_id: string | null;
  vendor_response: string | null;
  vendor_quote_amount: number | null;
  vendor_responded_at: string | null;
  whatsapp_sent_at: string | null;
  notes: string | null;
  action_token: string | null;
  created_at: string;
  updated_at: string;
  vendor_payout: number | null;
  manpower_fee: number | null;
  transport_fee: number | null;
  platform_fee: number | null;
}

export interface RentalOrderInsert {
  title: string;
  equipment_category: string;
  equipment_details?: string;
  location?: string;
  event_date?: string;
  budget?: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  notes?: string;
}

export const useVendorRentalOrders = (vendorId?: string) => {
  return useQuery({
    queryKey: ["vendor_rental_orders", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_orders")
        .select("*")
        .eq("assigned_vendor_id", vendorId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RentalOrder[];
    },
    enabled: !!vendorId,
  });
};

export const useClientRentalOrders = (clientId?: string) => {
  return useQuery({
    queryKey: ["client_rental_orders", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_orders")
        .select("*")
        .eq("client_id", clientId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RentalOrder[];
    },
    enabled: !!clientId,
  });
};

export const useRentalOrders = (filters?: {
  status?: string;
  category?: string;
  location?: string;
}) => {
  return useQuery({
    queryKey: ["rental_orders", filters],
    queryFn: async () => {
      let query = supabase
        .from("rental_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.category && filters.category !== "all") {
        query = query.eq("equipment_category", filters.category);
      }
      if (filters?.location && filters.location !== "") {
        query = query.or(`location.ilike.%${filters.location}%,equipment_details.ilike.%${filters.location}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RentalOrder[];
    },
  });
};

export const useCreateRentalOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: RentalOrderInsert) => {
      const { data: result, error } = await supabase
        .from("rental_orders")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rental_orders"] });
      toast({ title: "Order Created", description: "Rental order has been created." });
      syncRentalOrderToZohoProducts('create', result);
      sendRentalConfirmationWhatsApp(result, toast);
      // Notify admin via email
      supabase.functions.invoke("notify-admin-order", {
        body: {
          order_type: "rental_order",
          order_id: result.id,
          title: result.title,
          client_name: result.client_name,
          client_email: result.client_email,
          client_phone: result.client_phone,
          event_date: result.event_date,
          location: result.location,
          details: result.equipment_details,
          budget: result.budget,
        },
      }).catch((err) => console.error("Admin email notification failed:", err));
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateRentalOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<RentalOrder> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("rental_orders")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rental_orders"] });
      toast({ title: "Order Updated", description: "Rental order has been updated." });
      // Sync to Zoho CRM Products
      syncRentalOrderToZohoProducts('update', result);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteRentalOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rental_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental_orders"] });
      toast({ title: "Order Deleted", description: "Rental order has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useSendToVendor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      orderId,
      vendorPhone,
      vendorName,
    }: {
      orderId: string;
      vendorPhone: string;
      vendorName?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("wati-whatsapp", {
        body: {
          action: "send_to_vendor",
          orderId,
          vendorPhone,
          vendorName,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rental_orders"] });
      toast({
        title: data.whatsapp_sent ? "WhatsApp Sent!" : "Order Updated",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};
