import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { downloadQuoteAsPDF, type QuotePrintData } from "@/components/admin/QuotePrintTemplate";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  subtotal: number;
  discount_type: string | null;
  discount_value: number | null;
  discount_amount: number | null;
  gst_percent: number | null;
  gst_amount: number | null;
  total: number;
  notes: string | null;
  status: string;
  tax_type: string | null;
  template: string | null;
  version: number | null;
  acceptance_token: string | null;
  signature_url: string | null;
  signed_at: string | null;
  created_at: string;
  source_order_id: string | null;
  source_type: string;
}

interface LineItem {
  item_description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

/**
 * Shows the latest quote linked to an order (by source_order_id).
 * Includes Accept & Download buttons.
 */
const OrderQuoteCard = ({ orderId }: { orderId: string }) => {
  const { data: company } = useCompanySettings();
  const [downloading, setDownloading] = useState(false);

  // Fetch latest quote for this order (highest version)
  const { data: quote, isLoading } = useQuery({
    queryKey: ["order_quote", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("source_order_id", orderId)
        .order("version", { ascending: false })
        .limit(1);
      if (error) throw error;
      return (data && data.length > 0 ? data[0] : null) as Quote | null;
    },
    enabled: !!orderId,
  });

  // Fetch line items when we have a quote
  const { data: lineItems } = useQuery({
    queryKey: ["order_quote_items", quote?.id],
    queryFn: async () => {
      if (!quote) return [];
      const { data, error } = await supabase
        .from("quote_line_items")
        .select("*")
        .eq("quote_id", quote.id)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as LineItem[];
    },
    enabled: !!quote?.id,
  });

  if (isLoading) return null;
  if (!quote) return null;

  const isAccepted = quote.status === "accepted" || !!quote.signed_at;
  const acceptanceUrl = quote.acceptance_token
    ? `https://evnting.com/quote/${quote.acceptance_token}`
    : null;

  const handleDownload = () => {
    if (!lineItems) return;
    setDownloading(true);
    try {
      const printData: QuotePrintData = {
        quoteNumber: quote.quote_number,
        sourceOrderId: quote.source_order_id,
        sourceType: quote.source_type,
        clientName: quote.client_name,
        clientEmail: quote.client_email || "",
        clientPhone: quote.client_phone || "",
        lineItems: lineItems.map((li) => ({
          item_description: li.item_description,
          quantity: li.quantity,
          unit: li.unit || "nos",
          unit_price: li.unit_price,
          total_price: li.total_price,
        })),
        subtotal: quote.subtotal,
        discountType: quote.discount_type || "amount",
        discountValue: quote.discount_value || 0,
        discountAmount: quote.discount_amount || 0,
        taxType: quote.tax_type || "gst",
        taxPercent: quote.gst_percent || 18,
        taxAmount: quote.gst_amount || 0,
        total: quote.total,
        notes: quote.notes || "",
        template: (quote.template as any) || "modern",
        companyName: company?.company_name,
        companyLogoUrl: company?.logo_url,
        companyGst: company?.gst_number,
        companyPan: company?.pan_number,
        companyAddress: company?.address,
        companyPhone: company?.phone,
        companyEmail: company?.email,
        gstEnabled: company?.gst_enabled,
      };
      downloadQuoteAsPDF(printData);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">Quote {quote.quote_number}</span>
                {(quote.version ?? 1) > 1 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    v{quote.version}
                  </Badge>
                )}
                <Badge
                  className={
                    isAccepted
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : quote.status === "sent"
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  }
                >
                  {isAccepted ? "Accepted" : quote.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                ₹{quote.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })} •{" "}
                {format(new Date(quote.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={downloading || !lineItems}
              className="h-8 text-xs"
            >
              {downloading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              PDF
            </Button>

            {!isAccepted && acceptanceUrl && (
              <Button
                size="sm"
                onClick={() => window.open(acceptanceUrl, "_blank")}
                className="h-8 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Accept
              </Button>
            )}

            {isAccepted && (
              <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <CheckCircle className="h-4 w-4" />
                Signed
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderQuoteCard;
