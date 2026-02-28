import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface QuoteLineItem {
  id?: string;
  quote_id?: string;
  item_description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  display_order?: number;
}

export interface Quote {
  id: string;
  quote_number: string;
  source_type: string;
  source_order_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  subtotal: number;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  gst_percent: number;
  gst_amount: number;
  total: number;
  notes: string | null;
  status: string;
  sent_via: string | null;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useQuotes = () => {
  return useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Quote[];
    },
  });
};

export const useQuoteLineItems = (quoteId?: string) => {
  return useQuery({
    queryKey: ["quote_line_items", quoteId],
    queryFn: async () => {
      if (!quoteId) return [];
      const { data, error } = await supabase
        .from("quote_line_items")
        .select("*")
        .eq("quote_id", quoteId)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as QuoteLineItem[];
    },
    enabled: !!quoteId,
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      quote,
      lineItems,
    }: {
      quote: Omit<Quote, "id" | "quote_number" | "created_at" | "updated_at">;
      lineItems: Omit<QuoteLineItem, "id" | "quote_id">[];
    }) => {
      const { data: createdQuote, error: quoteError } = await supabase
        .from("quotes")
        .insert(quote)
        .select()
        .single();
      if (quoteError) throw quoteError;

      if (lineItems.length > 0) {
        const items = lineItems.map((li, idx) => ({
          ...li,
          quote_id: createdQuote.id,
          display_order: idx,
        }));
        const { error: liError } = await supabase.from("quote_line_items").insert(items);
        if (liError) throw liError;
      }

      return createdQuote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({ title: "Quote Created", description: "Quote has been saved successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};
