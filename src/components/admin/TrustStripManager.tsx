import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, GripVertical, Truck, Shield, Headphones, RotateCcw, Star, Heart, Zap, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LucideIcon } from "lucide-react";

const iconOptions: { value: string; Icon: LucideIcon }[] = [
  { value: "Truck", Icon: Truck },
  { value: "Shield", Icon: Shield },
  { value: "Headphones", Icon: Headphones },
  { value: "RotateCcw", Icon: RotateCcw },
  { value: "Star", Icon: Star },
  { value: "Heart", Icon: Heart },
  { value: "Zap", Icon: Zap },
  { value: "Package", Icon: Package },
];

const iconMap: Record<string, LucideIcon> = Object.fromEntries(
  iconOptions.map((o) => [o.value, o.Icon])
);

interface TrustItem {
  id: string;
  icon_name: string;
  text: string;
  display_order: number | null;
  is_active: boolean | null;
}

const defaultItem = {
  icon_name: "Shield",
  text: "",
  display_order: 0,
  is_active: true,
};

const TrustStripManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TrustItem | null>(null);
  const [form, setForm] = useState(defaultItem);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-trust-strip"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_strip_items")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as TrustItem[];
    },
  });

  const openNew = () => {
    setEditing(null);
    setForm(defaultItem);
    setDialogOpen(true);
  };

  const openEdit = (item: TrustItem) => {
    setEditing(item);
    setForm({
      icon_name: item.icon_name,
      text: item.text,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.text.trim()) {
      toast({ title: "Text is required", variant: "destructive" });
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from("trust_strip_items")
        .update(form)
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Item updated" });
    } else {
      const { error } = await supabase.from("trust_strip_items").insert(form);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Item created" });
    }

    queryClient.invalidateQueries({ queryKey: ["admin-trust-strip"] });
    queryClient.invalidateQueries({ queryKey: ["trust-strip-items"] });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("trust_strip_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Item deleted" });
    queryClient.invalidateQueries({ queryKey: ["admin-trust-strip"] });
    queryClient.invalidateQueries({ queryKey: ["trust-strip-items"] });
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trust Strip (Ribbon)</CardTitle>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {items.map((item) => {
          const Icon = iconMap[item.icon_name] || Shield;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.text}</p>
                <p className="text-[10px] text-muted-foreground">Icon: {item.icon_name} · Order: {item.display_order}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {item.is_active ? "Active" : "Inactive"}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground text-center py-6">No items yet.</p>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Trust Item" : "New Trust Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Icon</Label>
              <Select value={form.icon_name} onValueChange={(v) => setForm({ ...form, icon_name: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.Icon className="h-4 w-4" />
                        {opt.value}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Text *</Label>
              <Input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="e.g. Free Delivery above ₹10,000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Display Order</Label>
                <Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
            </div>
            <Button className="w-full" onClick={handleSave}>
              {editing ? "Update Item" : "Create Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TrustStripManager;
