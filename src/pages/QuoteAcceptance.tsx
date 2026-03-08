import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Check, FileText, Pen } from "lucide-react";

const QuoteAcceptance = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [quote, setQuote] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [showSignPad, setShowSignPad] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchQuote = async () => {
      const { data: q, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("acceptance_token", token)
        .single();

      if (error || !q) {
        setLoading(false);
        return;
      }

      setQuote(q);
      if (q.signed_at) setSigned(true);

      const { data: items } = await supabase
        .from("quote_line_items")
        .select("*")
        .eq("quote_id", q.id)
        .order("display_order", { ascending: true });

      setLineItems(items || []);
      setLoading(false);
    };
    fetchQuote();
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
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a2e";
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
      // Convert canvas to blob
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
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Quote Not Found</h2>
            <p className="text-muted-foreground">This quote link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const taxLabel = quote.tax_type === "vat" ? "VAT" : "GST";

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">EVNTING</h1>
          <p className="text-sm text-muted-foreground">Premium Event Management & Rentals</p>
        </div>

        {/* Quote Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Quotation #{quote.quote_number}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created {new Date(quote.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <Badge variant={signed ? "default" : "secondary"}>
              {signed ? "Accepted" : quote.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Client</p>
                <p className="font-medium">{quote.client_name}</p>
                {quote.client_email && <p className="text-sm text-muted-foreground">{quote.client_email}</p>}
                {quote.client_phone && <p className="text-sm text-muted-foreground">{quote.client_phone}</p>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">From</p>
                <p className="font-medium">Evnting (Avens Events Pvt. Ltd.)</p>
                <p className="text-sm text-muted-foreground">Hyderabad, Telangana</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Description</th>
                    <th className="text-center py-2 font-semibold">Qty</th>
                    <th className="text-right py-2 font-semibold">Rate</th>
                    <th className="text-right py-2 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">{li.item_description}</td>
                      <td className="py-2 text-center">{li.quantity} {li.unit}</td>
                      <td className="py-2 text-right">₹{Number(li.unit_price).toLocaleString("en-IN")}</td>
                      <td className="py-2 text-right">₹{Number(li.total_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="max-w-xs ml-auto space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{Number(quote.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
              {Number(quote.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>- ₹{Number(quote.discount_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
              )}
              {Number(quote.gst_amount) > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">{taxLabel} ({quote.gst_percent}%)</span><span>₹{Number(quote.gst_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{Number(quote.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
            </div>

            {quote.notes && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{quote.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signature Section */}
        {signed ? (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-6 text-center">
              <Check className="h-12 w-12 mx-auto text-green-600 mb-3" />
              <h3 className="text-lg font-bold text-green-800">Quote Accepted & Signed</h3>
              <p className="text-sm text-green-600 mt-1">Signed on {new Date(quote.signed_at || "").toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
              {quote.signature_url && <img src={quote.signature_url} alt="Signature" className="mx-auto mt-4 max-h-20 border rounded" />}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              {!showSignPad ? (
                <div className="text-center">
                  <Pen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Accept this Quotation</h3>
                  <p className="text-sm text-muted-foreground mb-4">Click below to sign and accept this quote</p>
                  <Button onClick={() => setShowSignPad(true)} size="lg">Accept & Sign</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-center">Draw your signature below</p>
                  <div className="border-2 border-dashed rounded-lg overflow-hidden mx-auto" style={{ width: 400, maxWidth: "100%" }}>
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="bg-white cursor-crosshair w-full touch-none"
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={endDraw}
                    />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={clearSignature}>Clear</Button>
                    <Button onClick={handleSign} disabled={!hasDrawn || signing}>
                      {signing ? "Submitting..." : "Confirm & Accept"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">Powered by Evnting.com</p>
      </div>
    </div>
  );
};

export default QuoteAcceptance;
