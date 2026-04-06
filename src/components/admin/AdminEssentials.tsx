import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag, Package, TrendingUp, Clock, Edit, Trash2,
  Plus, Save, Loader2, GripVertical, IndianRupee,
} from "lucide-react";

type View = "overview" | "categories" | "bundles";

const AdminEssentials = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("overview");
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [catForm, setCatForm] = useState({ name: "", slug: "", icon_name: "", display_order: "0", is_active: true });
  const [saving, setSaving] = useState(false);

  // Overview data
  const { data: orders } = useQuery({
    queryKey: ["admin-essential-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("essential_orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories, refetch: refetchCats } = useQuery({
    queryKey: ["admin-essential-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("essential_categories").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["admin-essential-products-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("essential_products").select("id, vendor_id, total_sold, price, category_id");
      if (error) throw error;
      return data;
    },
  });

  // Computed stats
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

  const ordersToday = orders?.filter((o) => o.created_at?.startsWith(todayStr)).length || 0;
  const ordersWeek = orders?.filter((o) => o.created_at >= weekAgo).length || 0;
  const ordersMonth = orders?.filter((o) => o.created_at >= monthAgo).length || 0;
  const revenueToday = orders?.filter((o) => o.status === "delivered" && o.delivered_at?.startsWith(todayStr)).reduce((s, o) => s + Number(o.total), 0) || 0;
  const revenueMonth = orders?.filter((o) => o.status === "delivered" && o.delivered_at >= monthAgo).reduce((s, o) => s + Number(o.total), 0) || 0;

  // Category sales
  const categorySales = categories?.map((cat) => {
    const catProducts = products?.filter((p) => p.category_id === cat.id) || [];
    const totalSold = catProducts.reduce((s, p) => s + (p.total_sold || 0), 0);
    return { ...cat, totalSold, productCount: catProducts.length };
  }).sort((a, b) => b.totalSold - a.totalSold) || [];

  // Category CRUD
  const openNewCat = () => {
    setCatForm({ name: "", slug: "", icon_name: "", display_order: String((categories?.length || 0) + 1), is_active: true });
    setEditingCat({});
  };
  const openEditCat = (cat: any) => {
    setCatForm({ name: cat.name, slug: cat.slug, icon_name: cat.icon_name || "", display_order: String(cat.display_order), is_active: cat.is_active });
    setEditingCat(cat);
  };
  const saveCat = async () => {
    if (!catForm.name || !catForm.slug) { toast({ title: "Name and slug required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { name: catForm.name, slug: catForm.slug, icon_name: catForm.icon_name || null, display_order: parseInt(catForm.display_order) || 0, is_active: catForm.is_active };
      if (editingCat?.id) {
        await supabase.from("essential_categories").update(payload).eq("id", editingCat.id);
      } else {
        await supabase.from("essential_categories").insert(payload);
      }
      refetchCats();
      setEditingCat(null);
      toast({ title: "Category saved" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };
  const deleteCat = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from("essential_categories").delete().eq("id", id);
    refetchCats();
    toast({ title: "Category deleted" });
  };

  return (
    <div className="space-y-4">
      {/* View tabs */}
      <div className="flex gap-2">
        {(["overview", "categories", "bundles"] as View[]).map((v) => (
          <Button key={v} variant={view === v ? "default" : "outline"} size="sm" onClick={() => setView(v)} className="capitalize text-xs">
            {v}
          </Button>
        ))}
      </div>

      {/* Overview */}
      {view === "overview" && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Orders Today</p>
                <p className="text-2xl font-bold">{ordersToday}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Orders This Week</p>
                <p className="text-2xl font-bold">{ordersWeek}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Revenue Today</p>
                <p className="text-2xl font-bold">{"\u20B9"}{revenueToday.toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Revenue (30d)</p>
                <p className="text-2xl font-bold">{"\u20B9"}{revenueMonth.toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Sales by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categorySales.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">({cat.productCount} products)</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{cat.totalSold} sold</Badge>
                </div>
              ))}
              {categorySales.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent orders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {orders?.slice(0, 10).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN")} · {order.item_count} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{"\u20B9"}{order.total}</p>
                    <Badge className={`text-[9px] py-0 ${
                      order.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                      order.status === "cancelled" ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-700"
                    }`}>{order.status}</Badge>
                  </div>
                </div>
              ))}
              {(!orders || orders.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories management */}
      {view === "categories" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold">Essential Categories</h3>
            <Button size="sm" onClick={openNewCat} className="gap-1 text-xs"><Plus className="h-3 w-3" /> Add Category</Button>
          </div>
          {categories?.map((cat: any) => (
            <Card key={cat.id}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-6">{cat.display_order}</span>
                  <div>
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.slug} · {cat.icon_name || "no icon"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cat.is_active ? "default" : "outline"} className="text-[10px]">
                    {cat.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditCat(cat)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => deleteCat(cat.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Dialog open={!!editingCat} onOpenChange={(open) => !open && setEditingCat(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>{editingCat?.id ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <div><Label>Name</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: catForm.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} /></div>
                <div><Label>Slug</Label><Input value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} /></div>
                <div><Label>Icon Name (lucide)</Label><Input value={catForm.icon_name} onChange={(e) => setCatForm({ ...catForm, icon_name: e.target.value })} placeholder="e.g. sparkles" /></div>
                <div><Label>Display Order</Label><Input type="number" value={catForm.display_order} onChange={(e) => setCatForm({ ...catForm, display_order: e.target.value })} /></div>
                <div className="flex items-center gap-2"><Switch checked={catForm.is_active} onCheckedChange={(v) => setCatForm({ ...catForm, is_active: v })} /><Label>Active</Label></div>
                <Button onClick={saveCat} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Bundles placeholder */}
      {view === "bundles" && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-semibold">Theme Bundles</h3>
            <p className="text-xs text-muted-foreground mt-1">Create curated party packs. Coming soon.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminEssentials;
