import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRentalOrders } from "@/hooks/useRentalOrders";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { useCreateQuote, type QuoteLineItem } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Calculator, Send, Mail, MessageSquare } from "lucide-react";

interface QuoteMakerProps {
  prefillOrderId?: string | null;
  prefillSourceType?: "rental_order" | "service_order" | null;
  onClose?: () => void;
}

const QuoteMaker = ({ prefillOrderId, prefillSourceType, onClose }: QuoteMakerProps) => {
  const { data: rentalOrders } = useRentalOrders();
  const { data: serviceOrders } = useServiceOrders();
  const createQuote = useCreateQuote();
  const { toast } = useToast();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedSourceType, setSelectedSourceType] = useState<string>(prefillSourceType || "manual");
  const [selectedOrderId, setSelectedOrderId] = useState<string>(prefillOrderId || "");
  const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");
  const [discountValue, setDiscountValue] = useState(0);
  const [gstPercent, setGstPercent] = useState(18);
  const [lineItems, setLineItems] = useState<Omit<QuoteLineItem, "id" | "quote_id">[]>([
    { item_description: "", quantity: 1, unit: "Nos", unit_price: 0, total_price: 0 },
  ]);
  const [sending, setSending] = useState(false);

  // Auto-populate from selected order
  useEffect(() => {
    if (!selectedOrderId) return;
    if (selectedSourceType === "rental_order") {
      const order = rentalOrders?.find(o => o.id === selectedOrderId);
      if (order) {
        setClientName(order.client_name || "");
        setClientEmail(order.client_email || "");
        setClientPhone(order.client_phone || "");
        if (order.budget) setNotes(prev => prev ? prev : `Budget: ${order.budget}`);
        // Parse equipment details if cart items exist
        try {
          const details = JSON.parse(order.equipment_details || "{}");
          if (details.cart_items?.length) {
            setLineItems(details.cart_items.map((ci: any) => ({
              item_description: ci.title || "",
              quantity: ci.quantity || 1,
              unit: ci.pricing_unit || "Nos",
              unit_price: ci.price_value || 0,
              total_price: (ci.price_value || 0) * (ci.quantity || 1),
            })));
          } else {
            setLineItems([{
              item_description: order.title,
              quantity: 1,
              unit: "Nos",
              unit_price: 0,
              total_price: 0,
            }]);
          }
        } catch {
          setLineItems([{
            item_description: order.title,
            quantity: 1,
            unit: "Nos",
            unit_price: 0,
            total_price: 0,
          }]);
        }
      }
    } else if (selectedSourceType === "service_order") {
      const order = serviceOrders?.find(o => o.id === selectedOrderId);
      if (order) {
        setClientName(order.client_name || "");
        setClientEmail(order.client_email || "");
        setClientPhone(order.client_phone || "");
        if (order.budget) setNotes(prev => prev ? prev : `Budget: ${order.budget}`);
        setLineItems([{
          item_description: order.title,
          quantity: 1,
          unit: "Event",
          unit_price: 0,
          total_price: 0,
        }]);
      }
    }
  }, [selectedOrderId, selectedSourceType, rentalOrders, serviceOrders]);

  const addLineItem = () => {
    setLineItems(prev => [...prev, { item_description: "", quantity: 1, unit: "Nos", unit_price: 0, total_price: 0 }]);
  };

  const removeLineItem = (idx: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateLineItem = (idx: number, field: string, value: any) => {
    setLineItems(prev => prev.map((li, i) => {
      if (i !== idx) return li;
      const updated = { ...li, [field]: value };
      updated.total_price = (updated.quantity || 0) * (updated.unit_price || 0);
      return updated;
    }));
  };

  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((s, li) => s + (li.total_price || 0), 0);
    const discountAmount = discountType === "percent"
      ? subtotal * (discountValue / 100)
      : discountValue;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const gstAmount = afterDiscount * (gstPercent / 100);
    const total = afterDiscount + gstAmount;
    return { subtotal, discountAmount, afterDiscount, gstAmount, total };
  }, [lineItems, discountType, discountValue, gstPercent]);

  const handleSave = async () => {
    if (!clientName.trim()) {
      toast({ title: "Client name is required", variant: "destructive" });
      return;
    }
    if (lineItems.some(li => li.unit_price < 0)) {
      toast({ title: "Prices must be ≥ 0", variant: "destructive" });
      return;
    }

    createQuote.mutate({
      quote: {
        source_type: selectedSourceType,
        source_order_id: selectedOrderId || null,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        subtotal: calculations.subtotal,
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: calculations.discountAmount,
        gst_percent: gstPercent,
        gst_amount: calculations.gstAmount,
        total: calculations.total,
        notes: notes || null,
        status: "draft",
        sent_via: null,
        sent_at: null,
        created_by: null,
      },
      lineItems,
    });
  };

  const handleSendVia = async (via: "email" | "whatsapp") => {
    if (!clientName.trim()) {
      toast({ title: "Save quote first", variant: "destructive" });
      return;
    }
    setSending(true);

    // Build quote summary text
    const itemsText = lineItems.map((li, i) =>
      `${i + 1}. ${li.item_description} — ${li.quantity} ${li.unit} × ₹${li.unit_price.toLocaleString()} = ₹${li.total_price.toLocaleString()}`
    ).join("\n");

    const quoteText = `📋 *Quote for ${clientName}*\n\n${itemsText}\n\nSubtotal: ₹${calculations.subtotal.toLocaleString()}\nDiscount: ₹${calculations.discountAmount.toLocaleString()}\nGST (${gstPercent}%): ₹${calculations.gstAmount.toLocaleString()}\n\n💰 *Total: ₹${calculations.total.toLocaleString()}*`;

    if (via === "whatsapp" && clientPhone) {
      const phone = clientPhone.replace(/[^0-9]/g, "");
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(quoteText)}`;
      window.open(url, "_blank");
      toast({ title: "WhatsApp opened", description: "Quote message ready to send." });
    } else if (via === "email" && clientEmail) {
      const subject = encodeURIComponent(`Quote from Evnting - ${clientName}`);
      const body = encodeURIComponent(quoteText.replace(/\*/g, ""));
      window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, "_blank");
      toast({ title: "Email client opened", description: "Quote ready to send via email." });
    } else {
      toast({ title: "Missing contact", description: `No ${via === "email" ? "email" : "phone"} provided.`, variant: "destructive" });
    }

    // Save the quote with sent status
    createQuote.mutate({
      quote: {
        source_type: selectedSourceType,
        source_order_id: selectedOrderId || null,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        subtotal: calculations.subtotal,
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: calculations.discountAmount,
        gst_percent: gstPercent,
        gst_amount: calculations.gstAmount,
        total: calculations.total,
        notes: notes || null,
        status: "sent",
        sent_via: via,
        sent_at: new Date().toISOString(),
        created_by: null,
      },
      lineItems,
    });

    setSending(false);
  };

  const availableOrders = selectedSourceType === "rental_order"
    ? (rentalOrders || []).map(o => ({ id: o.id, label: `${o.title} — ${o.client_name || "No client"}` }))
    : selectedSourceType === "service_order"
      ? (serviceOrders || []).map(o => ({ id: o.id, label: `${o.title} — ${o.client_name || "No client"}` }))
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quote Maker</h2>
          <p className="text-muted-foreground text-sm">Create custom quotes with dynamic pricing</p>
        </div>
        {onClose && <Button variant="outline" onClick={onClose}>← Back</Button>}
      </div>

      {/* Source Selection */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Source</Label>
              <Select value={selectedSourceType} onValueChange={v => { setSelectedSourceType(v); setSelectedOrderId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">From Scratch</SelectItem>
                  <SelectItem value="rental_order">From Rental Order</SelectItem>
                  <SelectItem value="service_order">From Service Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedSourceType !== "manual" && (
              <div>
                <Label>Select Order</Label>
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                  <SelectTrigger><SelectValue placeholder="Choose an order..." /></SelectTrigger>
                  <SelectContent>
                    {availableOrders.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Info */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3"><CardTitle className="text-base">Client Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><Label>Name *</Label><Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name" /></div>
            <div><Label>Email</Label><Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="client@email.com" /></div>
            <div><Label>Phone</Label><Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+91 ..." /></div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Line Items</CardTitle>
          <Button size="sm" variant="outline" onClick={addLineItem}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-2">Unit</div>
            <div className="col-span-2">Price (₹)</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-1"></div>
          </div>

          {lineItems.map((li, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-4">
                <Label className="sm:hidden text-xs">Description</Label>
                <Input value={li.item_description} onChange={e => updateLineItem(idx, "item_description", e.target.value)} placeholder="Item description" />
              </div>
              <div className="sm:col-span-2">
                <Label className="sm:hidden text-xs">Qty</Label>
                <Input type="number" min={0} step="any" value={li.quantity} onChange={e => updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="sm:col-span-2">
                <Label className="sm:hidden text-xs">Unit</Label>
                <Select value={li.unit} onValueChange={v => updateLineItem(idx, "unit", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Nos", "Sq.Ft", "Sq.M", "Per Day", "Per Event", "Hours", "Sets"].map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="sm:hidden text-xs">Unit Price</Label>
                <Input type="number" min={0} step="any" value={li.unit_price} onChange={e => updateLineItem(idx, "unit_price", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="sm:col-span-1 flex items-center">
                <span className="text-sm font-semibold">₹{li.total_price.toLocaleString()}</span>
              </div>
              <div className="sm:col-span-1 flex justify-end">
                {lineItems.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeLineItem(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Calculations */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="h-4 w-4" />Price Calculation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={v => setDiscountType(v as "amount" | "percent")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">Amount (₹)</SelectItem>
                  <SelectItem value="percent">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Discount Value</Label>
              <Input type="number" min={0} step="any" value={discountValue} onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>GST %</Label>
              <Input type="number" min={0} max={100} value={gstPercent} onChange={e => setGstPercent(parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <Separator />

          <div className="space-y-2 max-w-xs ml-auto text-right">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">₹{calculations.subtotal.toLocaleString()}</span></div>
            {calculations.discountAmount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{calculations.discountAmount.toLocaleString()}</span></div>
            )}
            <div className="flex justify-between"><span className="text-muted-foreground">GST ({gstPercent}%)</span><span>₹{calculations.gstAmount.toLocaleString()}</span></div>
            <Separator />
            <div className="flex justify-between text-lg"><span className="font-bold">Total</span><span className="font-bold text-primary">₹{calculations.total.toLocaleString()}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="rounded-2xl">
        <CardContent className="p-5">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes for the quote..." rows={3} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSave} disabled={createQuote.isPending} className="flex-1">
          {createQuote.isPending ? "Saving..." : "Save Quote"}
        </Button>
        <Button variant="outline" onClick={() => handleSendVia("email")} disabled={sending} className="flex-1 gap-2">
          <Mail className="h-4 w-4" />Send via Email
        </Button>
        <Button variant="outline" onClick={() => handleSendVia("whatsapp")} disabled={sending} className="flex-1 gap-2">
          <MessageSquare className="h-4 w-4" />Send via WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default QuoteMaker;
