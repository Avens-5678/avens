import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

const sendServiceConfirmationWhatsApp = async (
  order: {
    id: string;
    client_name?: string | null;
    client_phone?: string | null;
    service_type?: string;
  },
  toastFn?: (opts: { title: string; description: string; variant?: "destructive" }) => void
) => {
  if (!order.client_phone) {
    toastFn?.({ title: "WhatsApp Not Sent", description: "No client phone number provided.", variant: "destructive" });
    return;
  }
  try {
    await supabase.functions.invoke("wati-service-confirmation", {
      body: {
        phone: order.client_phone,
        name: order.client_name || "Customer",
        service_type: order.service_type || "Event Service",
        order_id: order.id,
      },
    });
  } catch (err) {
    console.error("WhatsApp confirmation failed:", err);
  }
};

export interface ServiceOrder {
  id: string;
  title: string;
  service_type: string;
  service_details: string | null;
  location: string | null;
  event_date: string | null;
  event_end_date: string | null;
  budget: string | null;
  guest_count: number | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  status: string;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrderInsert {
  title: string;
  service_type?: string;
  service_details?: string;
  location?: string;
  event_date?: string;
  event_end_date?: string;
  budget?: string;
  guest_count?: number;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  notes?: string;
}

export const useServiceOrders = (filters?: {
  status?: string;
  service_type?: string;
  location?: string;
}) => {
  return useQuery({
    queryKey: ["service_orders", filters],
    queryFn: async () => {
      let query = supabase
        .from("service_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.service_type && filters.service_type !== "all") {
        query = query.eq("service_type", filters.service_type);
      }
      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ServiceOrder[];
    },
  });
};

export const useCreateServiceOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ServiceOrderInsert) => {
      const { data: result, error } = await supabase
        .from("service_orders")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["service_orders"] });
      toast({ title: "Order Created", description: "Service order has been created." });
      sendServiceConfirmationWhatsApp(result, toast);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateServiceOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ServiceOrder> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("service_orders")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_orders"] });
      toast({ title: "Order Updated", description: "Service order has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteServiceOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_orders"] });
      toast({ title: "Order Deleted", description: "Service order has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};
