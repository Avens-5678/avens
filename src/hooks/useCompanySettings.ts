import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface CompanySettings {
  id: string;
  company_name: string;
  logo_url: string | null;
  gst_number: string | null;
  pan_number: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  gst_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useCompanySettings = () => {
  return useQuery({
    queryKey: ["company_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings" as any)
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as unknown as CompanySettings;
    },
  });
};

export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<CompanySettings>) => {
      // Get the existing row id first
      const { data: existing } = await supabase
        .from("company_settings" as any)
        .select("id")
        .limit(1)
        .single();

      if (!existing) throw new Error("No company settings found");

      const { data, error } = await supabase
        .from("company_settings" as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq("id", (existing as any).id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as CompanySettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company_settings"] });
      toast({ title: "Company Settings Updated", description: "Changes saved successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};
