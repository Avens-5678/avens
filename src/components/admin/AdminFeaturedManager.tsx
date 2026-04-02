import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Loader2, Search, Star, Store, Package } from "lucide-react";

interface FeaturedItem {
  id: string;
  item_id: string;
  item_type: string;
  placement: string;
  display_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

interface InventoryItem {
  id: string;
  item_name: string;
  service_type: string;
}

interface VendorProfile {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
}

const PLACEMENTS = [
  { value: "homepage", label: "Homepage" },
  { value: "category_page", label: "Category Page" },
  { value: "search_boost", label: "Search Boost" },
];

const TYPE_ICONS: Record<string, any> = {
  product: Package,
  vendor: Store,
  category: Star,
};

const AdminFeaturedManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [itemType, setItemType] = useState<"product" | "vendor">("product");

  const { data: featured = [], isLoading } = useQuery({
    queryKey: ["cms-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_items")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as FeaturedItem[];
    },
  });

  // Fetch product names for display
  const productIds = featured.filter((f) => f.item_type === "product").map((f) => f.item_id);
  const { data: products = [] } = useQuery({
    queryKey: ["featured-products", productIds.join(",")],
    enabled: productIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_inventory")
        .select("id, item_name, service_type")
        .in("id", productIds);
      if (error) throw error;
      return data as InventoryItem[];
    },
  });

  // Fetch vendor names
  const vendorIds = featured.filter((f) => f.item_type === "vendor").map((f) => f.item_id);
  const { data: vendors = [] } = useQuery({
    queryKey: ["featured-vendors", vendorIds.join(",")],
    enabled: vendorIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name")
        .in("user_id", vendorIds);
      if (error) throw error;
      return data as VendorProfile[];
    },
  });

  const nameMap = useMemo(() => {
    const m: Record<string, string> = {};
    products.forEach((p) => { m[p.id] = p.item_name; });
    vendors.forEach((v) => { m[v.user_id] = v.company_name || v.full_name || "Unknown"; });
    return m;
  }, [products, vendors]);

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("featured_items").update({ is_active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms-featured"] }),
  });

  const deleteFeatured = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("featured_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-featured"] });
      toast({ title: "Removed from featured" });
    },
  });

  const featuredProducts = featured.filter((f) => f.item_type === "product");
  const featuredVendors = featured.filter((f) => f.item_type === "vendor");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Featured Items</h3>
          <p className="text-sm text-muted-foreground">{featured.filter((f) => f.is_active).length} active featured items</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />Add Featured
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Featured Products */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5"><Package className="h-4 w-4" />Featured Products ({featuredProducts.length})</h4>
            {featuredProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 bg-muted/30 rounded-lg text-center">No featured products. Add one above.</p>
            ) : (
              <FeaturedTable items={featuredProducts} nameMap={nameMap} onToggle={(id, v) => toggleActive.mutate({ id, is_active: v })} onDelete={(id) => deleteFeatured.mutate(id)} />
            )}
          </div>

          {/* Featured Vendors */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5"><Store className="h-4 w-4" />Featured Vendors ({featuredVendors.length})</h4>
            {featuredVendors.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 bg-muted/30 rounded-lg text-center">No featured vendors.</p>
            ) : (
              <FeaturedTable items={featuredVendors} nameMap={nameMap} onToggle={(id, v) => toggleActive.mutate({ id, is_active: v })} onDelete={(id) => deleteFeatured.mutate(id)} />
            )}
          </div>
        </>
      )}

      <AddFeaturedDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
};

// ── Table ──
const FeaturedTable = ({ items, nameMap, onToggle, onDelete }: { items: FeaturedItem[]; nameMap: Record<string, string>; onToggle: (id: string, v: boolean) => void; onDelete: (id: string) => void }) => (
  <div className="border border-border rounded-xl overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="text-xs">Name</TableHead>
          <TableHead className="text-xs w-[100px]">Placement</TableHead>
          <TableHead className="text-xs w-[60px]">Order</TableHead>
          <TableHead className="text-xs w-[60px]">Active</TableHead>
          <TableHead className="text-xs w-[60px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="text-sm font-medium">{nameMap[item.item_id] || item.item_id.slice(0, 8)}</TableCell>
            <TableCell><Badge variant="secondary" className="text-[10px]">{item.placement}</Badge></TableCell>
            <TableCell className="text-xs text-muted-foreground">{item.display_order}</TableCell>
            <TableCell><Switch checked={item.is_active} onCheckedChange={(v) => onToggle(item.id, v)} className="scale-75" /></TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" className="h-7 px-1.5 text-destructive" onClick={() => { if (confirm("Remove?")) onDelete(item.id); }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// ── Add Featured Dialog ──
const AddFeaturedDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [itemType, setItemType] = useState<"product" | "vendor">("product");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [placement, setPlacement] = useState("homepage");
  const [displayOrder, setDisplayOrder] = useState(0);

  // Search products
  const { data: productResults = [] } = useQuery({
    queryKey: ["search-products", searchTerm],
    enabled: itemType === "product" && searchTerm.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_inventory")
        .select("id, item_name, service_type")
        .ilike("item_name", `%${searchTerm}%`)
        .eq("is_verified", true)
        .limit(10);
      if (error) throw error;
      return data as InventoryItem[];
    },
  });

  // Search vendors
  const { data: vendorResults = [] } = useQuery({
    queryKey: ["search-vendors-featured", searchTerm],
    enabled: itemType === "vendor" && searchTerm.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name")
        .or(`full_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`)
        .limit(10);
      if (error) throw error;
      return data as VendorProfile[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("featured_items").insert({
        item_id: selectedId,
        item_type: itemType,
        placement,
        display_order: displayOrder,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-featured"] });
      onOpenChange(false);
      setSearchTerm("");
      setSelectedId("");
      toast({ title: "Added to featured!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const results = itemType === "product" ? productResults : vendorResults;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Add Featured Item</DialogTitle></DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => { setItemType("product"); setSearchTerm(""); setSelectedId(""); }} className={`flex-1 px-3 py-1.5 text-xs font-medium ${itemType === "product" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Product</button>
            <button onClick={() => { setItemType("vendor"); setSearchTerm(""); setSelectedId(""); }} className={`flex-1 px-3 py-1.5 text-xs font-medium ${itemType === "vendor" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Vendor</button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Search {itemType === "product" ? "Products" : "Vendors"}</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Type to search..." className="pl-8 text-sm" />
            </div>
          </div>
          {results.length > 0 && (
            <div className="max-h-[150px] overflow-y-auto border border-border rounded-lg p-1 space-y-0.5">
              {itemType === "product"
                ? (productResults as InventoryItem[]).map((p) => (
                    <button key={p.id} onClick={() => setSelectedId(p.id)} className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedId === p.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                      {p.item_name} <span className="text-xs text-muted-foreground capitalize">({p.service_type})</span>
                    </button>
                  ))
                : (vendorResults as VendorProfile[]).map((v) => (
                    <button key={v.user_id} onClick={() => setSelectedId(v.user_id)} className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedId === v.user_id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                      {v.company_name || v.full_name}
                    </button>
                  ))
              }
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Placement</Label>
              <Select value={placement} onValueChange={setPlacement}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLACEMENTS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Display Order</Label>
              <Input type="number" min={0} value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={!selectedId || saveMutation.isPending} className="w-full" size="sm">
            {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}Add to Featured
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminFeaturedManager;
