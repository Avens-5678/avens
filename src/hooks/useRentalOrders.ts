import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental_orders"] });
      toast({ title: "Order Created", description: "Rental order has been created." });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental_orders"] });
      toast({ title: "Order Updated", description: "Rental order has been updated." });
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
