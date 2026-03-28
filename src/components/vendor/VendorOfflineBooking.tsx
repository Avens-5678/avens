import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useVendorInventory } from "@/hooks/useVendorInventory";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Package, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const VendorOfflineBooking = () => {
  const { data: inventory } = useVendorInventory();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    selected_item_id: "",
    event_date: undefined as Date | undefined,
    location: "",
    notes: "",
    budget: "",
  });

  const selectedItem = inventory?.find(i => i.id === formData.selected_item_id);

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.client_name || !formData.selected_item_id || !formData.event_date) {
      toast({ title: "Missing fields", description: "Please fill client name, select item, and pick a date", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const orderId = crypto.randomUUID();
      const dateStr = format(formData.event_date, "yyyy-MM-dd");

      // Create offline order
      const { error: orderError } = await supabase.from("rental_orders").insert({
        id: orderId,
        title: `Offline: ${selectedItem?.name || "Item"}`,
        client_name: formData.client_name,
        client_phone: formData.client_phone || null,
        client_email: formData.client_email || null,
        assigned_vendor_id: user.id,
        vendor_inventory_item_id: formData.selected_item_id,
        event_date: dateStr,
        location: formData.location || null,
        notes: formData.notes || null,
        budget: formData.budget || null,
        status: "confirmed",
        is_vendor_direct: true,
        booking_source: "offline",
        is_offline: true,
        equipment_category: selectedItem?.service_type || "General",
      } as any);

      if (orderError) throw orderError;

      // Block the date in availability
      await supabase.from("vendor_availability").insert({
        vendor_id: user.id,
        inventory_item_id: formData.selected_item_id,
        date: dateStr,
        slot: "full_day",
        is_booked: true,
        is_auto_blocked: true,
        booking_order_id: orderId,
        notes: `Offline booking: ${formData.client_name}`,
      } as any);

      // Decrement quantity
      if (selectedItem && selectedItem.quantity > 0) {
        await supabase.from("vendor_inventory").update({
          quantity: Math.max(0, selectedItem.quantity - 1),
        }).eq("id", selectedItem.id);
      }

      toast({ title: "Offline Booking Created", description: `Order for ${formData.client_name} on ${format(formData.event_date, "MMM d, yyyy")}` });
      queryClient.invalidateQueries({ queryKey: ["vendor_inventory"] });
      queryClient.invalidateQueries({ queryKey: ["vendor_availability"] });

      // Reset form
      setFormData({
        client_name: "", client_phone: "", client_email: "",
        selected_item_id: "", event_date: undefined, location: "", notes: "", budget: "",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create Offline Booking</h2>
        <p className="text-muted-foreground text-sm mt-1">Record walk-in or phone bookings to keep your inventory in sync</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Client Name *</Label>
              <Input value={formData.client_name} onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={formData.client_phone} onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))} placeholder="+91 ..." />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={formData.client_email} onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))} placeholder="client@email.com" />
            </div>
          </div>

          {/* Item Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Select Item *</Label>
              <Select value={formData.selected_item_id} onValueChange={(v) => setFormData(prev => ({ ...prev, selected_item_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Choose from inventory" /></SelectTrigger>
                <SelectContent>
                  {inventory?.filter(i => i.is_available).map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (Qty: {item.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedItem && (
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">{selectedItem.service_type}</Badge>
                  {selectedItem.price_value && <Badge variant="secondary">₹{selectedItem.price_value} / {selectedItem.pricing_unit}</Badge>}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Event Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.event_date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.event_date ? format(formData.event_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.event_date} onSelect={(d) => setFormData(prev => ({ ...prev, event_date: d }))} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Location</Label>
              <Input value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="Event venue / address" />
            </div>
            <div className="space-y-1">
              <Label>Budget / Amount</Label>
              <Input value={formData.budget} onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))} placeholder="e.g. ₹50,000" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} placeholder="Any additional details..." />
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Create Offline Booking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorOfflineBooking;
