import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, ShieldCheck, Search, Package, IndianRupee, Users, Eye, Phone,
  MapPin, Building2, Edit, Trash2, Plus, Send, FileText, X
} from "lucide-react";

const CATEGORIES = [
  "General", "Structures & Venues", "Stages & Platforms", "Lighting & Sound",
  "AC & Climate Control", "Furniture & Decor", "Catering Equipment",
  "AV Equipment", "Power & Generators", "Transport & Logistics",
];

const VendorInventoryAdmin = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("vendors");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [addForVendorId, setAddForVendorId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: "", description: "", quantity: 1, price_per_day: 0, category: "General", image_url: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all vendor profiles
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["admin_vendors"],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "vendor");
      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) return [];

      const vendorIds = roles.map((r) => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", vendorIds);
      if (profilesError) throw profilesError;

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

  // Create item for vendor
  const createItem = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("vendor_inventory").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_vendor_inventory"] });
      toast({ title: "Item Added", description: "Catalog item added successfully." });
      setIsAddItemOpen(false);
      setNewItem({ name: "", description: "", quantity: 1, price_per_day: 0, category: "General", image_url: "" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Update item
  const updateItem = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("vendor_inventory").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_vendor_inventory"] });
      toast({ title: "Item Updated" });
      setEditItem(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
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

  // Get vendor stats
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

  const filteredInventory = inventory?.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.category || "").toLowerCase().includes(search.toLowerCase())
  );

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
                        {vendor.phone && (
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{vendor.phone}</span>
                        )}
                        {vendor.email && (
                          <span className="flex items-center gap-1 truncate">✉️ {vendor.email}</span>
                        )}
                        {(vendor as any).city && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{(vendor as any).city}</span>
                        )}
                        {(vendor as any).godown_address && (
                          <span className="flex items-center gap-1 col-span-2 sm:col-span-1">
                            🏭 Godown: {(vendor as any).godown_address.slice(0, 50)}{(vendor as any).godown_address.length > 50 ? "..." : ""}
                          </span>
                        )}
                        {(vendor as any).gst_number && (
                          <span className="flex items-center gap-1"><FileText className="h-3 w-3" />GST: {(vendor as any).gst_number}</span>
                        )}
                        {(vendor as any).pan_number && (
                          <span className="flex items-center gap-1"><FileText className="h-3 w-3" />PAN: {(vendor as any).pan_number}</span>
                        )}
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
                        <Button variant="outline" size="sm" onClick={() => {
                          setAddForVendorId(vendor.user_id);
                          setIsAddItemOpen(true);
                        }}>
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
        <TabsContent value="catalog" className="mt-4">
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
                        <CardTitle className="text-lg">{item.name}</CardTitle>
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
                          <Button variant="ghost" size="sm" onClick={() => setEditItem(item)}>
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
                  <Button size="sm" onClick={() => {
                    setAddForVendorId(selectedVendor.user_id);
                    setIsAddItemOpen(true);
                  }}>
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
                          <Button variant="ghost" size="sm" onClick={() => setEditItem(item)}><Edit className="h-4 w-4" /></Button>
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

      {/* Add Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={(open) => { setIsAddItemOpen(open); if (!open) setAddForVendorId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Catalog Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item Name *</Label>
              <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Round Tables" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity</Label><Input type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} /></div>
              <div><Label>Price/Day (₹)</Label><Input type="number" value={newItem.price_per_day} onChange={(e) => setNewItem({ ...newItem, price_per_day: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div><Label>Image URL</Label><Input value={newItem.image_url} onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })} placeholder="https://..." /></div>
            <Button
              className="w-full"
              disabled={!newItem.name || !addForVendorId}
              onClick={() => createItem.mutate({ ...newItem, vendor_id: addForVendorId, is_available: true })}
            >
              {createItem.isPending ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Catalog Item</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label>Item Name *</Label>
                <Input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={editItem.category || "General"} onValueChange={(v) => setEditItem({ ...editItem, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={editItem.description || ""} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Quantity</Label><Input type="number" value={editItem.quantity} onChange={(e) => setEditItem({ ...editItem, quantity: parseInt(e.target.value) || 1 })} /></div>
                <div><Label>Price/Day (₹)</Label><Input type="number" value={editItem.price_per_day || 0} onChange={(e) => setEditItem({ ...editItem, price_per_day: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div><Label>Image URL</Label><Input value={editItem.image_url || ""} onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })} /></div>
              <div className="flex items-center gap-2">
                <Switch checked={editItem.is_available} onCheckedChange={(v) => setEditItem({ ...editItem, is_available: v })} />
                <Label>Available</Label>
              </div>
              <Button
                className="w-full"
                disabled={!editItem.name}
                onClick={() => updateItem.mutate({
                  id: editItem.id,
                  name: editItem.name,
                  description: editItem.description,
                  quantity: editItem.quantity,
                  price_per_day: editItem.price_per_day,
                  category: editItem.category,
                  image_url: editItem.image_url,
                  is_available: editItem.is_available,
                })}
              >
                {updateItem.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorInventoryAdmin;
