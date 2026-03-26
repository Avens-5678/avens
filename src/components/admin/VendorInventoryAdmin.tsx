import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, ShieldCheck, Search, Package, IndianRupee, Users, Eye, Phone,
  MapPin, Building2, Edit, Trash2, Plus, FileText
} from "lucide-react";
import RentalItemFormDialog from "./RentalItemFormDialog";

const VendorInventoryAdmin = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("vendors");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [addForVendorId, setAddForVendorId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all vendor profiles (excluding admins)
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["admin_vendors"],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "vendor");
      if (!roles || roles.length === 0) return [];

      // Exclude admin users
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminUserIds = new Set((adminRoles || []).map((r) => r.user_id));
      const vendorIds = roles.map((r) => r.user_id).filter(id => !adminUserIds.has(id));
      if (vendorIds.length === 0) return [];

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", vendorIds);
      if (error) throw error;
      return profiles || [];
    },
  });

  // Fetch all inventory
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["admin_vendor_inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_inventory")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch rental orders for message counts
  const { data: rentalOrders } = useQuery({
    queryKey: ["admin_rental_orders_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_orders")
        .select("assigned_vendor_id, status, whatsapp_sent_at")
        .not("assigned_vendor_id", "is", null);
      if (error) throw error;
      return data;
    },
  });

  // Toggle verified
  const toggleVerified = useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      const { error } = await supabase
        .from("vendor_inventory")
        .update({ is_verified, verified_at: is_verified ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin_vendor_inventory"] });
      toast({ title: vars.is_verified ? "Item Verified" : "Verification Removed" });
    },
  });

  // Delete item
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vendor_inventory").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_vendor_inventory"] });
      toast({ title: "Item Deleted" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Save handler for the shared form (create or update vendor inventory item)
  const handleFormSave = async (data: Record<string, any>, variants: { attributeType: string; rows: any[] } | null) => {
    const vendorId = addForVendorId || editItem?.vendor_id;
    if (!vendorId) throw new Error("No vendor selected");

    const itemData: Record<string, any> = {
      name: data.title,
      short_description: data.short_description,
      description: data.description,
      address: data.address || null,
      categories: data.categories || [],
      search_keywords: data.search_keywords || null,
      display_order: data.display_order || 0,
      quantity: data.quantity || 1,
      is_available: data.is_active !== false,
      has_variants: data.has_variants || false,
      price_value: data.price_value,
      pricing_unit: data.pricing_unit,
      image_url: data.image_url || null,
      image_urls: data.image_urls || [],
      vendor_id: vendorId,
    };

    let itemId: string;

    if (editItem) {
      const { error } = await supabase.from("vendor_inventory").update(itemData).eq("id", editItem.id);
      if (error) throw error;
      itemId = editItem.id;
    } else {
      const { data: inserted, error } = await supabase.from("vendor_inventory").insert(itemData as any).select("id").single();
      if (error) throw error;
      itemId = inserted.id;
    }

    // Save variants
    if (variants && variants.rows.length > 0) {
      // Delete existing variants
      await supabase.from("vendor_inventory_variants").delete().eq("inventory_item_id", itemId);
      // Insert new
      const variantInserts = variants.rows.map((v, i) => ({
        inventory_item_id: itemId,
        attribute_type: variants.attributeType,
        attribute_value: v.attribute_value,
        price_value: v.price_value,
        pricing_unit: v.pricing_unit,
        stock_quantity: v.stock_quantity,
        image_url: v.image_url,
        display_order: i,
      }));
      const { error: vErr } = await supabase.from("vendor_inventory_variants").insert(variantInserts);
      if (vErr) throw vErr;
    } else if (editItem?.has_variants && !data.has_variants) {
      // Clear variants if toggled off
      await supabase.from("vendor_inventory_variants").delete().eq("inventory_item_id", itemId);
    }

    queryClient.invalidateQueries({ queryKey: ["admin_vendor_inventory"] });
    toast({ title: editItem ? "Item Updated" : "Item Added", description: "Catalog item saved successfully." });
    setEditItem(null);
    setAddForVendorId(null);
  };

  const openAddForm = (vendorId: string) => {
    setAddForVendorId(vendorId);
    setEditItem(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item: any) => {
    setEditItem({
      ...item,
      title: item.name,
      short_description: item.short_description || "",
      is_active: item.is_available,
      _variantTable: "vendor_inventory_variants",
    });
    setAddForVendorId(null);
    setIsFormOpen(true);
  };

  // Stats helpers
  const getVendorItemCount = (vendorId: string) =>
    inventory?.filter((i) => i.vendor_id === vendorId).length || 0;

  const getVendorMessageCount = (vendorId: string) =>
    rentalOrders?.filter((o) => o.assigned_vendor_id === vendorId && o.whatsapp_sent_at).length || 0;

  const getVendorOrderCount = (vendorId: string) =>
    rentalOrders?.filter((o) => o.assigned_vendor_id === vendorId).length || 0;

  const filteredVendors = vendors?.filter((v: any) =>
    (v.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (v.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
    ((v as any).city || "").toLowerCase().includes(search.toLowerCase()) ||
    (v.phone || "").includes(search)
  );

  const [catalogServiceFilter, setCatalogServiceFilter] = useState<string>("all");

  const filteredInventory = inventory?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(search.toLowerCase());
    const matchesService = catalogServiceFilter === "all" ||
      ((item as any).service_type || "rental") === catalogServiceFilter;
    return matchesSearch && matchesService;
  });

  const isLoading = vendorsLoading || inventoryLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Vendor Management
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors or items..."
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vendors"><Users className="h-4 w-4 mr-1" />All Vendors ({vendors?.length || 0})</TabsTrigger>
          <TabsTrigger value="catalog"><Package className="h-4 w-4 mr-1" />All Catalog ({inventory?.length || 0})</TabsTrigger>
        </TabsList>

        {/* All Vendors Tab */}
        <TabsContent value="vendors" className="space-y-3 mt-4">
          {!filteredVendors || filteredVendors.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Vendors Found</h3>
              <p className="text-muted-foreground">No registered vendors yet.</p>
            </CardContent></Card>
          ) : (
            filteredVendors.map((vendor: any) => (
              <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{vendor.full_name || "Unnamed Vendor"}</h3>
                        {vendor.company_name && (
                          <Badge variant="outline" className="shrink-0">
                            <Building2 className="h-3 w-3 mr-1" />{vendor.company_name}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        {vendor.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{vendor.phone}</span>}
                        {vendor.email && <span className="flex items-center gap-1 truncate">✉️ {vendor.email}</span>}
                        {(vendor as any).city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{(vendor as any).city}</span>}
                        {(vendor as any).godown_address && (
                          <span className="flex items-center gap-1 col-span-2 sm:col-span-1">
                            🏭 Godown: {(vendor as any).godown_address.slice(0, 50)}{(vendor as any).godown_address.length > 50 ? "..." : ""}
                          </span>
                        )}
                        {(vendor as any).gst_number && <span className="flex items-center gap-1"><FileText className="h-3 w-3" />GST: {(vendor as any).gst_number}</span>}
                        {(vendor as any).pan_number && <span className="flex items-center gap-1"><FileText className="h-3 w-3" />PAN: {(vendor as any).pan_number}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center px-3">
                        <p className="text-xl font-bold">{getVendorItemCount(vendor.user_id)}</p>
                        <p className="text-xs text-muted-foreground">Items</p>
                      </div>
                      <div className="text-center px-3 border-l">
                        <p className="text-xl font-bold">{getVendorOrderCount(vendor.user_id)}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                      <div className="text-center px-3 border-l">
                        <p className="text-xl font-bold">{getVendorMessageCount(vendor.user_id)}</p>
                        <p className="text-xs text-muted-foreground">Messages</p>
                      </div>
                      <div className="flex gap-1 border-l pl-3">
                        <Button variant="outline" size="sm" onClick={() => setSelectedVendor(vendor)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openAddForm(vendor.user_id)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* All Catalog Tab */}
        <TabsContent value="catalog" className="mt-4 space-y-4">
          {/* Service type sub-filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all", label: "All Types" },
              { value: "rental", label: "Rentals" },
              { value: "venue", label: "Venues" },
              { value: "crew", label: "Crew" },
            ].map((opt) => (
              <Button
                key={opt.value}
                variant={catalogServiceFilter === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCatalogServiceFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {!filteredInventory || filteredInventory.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Inventory Items</h3>
            </CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInventory.map((item) => {
                const vendor = vendors?.find((v: any) => v.user_id === item.vendor_id);
                return (
                  <Card key={item.id} className={!item.is_available ? "opacity-60" : ""}>
                    {item.image_url && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <Badge variant="outline" className="text-[10px] capitalize mt-1">{(item as any).service_type || 'rental'}</Badge>
                        </div>
                        <div className="flex gap-1">
                          {(item as any).is_verified && (
                            <Badge className="bg-emerald-500 text-white shrink-0">
                              <ShieldCheck className="h-3 w-3 mr-1" />Verified
                            </Badge>
                          )}
                          <Badge variant={item.is_available ? "default" : "secondary"}>
                            {item.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
                      {item.category && <Badge variant="outline" className="text-xs">{item.category}</Badge>}
                      <div className="flex items-center justify-between text-sm">
                        <span>Qty: {item.quantity}</span>
                        {item.price_per_day && (
                          <span className="flex items-center font-medium">
                            <IndianRupee className="h-3 w-3" />{item.price_per_day}/day
                          </span>
                        )}
                      </div>
                      {vendor && (
                        <p className="text-xs text-muted-foreground">
                          Vendor: {(vendor as any).full_name || (vendor as any).company_name || item.vendor_id.slice(0, 8)}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={(item as any).is_verified || false}
                            onCheckedChange={(checked) => toggleVerified.mutate({ id: item.id, is_verified: checked })}
                          />
                          <span className="text-xs text-muted-foreground">Verified</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditForm(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteItem.mutate(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Vendor Detail Dialog */}
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{selectedVendor.full_name || "—"}</p></div>
                <div><Label className="text-muted-foreground">Company</Label><p>{selectedVendor.company_name || "—"}</p></div>
                <div><Label className="text-muted-foreground">Phone</Label><p>{selectedVendor.phone || "—"}</p></div>
                <div><Label className="text-muted-foreground">Email</Label><p>{selectedVendor.email || "—"}</p></div>
                <div><Label className="text-muted-foreground">City</Label><p>{(selectedVendor as any).city || "—"}</p></div>
                <div><Label className="text-muted-foreground">GST</Label><p>{(selectedVendor as any).gst_number || "—"}</p></div>
                <div><Label className="text-muted-foreground">PAN</Label><p>{(selectedVendor as any).pan_number || "—"}</p></div>
                <div><Label className="text-muted-foreground">Messages Sent</Label><p className="font-bold">{getVendorMessageCount(selectedVendor.user_id)}</p></div>
              </div>
              {(selectedVendor as any).address && (
                <div><Label className="text-muted-foreground">Business Address</Label><p className="text-sm">{(selectedVendor as any).address}</p></div>
              )}
              {(selectedVendor as any).godown_address && (
                <div><Label className="text-muted-foreground">Godown Address</Label><p className="text-sm">{(selectedVendor as any).godown_address}</p></div>
              )}
              {selectedVendor.bio && (
                <div><Label className="text-muted-foreground">About</Label><p className="text-sm">{selectedVendor.bio}</p></div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Catalog Items ({getVendorItemCount(selectedVendor.user_id)})</h4>
                  <Button size="sm" onClick={() => openAddForm(selectedVendor.user_id)}>
                    <Plus className="h-4 w-4 mr-1" />Add Item
                  </Button>
                </div>
                {inventory?.filter((i) => i.vendor_id === selectedVendor.user_id).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No catalog items yet.</p>
                ) : (
                  <div className="space-y-2">
                    {inventory?.filter((i) => i.vendor_id === selectedVendor.user_id).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          {item.image_url && <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover" />}
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} {item.price_per_day ? `• ₹${item.price_per_day}/day` : ""} {item.category ? `• ${item.category}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {(item as any).is_verified && <Badge className="bg-emerald-500 text-white text-xs"><ShieldCheck className="h-3 w-3" /></Badge>}
                          <Button variant="ghost" size="sm" onClick={() => openEditForm(item)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteItem.mutate(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shared Rental Item Form Dialog */}
      <RentalItemFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) { setEditItem(null); setAddForVendorId(null); }
        }}
        editingItem={editItem}
        onSave={handleFormSave}
        title={editItem ? "Edit Catalog Item" : "Add Catalog Item"}
        vendorMode
      />
    </div>
  );
};

export default VendorInventoryAdmin;
