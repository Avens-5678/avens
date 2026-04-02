import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: string;
  display_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  device: string;
  service_type: string;
  created_at: string;
}

const PLACEMENTS = [
  { value: "hero", label: "Hero" },
  { value: "category", label: "Category" },
  { value: "popup", label: "Popup" },
  { value: "sidebar", label: "Sidebar" },
];

const DEVICES = [
  { value: "both", label: "All Devices" },
  { value: "mobile", label: "Mobile Only" },
  { value: "desktop", label: "Desktop Only" },
];

const PLACEMENT_COLORS: Record<string, string> = {
  hero: "bg-purple-100 text-purple-700",
  category: "bg-blue-100 text-blue-700",
  popup: "bg-amber-100 text-amber-700",
  sidebar: "bg-emerald-100 text-emerald-700",
};

const AdminBannerManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["cms-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Banner[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("promo_banners").update({ is_active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms-banners"] }),
  });

  const reorder = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const idx = banners.findIndex((b) => b.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= banners.length) return;
      const current = banners[idx];
      const swap = banners[swapIdx];
      await supabase.from("promo_banners").update({ display_order: swap.display_order } as any).eq("id", current.id);
      await supabase.from("promo_banners").update({ display_order: current.display_order } as any).eq("id", swap.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms-banners"] }),
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-banners"] });
      toast({ title: "Banner deleted" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Promo Banners</h3>
          <p className="text-sm text-muted-foreground">{banners.length} banners</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setEditBanner(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />Add Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs w-[40px]">#</TableHead>
                <TableHead className="text-xs">Banner</TableHead>
                <TableHead className="text-xs w-[80px]">Placement</TableHead>
                <TableHead className="text-xs w-[80px]">Device</TableHead>
                <TableHead className="text-xs w-[100px]">Schedule</TableHead>
                <TableHead className="text-xs w-[60px]">Active</TableHead>
                <TableHead className="text-xs w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner, idx) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => reorder.mutate({ id: banner.id, direction: "up" })} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                      <button onClick={() => reorder.mutate({ id: banner.id, direction: "down" })} disabled={idx === banners.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {banner.image_url ? (
                        <img src={banner.image_url} alt="" className="w-16 h-10 rounded object-cover border border-border" />
                      ) : (
                        <div className="w-16 h-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{banner.title}</p>
                        {banner.subtitle && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{banner.subtitle}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${PLACEMENT_COLORS[banner.placement] || ""}`}>
                      {banner.placement}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground capitalize">{banner.device}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">
                    {banner.starts_at ? format(new Date(banner.starts_at), "dd MMM") : "—"}
                    {" → "}
                    {banner.ends_at ? format(new Date(banner.ends_at), "dd MMM") : "∞"}
                  </TableCell>
                  <TableCell>
                    <Switch checked={banner.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: banner.id, is_active: v })} className="scale-75" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 px-1.5" onClick={() => { setEditBanner(banner); setDialogOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 px-1.5 text-destructive" onClick={() => { if (confirm("Delete this banner?")) deleteBanner.mutate(banner.id); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BannerDialog open={dialogOpen} onOpenChange={setDialogOpen} editData={editBanner} nextOrder={banners.length} />
    </div>
  );
};

// ── Banner Add/Edit Dialog ──
const BannerDialog = ({ open, onOpenChange, editData, nextOrder }: { open: boolean; onOpenChange: (v: boolean) => void; editData: Banner | null; nextOrder: number }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: editData?.title || "",
    subtitle: editData?.subtitle || "",
    image_url: editData?.image_url || "",
    link_url: editData?.link_url || "",
    placement: editData?.placement || "hero",
    device: editData?.device || "both",
    display_order: editData?.display_order ?? nextOrder,
    starts_at: editData?.starts_at ? editData.starts_at.slice(0, 10) : "",
    ends_at: editData?.ends_at ? editData.ends_at.slice(0, 10) : "",
  });

  // Reset form when editData changes
  useState(() => {
    setForm({
      title: editData?.title || "",
      subtitle: editData?.subtitle || "",
      image_url: editData?.image_url || "",
      link_url: editData?.link_url || "",
      placement: editData?.placement || "hero",
      device: editData?.device || "both",
      display_order: editData?.display_order ?? nextOrder,
      starts_at: editData?.starts_at ? editData.starts_at.slice(0, 10) : "",
      ends_at: editData?.ends_at ? editData.ends_at.slice(0, 10) : "",
    });
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `banners/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("review-photos").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("review-photos").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title: form.title,
        subtitle: form.subtitle || null,
        image_url: form.image_url || null,
        link_url: form.link_url || null,
        placement: form.placement,
        device: form.device,
        display_order: form.display_order,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      };
      if (editData) {
        const { error } = await supabase.from("promo_banners").update(payload).eq("id", editData.id);
        if (error) throw error;
      } else {
        payload.service_type = "rental";
        const { error } = await supabase.from("promo_banners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-banners"] });
      onOpenChange(false);
      toast({ title: editData ? "Banner updated!" : "Banner created!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editData ? "Edit" : "Add"} Banner</DialogTitle></DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Subtitle</Label>
            <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Image</Label>
            {form.image_url && <img src={form.image_url} alt="" className="w-full h-32 object-cover rounded-lg border mb-1" />}
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Link URL</Label>
            <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="/ecommerce?category=LED" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Placement</Label>
              <Select value={form.placement} onValueChange={(v) => setForm({ ...form, placement: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLACEMENTS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Device</Label>
              <Select value={form.device} onValueChange={(v) => setForm({ ...form, device: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DEVICES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date</Label>
              <Input type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Date</Label>
              <Input type="date" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Order</Label>
              <Input type="number" min={0} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={!form.title.trim() || saveMutation.isPending} className="w-full">
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editData ? "Update" : "Create"} Banner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBannerManager;
