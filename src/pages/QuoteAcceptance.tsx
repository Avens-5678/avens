import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Check, FileText, Pen, Package, Phone, Mail, MapPin, Shield, Clock, Download } from "lucide-react";

interface CompanyInfo {
  company_name: string;
  logo_url: string | null;
  gst_number: string | null;
  pan_number: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

const QuoteAcceptance = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [quote, setQuote] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [showSignPad, setShowSignPad] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      // Fetch quote via secure RPC (requires token match)
      const { data: q, error } = await supabase
        .rpc("get_quote_by_token", { _token: token });

      if (error || !q || (Array.isArray(q) && q.length === 0)) {
        setLoading(false);
        return;
      }

      const quoteData = Array.isArray(q) ? q[0] : q;
      setQuote(quoteData);
      if (quoteData.signed_at) setSigned(true);

      // Fetch line items via secure RPC
      const { data: items } = await supabase
        .rpc("get_quote_line_items_by_token", { _token: token });
      setLineItems(items || []);

      // Fetch company settings
      const { data: cs } = await supabase
        .from("company_settings" as any)
        .select("*")
        .limit(1)
        .single();
      if (cs) setCompany(cs as unknown as CompanyInfo);

      setLoading(false);
    };
    fetchData();
  }, [token]);

  // Canvas drawing logic
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSign = async () => {
    if (!canvasRef.current || !quote) return;
    setSigning(true);

    try {
      const blob = await new Promise<Blob | null>(resolve => canvasRef.current!.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Failed to create signature image");

      const fileName = `signatures/${quote.id}-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage.from("general-uploads").upload(fileName, blob, { contentType: "image/png" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("general-uploads").getPublicUrl(fileName);
      const signatureUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("quotes")
        .update({ signature_url: signatureUrl, signed_at: new Date().toISOString(), status: "accepted" })
        .eq("acceptance_token", token);

      if (updateError) throw updateError;

      if (quote.source_order_id) {
        try {
          await supabase.functions.invoke("sync-quote-to-order", {
            body: { quote_id: quote.id },
          });
        } catch (syncErr) {
          console.error("Order sync failed:", syncErr);
        }
      }

      setSigned(true);
      toast({ title: "Quote Accepted!", description: "Your signature has been recorded successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground font-medium">Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}>
        <div className="max-w-md w-full mx-4 bg-white rounded-2xl shadow-xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Quote Not Found</h2>
          <p className="text-muted-foreground">This quote link is invalid or has expired. Please contact us for assistance.</p>
        </div>
      </div>
    );
  }

  const taxLabel = quote.tax_type === "vat" ? "VAT" : "GST";
  const companyName = company?.company_name || "Evnting (Avens Events Pvt. Ltd.)";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eef2f7 50%, #e2e8f0 100%)" }}>
      {/* Top Accent Bar */}
      <div className="h-1.5" style={{ background: "linear-gradient(90deg, #f59e0b, #d97706, #b45309)" }} />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Professional Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 sm:px-10 py-6 sm:py-8" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {company?.logo_url ? (
                  <img src={company.logo_url} alt={companyName} className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-xl bg-white/10 p-1.5" />
                ) : (
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">E</span>
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{companyName}</h1>
                  <p className="text-white/60 text-sm mt-0.5">Premium Event Management & Rentals</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: signed ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", color: signed ? "#22c55e" : "#f59e0b" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: signed ? "#22c55e" : "#f59e0b" }} />
                  {signed ? "Accepted" : quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Quote Number Banner */}
          <div className="px-6 sm:px-10 py-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-3" style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#92400e" }}>Quotation</p>
              <p className="text-lg font-bold text-foreground mt-0.5">#{quote.quote_number}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{new Date(quote.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>

          {/* Client & Company Info */}
          <div className="px-6 sm:px-10 py-6">
            {quote.source_order_id && (
              <div className="flex items-center gap-2 mb-5 p-3 rounded-xl border border-border/50 bg-muted/30">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Linked Order:</span>
                <Badge variant="outline" className="font-mono text-xs">#{String(quote.source_order_id).substring(0, 8).toUpperCase()}</Badge>
                <Badge variant="secondary" className="capitalize text-xs">{String(quote.source_type || "").replace("_", " ")}</Badge>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Quotation To</p>
                <p className="text-base font-semibold">{quote.client_name}</p>
                {quote.client_email && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{quote.client_email}</span>
                  </div>
                )}
                {quote.client_phone && (
                  <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{quote.client_phone}</span>
                  </div>
                )}
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Quotation From</p>
                <p className="text-base font-semibold">{companyName}</p>
                {company?.address && (
                  <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{company.address}</span>
                  </div>
                )}
                {company?.phone && (
                  <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company?.email && (
                  <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company?.gst_number && (
                  <p className="text-xs text-muted-foreground mt-2">GSTIN: {company.gst_number}</p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="px-6 sm:px-10 pb-6">
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-white/90 rounded-tl-xl">#</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-white/90">Description</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-white/90">Qty</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-white/90">Rate</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-white/90 rounded-tr-xl">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                      <td className="py-3 px-4 text-muted-foreground font-medium">{i + 1}</td>
                      <td className="py-3 px-4 font-medium">{li.item_description}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{li.quantity} {li.unit}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">₹{Number(li.unit_price).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right font-semibold">₹{Number(li.total_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="px-6 sm:px-10 pb-6">
            <div className="max-w-sm ml-auto rounded-xl overflow-hidden border border-border/50">
              <div className="space-y-0">
                <div className="flex justify-between px-5 py-2.5 bg-muted/20">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-medium">₹{Number(quote.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(quote.discount_amount) > 0 && (
                  <div className="flex justify-between px-5 py-2.5 bg-green-50/50">
                    <span className="text-sm text-green-700">Discount</span>
                    <span className="text-sm font-medium text-green-700">- ₹{Number(quote.discount_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {Number(quote.gst_amount) > 0 && (
                  <div className="flex justify-between px-5 py-2.5 bg-muted/20">
                    <span className="text-sm text-muted-foreground">{taxLabel} ({quote.gst_percent}%)</span>
                    <span className="text-sm font-medium">₹{Number(quote.gst_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between px-5 py-4" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                  <span className="text-base font-bold text-white">Total Amount</span>
                  <span className="text-xl font-bold text-white">₹{Number(quote.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="px-6 sm:px-10 pb-6">
              <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Notes & Terms</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{quote.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Signature Section */}
        {signed ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2" style={{ borderColor: "#22c55e" }}>
            <div className="p-8 sm:p-10 text-center" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}>
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-900">Quotation Accepted</h3>
              <p className="text-sm text-green-700 mt-2">
                Digitally signed on {new Date(quote.signed_at || "").toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              {quote.signature_url && (
                <div className="mt-5 inline-block">
                  <p className="text-[10px] uppercase tracking-widest text-green-600 font-semibold mb-2">Digital Signature</p>
                  <div className="bg-white rounded-xl border-2 border-green-200 p-3 inline-block">
                    <img src={quote.signature_url} alt="Signature" className="max-h-20" />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mt-5 text-xs text-green-600">
                <Shield className="h-3.5 w-3.5" />
                <span>This acceptance is digitally verified and legally binding</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 sm:p-10">
              {!showSignPad ? (
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
                    <Pen className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Accept this Quotation</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    By signing below, you confirm acceptance of the above quotation including all terms, line items, and the total amount of <strong>₹{Number(quote.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>.
                  </p>
                  <Button 
                    onClick={() => setShowSignPad(true)} 
                    size="lg" 
                    className="px-10 h-12 text-base font-semibold rounded-xl shadow-lg"
                    style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                  >
                    <Pen className="h-4 w-4 mr-2" />
                    Accept & Sign
                  </Button>
                </div>
              ) : (
                <div className="space-y-5 max-w-lg mx-auto">
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-1">Draw Your Signature</h3>
                    <p className="text-xs text-muted-foreground">Use your mouse or finger to sign in the box below</p>
                  </div>
                  <div className="border-2 border-dashed border-border rounded-xl overflow-hidden mx-auto relative" style={{ maxWidth: 450 }}>
                    <canvas
                      ref={canvasRef}
                      width={450}
                      height={160}
                      className="bg-white cursor-crosshair w-full touch-none"
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={endDraw}
                    />
                    {!hasDrawn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-muted-foreground/30 text-lg font-medium italic">Sign here</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={clearSignature} className="rounded-xl">
                      Clear
                    </Button>
                    <Button 
                      onClick={handleSign} 
                      disabled={!hasDrawn || signing} 
                      className="rounded-xl px-8 font-semibold"
                      style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}
                    >
                      {signing ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Confirm & Accept
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Your signature is encrypted and securely stored</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-xs text-muted-foreground">
            This quotation was generated by <strong>{companyName}</strong>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {company?.phone && (
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{company.phone}</span>
            )}
            {company?.email && (
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{company.email}</span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/60 pt-2">Powered by Evnting.com</p>
        </div>
      </div>
    </div>
  );
};

export default QuoteAcceptance;
