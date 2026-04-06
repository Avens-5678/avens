import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Package, Plus, Edit, Trash2, Save, X, Search, ImageIcon,
  Loader2, AlertTriangle, Filter,
} from "lucide-react";

const EssentialsProductManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingStock, setEditingStock] = useState<{ id: string; value: string } | null>(null);

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["vendor-essential-products", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essential_products")
        .select("*, essential_categories(name, slug)")
        .eq("vendor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["essential-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essential_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const lowStockCount = useMemo(
    () => products?.filter((p) => p.stock_count <= p.low_stock_threshold && p.stock_count > 0).length || 0,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products?.filter((p) => p.stock_count === 0).length || 0,
    [products]
  );

  const filtered = useMemo(() => {
    if (!products) return [];
    let result = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
    }
    if (showLowStock) {
      result = result.filter((p) => p.stock_count <= p.low_stock_threshold);
    }
    return result;
  }, [products, search, showLowStock]);

  // Form state
  const [form, setForm] = useState({
    name: "", description: "", category_id: "", price: "", compare_price: "",
    stock_count: "0", low_stock_threshold: "5", min_order_qty: "1", max_order_qty: "50",
    weight_grams: "", tags: "", sku: "", is_active: true, is_featured: false,
  });

  const openNew = () => {
    setForm({
      name: "", description: "", category_id: "", price: "", compare_price: "",
      stock_count: "0", low_stock_threshold: "5", min_order_qty: "1", max_order_qty: "50",
      weight_grams: "", tags: "", sku: "", is_active: true, is_featured: false,
    });
    setIsNew(true);
    setEditing({});
  };

  const openEdit = (product: any) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      category_id: product.category_id || "",
      price: String(product.price || ""),
      compare_price: product.compare_price ? String(product.compare_price) : "",
      stock_count: String(product.stock_count ?? 0),
      low_stock_threshold: String(product.low_stock_threshold ?? 5),
      min_order_qty: String(product.min_order_qty ?? 1),
      max_order_qty: String(product.max_order_qty ?? 50),
      weight_grams: product.weight_grams ? String(product.weight_grams) : "",
      tags: (product.tags || []).join(", "),
      sku: product.sku || "",
      is_active: product.is_active,
      is_featured: product.is_featured,
    });
    setIsNew(false);
    setEditing(product);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        vendor_id: user!.id,
        name: form.name,
        description: form.description || null,
        category_id: form.category_id || null,
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock_count: parseInt(form.stock_count) || 0,
        low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
        min_order_qty: parseInt(form.min_order_qty) || 1,
        max_order_qty: parseInt(form.max_order_qty) || 50,
        weight_grams: form.weight_grams ? parseInt(form.weight_grams) : null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        sku: form.sku || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { error } = await supabase.from("essential_products").insert(payload);
        if (error) throw error;
        toast({ title: "Product created" });
      } else {
        const { error } = await supabase.from("essential_products").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Product updated" });
      }
      queryClient.invalidateQueries({ queryKey: ["vendor-essential-products"] });
      setEditing(null);
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await supabase.from("essential_products").update({ is_active: !isActive }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["vendor-essential-products"] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("essential_products").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["vendor-essential-products"] });
    toast({ title: "Product deleted" });
  };

  const handleInlineStockSave = async (id: string, value: string) => {
    const stockCount = parseInt(value);
    if (isNaN(stockCount) || stockCount < 0) return;
    await supabase.from("essential_products").update({ stock_count: stockCount }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["vendor-essential-products"] });
    setEditingStock(null);
    toast({ title: "Stock updated" });
  };

  const getStockColor = (count: number, threshold: number) => {
    if (count === 0) return "text-gray-400 bg-gray-100";
    if (count <= threshold) return "text-red-600 bg-red-50";
    if (count <= threshold * 2) return "text-amber-600 bg-amber-50";
    return "text-emerald-600 bg-emerald-50";
  };

  return (
    <div className="space-y-4">
      {/* Low stock alert */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800 font-medium">
                {lowStockCount > 0 && `${lowStockCount} product${lowStockCount > 1 ? "s" : ""} running low`}
                {lowStockCount > 0 && outOfStockCount > 0 && " · "}
                {outOfStockCount > 0 && `${outOfStockCount} out of stock`}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-amber-300"
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <Filter className="h-3 w-3 mr-1" />
              {showLowStock ? "Show All" : "Show Low Stock"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
        <Button onClick={openNew} size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Product list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {products?.length === 0 ? "No products yet. Add your first product!" : "No products match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((product: any) => (
            <Card key={product.id} className={`transition-opacity ${!product.is_active ? "opacity-60" : ""}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {/* Image */}
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium truncate">{product.name}</h4>
                      {product.is_featured && <Badge variant="secondary" className="text-[10px] py-0">Featured</Badge>}
                      {!product.is_active && <Badge variant="outline" className="text-[10px] py-0 text-gray-400">Inactive</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{(product.essential_categories as any)?.name || "Uncategorized"}</span>
                      <span className="font-semibold text-foreground">{"\u20B9"}{product.price}</span>
                      {product.compare_price && (
                        <span className="line-through">{"\u20B9"}{product.compare_price}</span>
                      )}
                      {product.sku && <span>SKU: {product.sku}</span>}
                    </div>
                  </div>

                  {/* Stock (inline editable) */}
                  <div className="flex-shrink-0">
                    {editingStock?.id === product.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editingStock.value}
                          onChange={(e) => setEditingStock({ ...editingStock, value: e.target.value })}
                          className="w-16 h-7 text-xs text-center"
                          type="number"
                          min="0"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleInlineStockSave(product.id, editingStock.value);
                            if (e.key === "Escape") setEditingStock(null);
                          }}
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleInlineStockSave(product.id, editingStock.value)}>
                          <Save className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingStock({ id: product.id, value: String(product.stock_count) })}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${getStockColor(product.stock_count, product.low_stock_threshold)}`}
                        title="Click to edit stock"
                      >
                        {product.stock_count === 0 ? "OOS" : product.stock_count}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={() => handleToggleActive(product.id, product.is_active)}
                      className="scale-75"
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(product)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Product" : "Edit Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Gold Star Balloons (Pack of 10)" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price ({"\u20B9"}) *</Label>
                <Input type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label>MRP / Compare Price</Label>
                <Input type="number" min="0" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Stock</Label>
                <Input type="number" min="0" value={form.stock_count} onChange={(e) => setForm({ ...form, stock_count: e.target.value })} />
              </div>
              <div>
                <Label>Low Stock Alert</Label>
                <Input type="number" min="0" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} />
              </div>
              <div>
                <Label>Weight (g)</Label>
                <Input type="number" min="0" value={form.weight_grams} onChange={(e) => setForm({ ...form, weight_grams: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min Order Qty</Label>
                <Input type="number" min="1" value={form.min_order_qty} onChange={(e) => setForm({ ...form, min_order_qty: e.target.value })} />
              </div>
              <div>
                <Label>Max Order Qty</Label>
                <Input type="number" min="1" value={form.max_order_qty} onChange={(e) => setForm({ ...form, max_order_qty: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="birthday, balloons, party" />
            </div>
            <div>
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Optional product code" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                <Label>Featured</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isNew ? "Create Product" : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EssentialsProductManager;
