import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { syncRequestToZoho } from "@/utils/zohoSync";

export interface EventRequest {
  id: string;
  client_id: string;
  assigned_vendor_id: string | null;
  status: "pending" | "approved" | "in_progress" | "completed" | "cancelled";
  event_type: string;
  event_date: string | null;
  location: string | null;
  budget: string | null;
  guest_count: number | null;
  requirements: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRequestInsert {
  event_type: string;
  event_date?: string;
  location?: string;
  budget?: string;
  guest_count?: number;
  requirements?: string;
}

// Fetch event requests for the current user (role-aware via RLS)
export const useEventRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["event_requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EventRequest[];
    },
    enabled: !!user,
  });
};

// Fetch a single event request with vendor profile (for clients)
export const useEventRequestWithVendor = (requestId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["event_request_with_vendor", requestId],
    queryFn: async () => {
      const { data: request, error: requestError } = await supabase
        .from("event_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (requestError) throw requestError;

      let vendorProfile = null;
      if (request.assigned_vendor_id) {
        const { data: vendor } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", request.assigned_vendor_id)
          .single();
        vendorProfile = vendor;
      }

      return { ...request, vendor: vendorProfile };
    },
    enabled: !!user && !!requestId,
  });
};

// Sync event request to service_orders + send WhatsApp confirmation
const syncEventRequestToServiceOrders = async (
  eventRequest: EventRequest,
  userEmail?: string
) => {
  try {
    // Get user profile for name/phone
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, email")
      .eq("user_id", eventRequest.client_id)
      .single();

    const clientName = profile?.full_name || userEmail || "Customer";
    const clientPhone = profile?.phone || null;
    const clientEmail = profile?.email || userEmail || null;

    // Insert into service_orders
    const { data: serviceOrder } = await supabase
      .from("service_orders")
      .insert({
        title: `${eventRequest.event_type} - Service Request`,
        service_type: eventRequest.event_type,
        service_details: eventRequest.requirements || "",
        location: eventRequest.location || "",
        event_date: eventRequest.event_date || "",
        budget: eventRequest.budget || "",
        guest_count: eventRequest.guest_count || undefined,
        client_name: clientName,
        client_phone: clientPhone || "",
        client_email: clientEmail || "",
        notes: `Auto-synced from Event Request #${eventRequest.id.substring(0, 8)}`,
      })
      .select()
      .single();

    // Send WhatsApp confirmation via WATI
    if (clientPhone && serviceOrder) {
      await supabase.functions.invoke("wati-service-confirmation", {
        body: {
          phone: clientPhone,
          name: clientName,
          service_type: eventRequest.event_type,
          order_id: serviceOrder.id,
        },
      });
    }
  } catch (err) {
    console.error("Failed to sync event request to service orders:", err);
  }
};

// Create a new event request (for clients)
export const useCreateEventRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: EventRequestInsert) => {
      if (!user) throw new Error("Not authenticated");

      const { data: result, error } = await supabase
        .from("event_requests")
        .insert({
          ...data,
          client_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["event_requests"] });
      queryClient.invalidateQueries({ queryKey: ["service_orders"] });
      toast({
        title: "Request Submitted",
        description: "Your event request has been submitted successfully.",
      });
      // Sync to service_orders + WhatsApp
      syncEventRequestToServiceOrders(result as EventRequest, user?.email || undefined);
      // Sync to Zoho CRM
      syncRequestToZoho('event_request', {
        ...result,
        client_name: user?.email || '',
        client_email: user?.email || '',
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Update event request status (for vendors)
export const useUpdateEventStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EventRequest["status"] }) => {
      const { data, error } = await supabase
        .from("event_requests")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_requests"] });
      toast({
        title: "Status Updated",
        description: "Event status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Assign vendor to event request (for admins)
export const useAssignVendor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ requestId, vendorId }: { requestId: string; vendorId: string }) => {
      const { data, error } = await supabase
        .from("event_requests")
        .update({ 
          assigned_vendor_id: vendorId,
          status: "approved" as const
        })
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_requests"] });
      toast({
        title: "Vendor Assigned",
        description: "Vendor has been assigned to the event.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Fetch all vendors (for admin dropdown)
export const useVendors = () => {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role
        `)
        .eq("role", "vendor");

      if (error) throw error;

      // Fetch profiles for these vendors
      if (data && data.length > 0) {
        const vendorIds = data.map(v => v.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", vendorIds);

        if (profilesError) throw profilesError;
        return profiles || [];
      }

      return [];
    },
  });
};
