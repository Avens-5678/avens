import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Megaphone, Search as SearchIcon, Phone, Share2 } from "lucide-react";
import { format } from "date-fns";

interface SiteSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

const AdminSiteSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["cms-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .not("key", "is", null)
        .order("key");
      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  const settingMap: Record<string, SiteSetting> = {};
  settings.forEach((s) => { if (s.key) settingMap[s.key] = s; });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Site Settings</h3>
        <p className="text-sm text-muted-foreground">Manage global website configuration</p>
      </div>

      {settingMap.announcement_bar && (
        <AnnouncementBarEditor setting={settingMap.announcement_bar} />
      )}
      {settingMap.seo_defaults && (
        <SEOEditor setting={settingMap.seo_defaults} />
      )}
      {settingMap.contact_info && (
        <ContactInfoEditor setting={settingMap.contact_info} />
      )}
      {settingMap.social_links && (
        <SocialLinksEditor setting={settingMap.social_links} />
      )}
    </div>
  );
};

// ── Generic save hook ──
const useSaveSetting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, value }: { id: string; value: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("site_settings")
        .update({ value, updated_at: new Date().toISOString(), updated_by: user?.id || null } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-site-settings"] });
      toast({ title: "Settings saved!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
};

// ── Announcement Bar ──
const AnnouncementBarEditor = ({ setting }: { setting: SiteSetting }) => {
  const save = useSaveSetting();
  const [form, setForm] = useState(setting.value || { text: "", is_active: false, bg_color: "#1D9E75", text_color: "#ffffff" });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2"><Megaphone className="h-4 w-4" />Announcement Bar</CardTitle>
        <p className="text-xs text-muted-foreground">{setting.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Preview */}
        {form.is_active && form.text && (
          <div className="rounded-lg px-4 py-2 text-center text-sm font-medium" style={{ backgroundColor: form.bg_color, color: form.text_color }}>
            {form.text}
          </div>
        )}
        <div className="flex items-center justify-between">
          <Label className="text-xs">Active</Label>
          <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Announcement Text</Label>
          <Input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Free shipping on orders above ₹5,000!" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Background Color</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
              <Input value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className="flex-1 text-xs font-mono" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Text Color</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
              <Input value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} className="flex-1 text-xs font-mono" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-[10px] text-muted-foreground">Last updated: {format(new Date(setting.updated_at), "dd MMM yyyy, h:mm a")}</p>
          <Button size="sm" className="gap-1.5" onClick={() => save.mutate({ id: setting.id, value: form })} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ── SEO Defaults ──
const SEOEditor = ({ setting }: { setting: SiteSetting }) => {
  const save = useSaveSetting();
  const [form, setForm] = useState(setting.value || { title: "", description: "", og_image: "" });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2"><SearchIcon className="h-4 w-4" />SEO Defaults</CardTitle>
        <p className="text-xs text-muted-foreground">{setting.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Meta Title</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Meta Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">OG Image URL</Label>
          <Input value={form.og_image} onChange={(e) => setForm({ ...form, og_image: e.target.value })} placeholder="https://..." />
        </div>
        {/* Google preview */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-0.5">
          <p className="text-xs font-semibold text-blue-600 truncate">{form.title || "Page Title"}</p>
          <p className="text-[10px] text-emerald-700">evnting.com</p>
          <p className="text-[10px] text-muted-foreground line-clamp-2">{form.description || "Page description..."}</p>
        </div>
        <div className="flex justify-end">
          <Button size="sm" className="gap-1.5" onClick={() => save.mutate({ id: setting.id, value: form })} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Contact Info ──
const ContactInfoEditor = ({ setting }: { setting: SiteSetting }) => {
  const save = useSaveSetting();
  const [form, setForm] = useState(setting.value || { phone: "", email: "", whatsapp: "", address: "" });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4" />Contact Information</CardTitle>
        <p className="text-xs text-muted-foreground">{setting.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@evnting.com" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">WhatsApp Number</Label>
          <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+919876543210" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Address</Label>
          <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} placeholder="Full office address..." />
        </div>
        <div className="flex justify-end">
          <Button size="sm" className="gap-1.5" onClick={() => save.mutate({ id: setting.id, value: form })} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Social Links ──
const SocialLinksEditor = ({ setting }: { setting: SiteSetting }) => {
  const save = useSaveSetting();
  const [form, setForm] = useState(setting.value || { instagram: "", facebook: "", youtube: "", twitter: "" });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2"><Share2 className="h-4 w-4" />Social Links</CardTitle>
        <p className="text-xs text-muted-foreground">{setting.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {(["instagram", "facebook", "youtube", "twitter"] as const).map((platform) => (
            <div key={platform} className="space-y-1.5">
              <Label className="text-xs capitalize">{platform}</Label>
              <Input value={form[platform]} onChange={(e) => setForm({ ...form, [platform]: e.target.value })} placeholder={`https://${platform}.com/...`} />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button size="sm" className="gap-1.5" onClick={() => save.mutate({ id: setting.id, value: form })} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSiteSettings;
