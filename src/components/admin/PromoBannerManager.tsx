import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

const defaultBanner: Omit<PromoBanner, "id"> = {
  title: "",
  subtitle: "",
  cta_text: "Shop Now",
  gradient_from: "#7c3aed",
  gradient_to: "#a855f7",
  image_url: null,
  display_order: 0,
  is_active: true,
};

const PromoBannerManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PromoBanner | null>(null);
  const [form, setForm] = useState(defaultBanner);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-promo-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as PromoBanner[];
    },
  });

  const openNew = () => {
    setEditing(null);
    setForm(defaultBanner);
    setDialogOpen(true);
  };

  const openEdit = (banner: PromoBanner) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      cta_text: banner.cta_text,
      gradient_from: banner.gradient_from,
      gradient_to: banner.gradient_to,
      image_url: banner.image_url,
      display_order: banner.display_order,
      is_active: banner.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from("promo_banners")
        .update(form)
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Error updating banner", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Banner updated" });
    } else {
      const { error } = await supabase.from("promo_banners").insert(form);
      if (error) {
        toast({ title: "Error creating banner", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Banner created" });
    }

    queryClient.invalidateQueries({ queryKey: ["admin-promo-banners"] });
    queryClient.invalidateQueries({ queryKey: ["promo-banners"] });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("promo_banners").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Banner deleted" });
    queryClient.invalidateQueries({ queryKey: ["admin-promo-banners"] });
    queryClient.invalidateQueries({ queryKey: ["promo-banners"] });
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Promotional Banners</CardTitle>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Add Banner
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {banner.image_url ? (
              <img src={banner.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${banner.gradient_from || "#7c3aed"}, ${banner.gradient_to || "#a855f7"})`,
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{banner.title}</p>
              <p className="text-xs text-muted-foreground truncate">{banner.subtitle}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${banner.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {banner.is_active ? "Active" : "Inactive"}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(banner)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(banner.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {banners.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground text-center py-6">No banners yet. Add one above.</p>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "New Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div>
              <Label>CTA Text</Label>
              <Input value={form.cta_text || ""} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} />
            </div>
            <div>
              <Label>Banner Image URL</Label>
              <Input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value || null })} placeholder="https://... (optional)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Gradient From</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.gradient_from || "#7c3aed"}
                    onChange={(e) => setForm({ ...form, gradient_from: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <Input value={form.gradient_from || ""} onChange={(e) => setForm({ ...form, gradient_from: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div>
                <Label>Gradient To</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.gradient_to || "#a855f7"}
                    onChange={(e) => setForm({ ...form, gradient_to: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <Input value={form.gradient_to || ""} onChange={(e) => setForm({ ...form, gradient_to: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>
            {/* Preview */}
            <div
              className="rounded-lg p-4"
              style={{
                background: `linear-gradient(135deg, ${form.gradient_from || "#7c3aed"}, ${form.gradient_to || "#a855f7"})`,
              }}
            >
              <p className="text-white font-bold text-sm">{form.title || "Banner Title"}</p>
              <p className="text-white/70 text-xs">{form.subtitle || "Subtitle text"}</p>
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
              {editing ? "Update Banner" : "Create Banner"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PromoBannerManager;
