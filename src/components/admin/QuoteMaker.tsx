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
import { useCreateQuote, useQuotes, useQuoteVersions, type QuoteLineItem, type Quote } from "@/hooks/useQuotes";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Calculator, Mail, MessageSquare, Download, PackageSearch, Copy, History, Palette } from "lucide-react";
import { downloadQuoteAsPDF, type QuoteTemplate } from "./QuotePrintTemplate";
import QuotePicklistDialog from "./QuotePicklistDialog";

interface QuoteMakerProps {
  prefillOrderId?: string | null;
  prefillSourceType?: "rental_order" | "service_order" | null;
  onClose?: () => void;
}

const QuoteMaker = ({ prefillOrderId, prefillSourceType, onClose }: QuoteMakerProps) => {
  const { data: rentalOrders } = useRentalOrders();
  const { data: serviceOrders } = useServiceOrders();
  const { data: allQuotes } = useQuotes();
  const { data: companySettings } = useCompanySettings();
  const createQuote = useCreateQuote();
  const { toast } = useToast();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompanyName, setClientCompanyName] = useState("");
  const [clientGst, setClientGst] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedSourceType, setSelectedSourceType] = useState<string>(prefillSourceType || "manual");
  const [selectedOrderId, setSelectedOrderId] = useState<string>(prefillOrderId || "");
  const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxType, setTaxType] = useState<"gst" | "vat" | "none">("gst");
  const [taxPercent, setTaxPercent] = useState(18);
  const [template, setTemplate] = useState<QuoteTemplate>("modern");
  const [lineItems, setLineItems] = useState<Omit<QuoteLineItem, "id" | "quote_id">[]>([
    { item_description: "", quantity: 1, unit: "Nos", unit_price: 0, total_price: 0 },
  ]);
  const [sending, setSending] = useState(false);
  const [picklistOpen, setPicklistOpen] = useState(false);
  const [hideRecentQuotes, setHideRecentQuotes] = useState(false);

  // Version control state
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [parentQuoteId, setParentQuoteId] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState(1);
  const { data: versionHistory } = useQuoteVersions(parentQuoteId || editingQuoteId || undefined);

  // Per-quote GST toggle (defaults from company settings)
  const [gstEnabled, setGstEnabled] = useState(true);

  useEffect(() => {
    if (companySettings) {
      setGstEnabled(companySettings.gst_enabled);
      if (!companySettings.gst_enabled) {
        setTaxType("none");
        setTaxPercent(0);
      }
    }
  }, [companySettings]);

  // Sync GST toggle with tax fields
  useEffect(() => {
    if (!gstEnabled) {
      setTaxType("none");
      setTaxPercent(0);
    } else if (taxType === "none") {
      setTaxType("gst");
      setTaxPercent(18);
    }
  }, [gstEnabled]);

  // Fetch client profile by email for company name & GST
  const fetchClientProfile = async (email: string) => {
    if (!email) return;
    const { data } = await supabase
      .from("profiles")
      .select("company_name, gst_number")
      .eq("email", email)
      .limit(1)
      .single();
    if (data) {
      setClientCompanyName(data.company_name || "");
      setClientGst(data.gst_number || "");
    }
  };

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
            setLineItems([{ item_description: order.title, quantity: 1, unit: "Nos", unit_price: 0, total_price: 0 }]);
          }
        } catch {
          setLineItems([{ item_description: order.title, quantity: 1, unit: "Nos", unit_price: 0, total_price: 0 }]);
        }
      }
    } else if (selectedSourceType === "service_order") {
      const order = serviceOrders?.find(o => o.id === selectedOrderId);
      if (order) {
        setClientName(order.client_name || "");
        setClientEmail(order.client_email || "");
        setClientPhone(order.client_phone || "");
        if (order.budget) setNotes(prev => prev ? prev : `Budget: ${order.budget}`);
        setLineItems([{ item_description: order.title, quantity: 1, unit: "Event", unit_price: 0, total_price: 0 }]);
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

  const handlePicklistAdd = (items: Omit<QuoteLineItem, "id" | "quote_id">[]) => {
    setLineItems(prev => {
      // If first item is empty placeholder, replace it
      if (prev.length === 1 && !prev[0].item_description && prev[0].unit_price === 0) {
        return items;
      }
      return [...prev, ...items];
    });
  };

  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((s, li) => s + (li.total_price || 0), 0);
    const discountAmount = discountType === "percent"
      ? subtotal * (discountValue / 100)
      : discountValue;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const effectiveTaxPercent = taxType === "none" ? 0 : taxPercent;
    const taxAmount = afterDiscount * (effectiveTaxPercent / 100);
    const total = afterDiscount + taxAmount;
    return { subtotal, discountAmount, afterDiscount, taxAmount, total, effectiveTaxPercent };
  }, [lineItems, discountType, discountValue, taxType, taxPercent]);

  const buildQuotePayload = (status: string, sentVia: string | null = null) => ({
    source_type: selectedSourceType,
    source_order_id: selectedOrderId || null,
    client_name: clientName,
    client_email: clientEmail || null,
    client_phone: clientPhone || null,
    subtotal: calculations.subtotal,
    discount_type: discountType,
    discount_value: discountValue,
    discount_amount: calculations.discountAmount,
    gst_percent: calculations.effectiveTaxPercent,
    gst_amount: calculations.taxAmount,
    total: calculations.total,
    notes: notes || null,
    status,
    sent_via: sentVia,
    sent_at: sentVia ? new Date().toISOString() : null,
    created_by: null,
    tax_type: taxType,
    template,
    version: currentVersion,
    parent_quote_id: parentQuoteId,
    signature_url: null,
    signed_at: null,
  });

  const handleSave = async () => {
    if (!clientName.trim()) {
      toast({ title: "Client name is required", variant: "destructive" });
      return;
    }

    downloadQuoteAsPDF({
      clientName,
      clientEmail,
      clientPhone,
      clientCompanyName: clientCompanyName || undefined,
      clientGst: clientGst || undefined,
      lineItems,
      subtotal: calculations.subtotal,
      discountType,
      discountValue,
      discountAmount: calculations.discountAmount,
      taxType,
      taxPercent: calculations.effectiveTaxPercent,
      taxAmount: calculations.taxAmount,
      total: calculations.total,
      notes,
      template,
      sourceOrderId: selectedOrderId || null,
      sourceType: selectedSourceType !== "manual" ? selectedSourceType : null,
      companyName: companySettings?.company_name,
      companyLogoUrl: companySettings?.logo_url,
      companyGst: companySettings?.gst_number,
      companyPan: companySettings?.pan_number,
      companyAddress: companySettings?.address,
      companyPhone: companySettings?.phone,
      companyEmail: companySettings?.email,
      gstEnabled,
    });

    createQuote.mutate({ quote: buildQuotePayload("draft"), lineItems });
  };

  const handleSendVia = async (via: "email" | "whatsapp") => {
    if (!clientName.trim()) {
      toast({ title: "Save quote first", variant: "destructive" });
      return;
    }
    setSending(true);

    if (via === "whatsapp") {
      if (!clientPhone) {
        toast({ title: "Missing phone number", description: "Client phone is required to send via WhatsApp.", variant: "destructive" });
        setSending(false);
        return;
      }

      try {
        // Save the quote first to get the acceptance token
        const { data: createdQuote, error: insertError } = await supabase
          .from("quotes")
          .insert(buildQuotePayload("sent", "whatsapp") as any)
          .select("id, acceptance_token, quote_number")
          .single();

        if (insertError || !createdQuote) throw new Error(insertError?.message || "Failed to create quote");

        // Insert line items
        if (lineItems.length > 0) {
          await supabase.from("quote_line_items").insert(
            lineItems.map((li, idx) => ({ ...li, quote_id: createdQuote.id, display_order: idx }))
          );
        }

        // Send via WATI edge function
        const { data: watiResult, error: watiError } = await supabase.functions.invoke("wati-quote-notification", {
          body: {
            clientName,
            clientPhone,
            quoteNumber: createdQuote.quote_number,
            acceptanceToken: createdQuote.acceptance_token,
            sourceOrderId: selectedOrderId || null,
          },
        });

        if (watiError) {
          toast({ title: "Quote saved", description: `Quote created but WhatsApp failed: ${watiError.message}`, variant: "destructive" });
        } else if (watiResult?.success) {
          toast({ title: "WhatsApp Sent!", description: `Quote sent to ${clientPhone} via WATI.` });
        } else {
          toast({ title: "Quote saved", description: `WhatsApp failed: ${watiResult?.error || "Unknown error"}`, variant: "destructive" });
        }
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }

      setSending(false);
      return;
    }

    // Email flow — save quote then send via edge function
    if (!clientEmail) {
      toast({ title: "Missing email", description: "No email provided.", variant: "destructive" });
      setSending(false);
      return;
    }

    try {
      const { data: createdQuote, error: insertError } = await supabase
        .from("quotes")
        .insert(buildQuotePayload("sent", "email") as any)
        .select("id, acceptance_token, quote_number")
        .single();

      if (insertError || !createdQuote) throw new Error(insertError?.message || "Failed to create quote");

      if (lineItems.length > 0) {
        await supabase.from("quote_line_items").insert(
          lineItems.map((li, idx) => ({ ...li, quote_id: createdQuote.id, display_order: idx }))
        );
      }

      const taxLabel = taxType === "vat" ? "VAT" : "GST";
      const { data: emailResult, error: emailError } = await supabase.functions.invoke("send-quote-email", {
        body: {
          clientName,
          clientEmail,
          quoteNumber: createdQuote.quote_number,
          acceptanceToken: createdQuote.acceptance_token,
          sourceOrderId: selectedOrderId || null,
          lineItems,
          subtotal: calculations.subtotal,
          discountAmount: calculations.discountAmount,
          taxLabel,
          taxPercent: calculations.effectiveTaxPercent,
          taxAmount: calculations.taxAmount,
          total: calculations.total,
          notes,
        },
      });

      if (emailError) {
        toast({ title: "Quote saved", description: `Email failed: ${emailError.message}`, variant: "destructive" });
      } else if (emailResult?.success) {
        toast({ title: "Email Sent!", description: `Quote emailed to ${clientEmail}.` });
      } else {
        toast({ title: "Quote saved", description: `Email failed: ${emailResult?.error || "Unknown error"}`, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }

    setSending(false);
  };

  const handleCopyAcceptanceLink = async () => {
    if (!clientName.trim()) {
      toast({ title: "Save the quote first", variant: "destructive" });
      return;
    }

    // Create quote and get acceptance token
    const { data: createdQuote, error } = await supabase
      .from("quotes")
      .insert(buildQuotePayload("sent") as any)
      .select("id, acceptance_token")
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // Insert line items
    if (lineItems.length > 0) {
      await supabase.from("quote_line_items").insert(
        lineItems.map((li, idx) => ({ ...li, quote_id: createdQuote.id, display_order: idx }))
      );
    }

    const baseUrl = "https://evnting.com";
    const link = `${baseUrl}/quote/${createdQuote.acceptance_token}`;
    await navigator.clipboard.writeText(link);
    toast({ title: "Acceptance Link Copied!", description: "Share this link with the client to accept & sign." });
  };

  const handleReviseQuote = (quote: Quote) => {
    setHideRecentQuotes(false);
    setEditingQuoteId(quote.id);
    setParentQuoteId(quote.parent_quote_id || quote.id);
    setCurrentVersion((quote.version || 1) + 1);
    setClientName(quote.client_name);
    setClientEmail(quote.client_email || "");
    setClientPhone(quote.client_phone || "");
    setNotes(quote.notes || "");
    setTaxType((quote.tax_type as any) || "gst");
    setTaxPercent(quote.gst_percent || 18);
    setTemplate((quote.template as QuoteTemplate) || "modern");
    setDiscountType((quote.discount_type as any) || "amount");
    setDiscountValue(quote.discount_value || 0);
    toast({ title: `Revising to v${(quote.version || 1) + 1}`, description: "Make your changes and save." });
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
          <p className="text-muted-foreground text-sm">Create custom quotes with dynamic pricing, templates & signature</p>
        </div>
        {onClose && <Button variant="outline" onClick={onClose}>← Back</Button>}
      </div>

      {/* Source Selection + Template */}
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
                {selectedOrderId && (
                  <Badge variant="outline" className="mt-2 font-mono text-xs">
                    Order: #{selectedOrderId.substring(0, 8).toUpperCase()}
                  </Badge>
                )}
              </div>
            )}
            <div>
              <Label className="flex items-center gap-1"><Palette className="h-3 w-3" />Template</Label>
              <Select value={template} onValueChange={v => setTemplate(v as QuoteTemplate)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">🟠 Modern (Orange)</SelectItem>
                  <SelectItem value="classic">🔵 Classic (Navy & Gold)</SelectItem>
                  <SelectItem value="creative">🟣 Creative (Gradient)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Info */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3"><CardTitle className="text-base">Client Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><Label>Name *</Label><Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name" /></div>
            <div><Label>Email</Label><Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} onBlur={() => fetchClientProfile(clientEmail)} placeholder="client@email.com" /></div>
            <div><Label>Phone</Label><Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+91 ..." /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Company Name</Label><Input value={clientCompanyName} onChange={e => setClientCompanyName(e.target.value)} placeholder="Client's company (optional)" /></div>
            <div><Label>Client GSTIN</Label><Input value={clientGst} onChange={e => setClientGst(e.target.value)} placeholder="Client's GST number (optional)" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Line Items</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPicklistOpen(true)} className="gap-1">
              <PackageSearch className="h-4 w-4" />Pick from Catalog
            </Button>
            <Button size="sm" variant="outline" onClick={addLineItem}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
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
          {/* GST Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div>
              <p className="text-sm font-medium">GST Billing</p>
              <p className="text-xs text-muted-foreground">When OFF, GSTIN & PAN won't appear on quotes and tax won't be calculated</p>
            </div>
            <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {gstEnabled && (
              <div>
                <Label>Tax Type</Label>
                <Select value={taxType} onValueChange={v => setTaxType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gst">GST</SelectItem>
                    <SelectItem value="vat">VAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {gstEnabled && (
              <div>
                <Label>{taxType.toUpperCase()} %</Label>
                <Input type="number" min={0} max={100} value={taxPercent} onChange={e => setTaxPercent(parseFloat(e.target.value) || 0)} />
              </div>
            )}
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
          </div>

          <Separator />

          <div className="space-y-2 max-w-xs ml-auto text-right">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">₹{calculations.subtotal.toLocaleString()}</span></div>
            {calculations.discountAmount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{calculations.discountAmount.toLocaleString()}</span></div>
            )}
            {taxType !== "none" && (
              <div className="flex justify-between"><span className="text-muted-foreground">{taxType.toUpperCase()} ({calculations.effectiveTaxPercent}%)</span><span>₹{calculations.taxAmount.toLocaleString()}</span></div>
            )}
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

      {/* Version History */}
      {versionHistory && versionHistory.length > 1 && (
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" />Version History</CardTitle>
              <Button size="sm" variant="outline" onClick={() => { setEditingQuoteId(null); setParentQuoteId(null); setCurrentVersion(1); setClientName(""); setClientEmail(""); setClientPhone(""); setClientCompanyName(""); setClientGst(""); setNotes(""); setLineItems([{ item_description: "", quantity: 1, unit: "nos", unit_price: 0, total_price: 0 }]); setDiscountValue(0); }}>Clear</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {versionHistory.map(v => (
                <div key={v.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant={v.id === editingQuoteId ? "default" : "outline"}>v{v.version || 1}</Badge>
                    <span className="text-sm">{v.quote_number}</span>
                    <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{v.status}</Badge>
                    {v.signed_at && <Badge className="bg-green-100 text-green-800">Signed</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Quotes for Revision */}
      {allQuotes && allQuotes.length > 0 && !editingQuoteId && !hideRecentQuotes && (
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" />Recent Quotes — Revise</CardTitle>
              <Button size="sm" variant="outline" onClick={() => { setHideRecentQuotes(true); setClientName(""); setClientEmail(""); setClientPhone(""); setClientCompanyName(""); setClientGst(""); setNotes(""); setLineItems([{ item_description: "", quantity: 1, unit: "nos", unit_price: 0, total_price: 0 }]); setDiscountValue(0); }}>Clear</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allQuotes.slice(0, 10).map(q => (
                <div key={q.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">v{q.version || 1}</Badge>
                    <span className="text-sm font-medium">{q.client_name}</span>
                    <span className="text-xs text-muted-foreground">{q.quote_number}</span>
                    <span className="text-xs text-muted-foreground">₹{Number(q.total).toLocaleString()}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleReviseQuote(q)}>Revise</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Button onClick={handleSave} disabled={createQuote.isPending} className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          {createQuote.isPending ? "Saving..." : "Save & Download Quote"}
        </Button>
        <Button variant="outline" onClick={() => handleSendVia("email")} disabled={sending} className="flex-1 gap-2">
          <Mail className="h-4 w-4" />Email
        </Button>
        <Button variant="outline" onClick={() => handleSendVia("whatsapp")} disabled={sending} className="flex-1 gap-2">
          <MessageSquare className="h-4 w-4" />WhatsApp
        </Button>
        <Button variant="secondary" onClick={handleCopyAcceptanceLink} className="flex-1 gap-2">
          <Copy className="h-4 w-4" />Copy Acceptance Link
        </Button>
      </div>

      <QuotePicklistDialog open={picklistOpen} onOpenChange={setPicklistOpen} onAddItems={handlePicklistAdd} />
    </div>
  );
};

export default QuoteMaker;
