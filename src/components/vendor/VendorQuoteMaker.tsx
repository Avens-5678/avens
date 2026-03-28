import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useVendorInventory } from "@/hooks/useVendorInventory";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Trash2, Save, Loader2, IndianRupee } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  unit: string;
  total: number;
}

const VendorQuoteMaker = () => {
  const { data: inventory } = useVendorInventory();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const addFromInventory = (itemId: string) => {
    const item = inventory?.find(i => i.id === itemId);
    if (!item) return;
    setLineItems(prev => [...prev, {
      description: item.name,
      quantity: 1,
      unit_price: item.price_value || 0,
      unit: item.pricing_unit || "Per Day",
      total: item.price_value || 0,
    }]);
  };

  const addCustomLine = () => {
    setLineItems(prev => [...prev, {
      description: "", quantity: 1, unit_price: 0, unit: "Nos", total: 0,
    }]);
  };

  const updateLine = (index: number, field: keyof LineItem, value: any) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantity" || field === "unit_price") {
        updated.total = (updated.quantity || 0) * (updated.unit_price || 0);
      }
      return updated;
    }));
  };

  const removeLine = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const gstAmount = subtotal * 0.18;
  const total = subtotal + gstAmount;

  const handleSave = async () => {
    if (!user || !clientName || lineItems.length === 0) {
      toast({ title: "Missing fields", description: "Add client name and at least one line item", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: quote, error: quoteError } = await supabase.from("quotes").insert({
        client_name: clientName,
        client_phone: clientPhone || null,
        client_email: clientEmail || null,
        notes: notes || null,
        subtotal,
        gst_amount: gstAmount,
        gst_percent: 18,
        total,
        source_type: "vendor",
        created_by: user.id,
        status: "draft",
      } as any).select("id").single();

      if (quoteError) throw quoteError;

      const items = lineItems.map((item, i) => ({
        quote_id: quote.id,
        item_description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total,
        unit: item.unit,
        display_order: i,
      }));

      const { error: itemsError } = await supabase.from("quote_line_items").insert(items);
      if (itemsError) throw itemsError;

      toast({ title: "Quote Created", description: `Quote for ${clientName} — ₹${total.toLocaleString()}` });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });

      // Reset
      setClientName("");
      setClientPhone("");
      setClientEmail("");
      setNotes("");
      setLineItems([]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Quotation Maker</h2>
        <p className="text-muted-foreground text-sm mt-1">Create professional quotes from your inventory</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Client Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Client Name *</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+91 ..." />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Line Items</CardTitle>
            <div className="flex gap-2">
              <Select onValueChange={addFromInventory}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Add from inventory" /></SelectTrigger>
                <SelectContent>
                  {inventory?.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={addCustomLine}>
                <Plus className="h-4 w-4 mr-1" />Custom
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {lineItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No items added yet. Pick from inventory or add a custom line.</p>
          ) : (
            <div className="space-y-3">
              <div className="hidden md:grid grid-cols-[1fr_80px_100px_80px_100px_40px] gap-2 text-xs font-semibold text-muted-foreground uppercase px-2">
                <span>Description</span><span>Qty</span><span>Unit Price</span><span>Unit</span><span>Total</span><span></span>
              </div>
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_80px_100px_80px_100px_40px] gap-2 p-2 bg-muted/30 rounded-lg items-center">
                  <Input className="h-9" value={item.description} onChange={(e) => updateLine(i, "description", e.target.value)} placeholder="Item description" />
                  <Input className="h-9" type="number" min="1" value={item.quantity} onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value) || 1)} />
                  <Input className="h-9" type="number" value={item.unit_price} onChange={(e) => updateLine(i, "unit_price", parseFloat(e.target.value) || 0)} />
                  <Input className="h-9" value={item.unit} onChange={(e) => updateLine(i, "unit", e.target.value)} />
                  <span className="text-sm font-medium flex items-center"><IndianRupee className="h-3 w-3" />{item.total.toLocaleString()}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeLine(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}

          {lineItems.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col items-end gap-1 text-sm">
                <div className="flex gap-8"><span className="text-muted-foreground">Subtotal:</span><span className="font-medium">₹{subtotal.toLocaleString()}</span></div>
                <div className="flex gap-8"><span className="text-muted-foreground">GST (18%):</span><span className="font-medium">₹{gstAmount.toLocaleString()}</span></div>
                <div className="flex gap-8 text-lg font-bold"><span>Total:</span><span>₹{total.toLocaleString()}</span></div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Terms, conditions, or additional notes..." />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Quote
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorQuoteMaker;
