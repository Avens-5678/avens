import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface VendorInventoryItem {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  quantity: number;
  price_per_day: number | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorInventoryInsert {
  name: string;
  description?: string;
  quantity?: number;
  price_per_day?: number;
  image_url?: string;
  is_available?: boolean;
}

// Fetch vendor's own inventory
export const useVendorInventory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["vendor_inventory", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_inventory")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VendorInventoryItem[];
    },
    enabled: !!user,
  });
};

// Fetch all available inventory (marketplace view)
export const useMarketplaceInventory = () => {
  return useQuery({
    queryKey: ["marketplace_inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_inventory")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VendorInventoryItem[];
    },
  });
};

// Create inventory item
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: VendorInventoryInsert) => {
      if (!user) throw new Error("Not authenticated");

      const { data: result, error } = await supabase
        .from("vendor_inventory")
        .insert({
          ...data,
          vendor_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor_inventory"] });
      toast({
        title: "Item Added",
        description: "Inventory item has been added successfully.",
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

// Update inventory item
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<VendorInventoryItem> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("vendor_inventory")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor_inventory"] });
      toast({
        title: "Item Updated",
        description: "Inventory item has been updated.",
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

// Delete inventory item
export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vendor_inventory")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor_inventory"] });
      toast({
        title: "Item Deleted",
        description: "Inventory item has been removed.",
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

// Toggle availability
export const useToggleAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { data, error } = await supabase
        .from("vendor_inventory")
        .update({ is_available })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor_inventory"] });
    },
  });
};
