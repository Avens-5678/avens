import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  client_name: string;
  testimonial: string;
  rating: number;
  company?: string;
  position?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useTestimonials = () => {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_testimonials")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Testimonial[];
    },
  });
};

export const useAllTestimonials = () => {
  return useQuery({
    queryKey: ["all-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_testimonials")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Testimonial[];
    },
  });
};