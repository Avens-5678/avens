import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Loader2, Copy, RefreshCw, Eye } from "lucide-react";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  per_user_limit: number;
  applicable_categories: string[] | null;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface CouponUsage {
  id: string;
  user_id: string;
  discount_applied: number;
  used_at: string;
  order_type: string | null;
}

const CATEGORY_OPTIONS = ["equipment", "venue", "crew"];

const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return "EVT" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const AdminCouponManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [usageSheet, setUsageSheet] = useState<Coupon | null>(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["cms-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discount_coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("discount_coupons").update({ is_active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms-coupons"] }),
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("discount_coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-coupons"] });
      toast({ title: "Coupon deleted" });
    },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: code });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Coupons & Discounts</h3>
          <p className="text-sm text-muted-foreground">{coupons.filter((c) => c.is_active).length} active coupons</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setEditCoupon(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />Create Coupon
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No coupons created yet.</div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Code</TableHead>
                  <TableHead className="text-xs">Discount</TableHead>
                  <TableHead className="text-xs">Usage</TableHead>
                  <TableHead className="text-xs">Min Order</TableHead>
                  <TableHead className="text-xs">Expiry</TableHead>
                  <TableHead className="text-xs w-[60px]">Active</TableHead>
                  <TableHead className="text-xs w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => {
                  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                  const isMaxed = coupon.usage_limit && coupon.used_count >= coupon.usage_limit;
                  return (
                    <TableRow key={coupon.id} className={isExpired || isMaxed ? "opacity-50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <code className="text-sm font-mono font-bold bg-muted px-2 py-0.5 rounded">{coupon.code}</code>
                          <button onClick={() => copyCode(coupon.code)} className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button>
                        </div>
                        {coupon.description && <p className="text-[10px] text-muted-foreground mt-0.5">{coupon.description}</p>}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `₹${Math.round(coupon.discount_value)}`}
                        </span>
                        {coupon.max_discount_amount && coupon.discount_type === "percentage" && (
                          <span className="text-[10px] text-muted-foreground ml-1">(max ₹{Math.round(coupon.max_discount_amount)})</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{coupon.used_count}</span>
                        {coupon.usage_limit && <span className="text-muted-foreground text-xs">/{coupon.usage_limit}</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {coupon.min_order_amount > 0 ? `₹${Math.round(coupon.min_order_amount)}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {coupon.expires_at ? (
                          <span className={isExpired ? "text-red-500" : ""}>{format(new Date(coupon.expires_at), "dd MMM yy")}</span>
                        ) : "No expiry"}
                      </TableCell>
                      <TableCell>
                        <Switch checked={coupon.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: coupon.id, is_active: v })} className="scale-75" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-1.5" onClick={() => setUsageSheet(coupon)}><Eye className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 px-1.5" onClick={() => { setEditCoupon(coupon); setDialogOpen(true); }}><span className="text-[10px]">Edit</span></Button>
                          <Button variant="ghost" size="sm" className="h-7 px-1.5 text-destructive" onClick={() => { if (confirm("Delete?")) deleteCoupon.mutate(coupon.id); }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <CouponDialog open={dialogOpen} onOpenChange={setDialogOpen} editData={editCoupon} />
      {usageSheet && <CouponUsageSheet coupon={usageSheet} open={!!usageSheet} onOpenChange={(o) => { if (!o) setUsageSheet(null); }} />}
    </div>
  );
};

// ── Coupon Dialog ──
const CouponDialog = ({ open, onOpenChange, editData }: { open: boolean; onOpenChange: (v: boolean) => void; editData: Coupon | null }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    code: editData?.code || generateCode(),
    description: editData?.description || "",
    discount_type: editData?.discount_type || "percentage",
    discount_value: editData ? String(editData.discount_value) : "",
    min_order_amount: editData ? String(editData.min_order_amount) : "0",
    max_discount_amount: editData?.max_discount_amount ? String(editData.max_discount_amount) : "",
    usage_limit: editData?.usage_limit ? String(editData.usage_limit) : "",
    per_user_limit: editData ? String(editData.per_user_limit) : "1",
    applicable_categories: editData?.applicable_categories || [],
    starts_at: editData?.starts_at ? editData.starts_at.slice(0, 10) : format(new Date(), "yyyy-MM-dd"),
    expires_at: editData?.expires_at ? editData.expires_at.slice(0, 10) : "",
  });

  const toggleCategory = (cat: string) => {
    setForm((f) => ({
      ...f,
      applicable_categories: f.applicable_categories.includes(cat)
        ? f.applicable_categories.filter((c) => c !== cat)
        : [...f.applicable_categories, cat],
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        code: form.code.toUpperCase(),
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value) || 0,
        min_order_amount: parseFloat(form.min_order_amount) || 0,
        max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        per_user_limit: parseInt(form.per_user_limit) || 1,
        applicable_categories: form.applicable_categories.length > 0 ? form.applicable_categories : null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
      };
      if (editData) {
        const { error } = await supabase.from("discount_coupons").update(payload).eq("id", editData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("discount_coupons").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-coupons"] });
      onOpenChange(false);
      toast({ title: editData ? "Coupon updated!" : "Coupon created!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editData ? "Edit" : "Create"} Coupon</DialogTitle></DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Coupon Code *</Label>
            <div className="flex gap-2">
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="font-mono" />
              <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => setForm({ ...form, code: generateCode() })}><RefreshCw className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Summer sale 20% off" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Discount Type *</Label>
              <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Value *</Label>
              <Input type="number" min={0} value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder={form.discount_type === "percentage" ? "20" : "500"} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Min Order (₹)</Label>
              <Input type="number" min={0} value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} />
            </div>
            {form.discount_type === "percentage" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Max Discount (₹)</Label>
                <Input type="number" min={0} value={form.max_discount_amount} onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })} placeholder="500" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Usage Limit (total)</Label>
              <Input type="number" min={1} value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Unlimited" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Per User Limit</Label>
              <Input type="number" min={1} value={form.per_user_limit} onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Applicable Categories</Label>
            <div className="flex gap-3">
              {CATEGORY_OPTIONS.map((cat) => (
                <label key={cat} className="flex items-center gap-1.5 text-xs capitalize cursor-pointer">
                  <Checkbox checked={form.applicable_categories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />
                  {cat}
                </label>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">Leave unchecked for all categories</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date</Label>
              <Input type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Expiry Date</Label>
              <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={!form.code || !form.discount_value || saveMutation.isPending} className="w-full">
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editData ? "Update" : "Create"} Coupon
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Usage Sheet ──
const CouponUsageSheet = ({ coupon, open, onOpenChange }: { coupon: Coupon; open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { data: usages = [], isLoading } = useQuery({
    queryKey: ["coupon-usage", coupon.id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupon_usage")
        .select("*")
        .eq("coupon_id", coupon.id)
        .order("used_at", { ascending: false });
      if (error) throw error;
      return data as CouponUsage[];
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Usage — <code className="font-mono">{coupon.code}</code></SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">{coupon.used_count}</p>
              <p className="text-[10px] text-muted-foreground">Used</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">{coupon.usage_limit || "∞"}</p>
              <p className="text-[10px] text-muted-foreground">Limit</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">₹{Math.round(usages.reduce((s, u) => s + u.discount_applied, 0))}</p>
              <p className="text-[10px] text-muted-foreground">Total Discount</p>
            </div>
          </div>
          <Separator />
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : usages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No usage yet.</p>
          ) : (
            <div className="space-y-2">
              {usages.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">{u.user_id.slice(0, 8)}...</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(u.used_at), "dd MMM yyyy, h:mm a")}</p>
                  </div>
                  <span className="font-semibold text-emerald-600">-₹{Math.round(u.discount_applied)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdminCouponManager;
