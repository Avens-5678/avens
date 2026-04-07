import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, ShieldCheck, Search, Package, IndianRupee, Users, Eye, Phone,
  MapPin, Building2, Edit, Trash2, Plus, FileText, MoreHorizontal,
  Ban, CheckCircle2, MessageSquare, ExternalLink, Star, ClipboardList,
  TrendingUp, UserPlus,
} from "lucide-react";
import { format } from "date-fns";
import RentalItemFormDialog from "./RentalItemFormDialog";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const VendorInventoryAdmin = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("vendors");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [addForVendorId, setAddForVendorId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [suspendVendor, setSuspendVendor] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ── Fetch all vendor profiles ──
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ["admin_vendors"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "vendor");
      if (!roles || roles.length === 0) return [];
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      const adminIds = new Set((adminRoles || []).map((r) => r.user_id));
      const vendorIds = roles.map((r) => r.user_id).filter((id) => !adminIds.has(id));
      if (vendorIds.length === 0) return [];
      const { data: profiles, error } = await supabase.from("profiles").select("*").in("user_id", vendorIds);
      if (error) throw error;
      return profiles || [];
    },
  });

  // ── Fetch all inventory ──
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ["admin_vendor_inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendor_inventory").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // ── Fetch rental orders ──
  const { data: rentalOrders = [] } = useQuery({
    queryKey: ["admin_rental_orders_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_orders")
        .select("id, assigned_vendor_id, status, client_name, title, created_at, vendor_payout")
        .not("assigned_vendor_id", "is", null);
      if (error) throw error;
      return data || [];
    },
  });

  // ── Fetch reviews ──
  const { data: reviews = [] } = useQuery({
    queryKey: ["admin_all_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_reviews")
        .select("id, rental_id, reviewer_name, rating, review_text, is_approved, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  // ── Helpers ──
  const getVendorItemCount = useCallback((vid: string) => inventory.filter((i) => i.vendor_id === vid).length, [inventory]);
  const getVendorOrderCount = useCallback((vid: string) => rentalOrders.filter((o) => o.assigned_vendor_id === vid).length, [rentalOrders]);
  const getVendorRevenue = useCallback((vid: string) => rentalOrders
    .filter((o) => o.assigned_vendor_id === vid && ["confirmed", "completed", "delivered"].includes(o.status))
    .reduce((s, o) => s + (o.vendor_payout || 0), 0), [rentalOrders]);

  // ── Stats ──
  const totalVendors = vendors.length;
  const activeCount = vendors.filter((v: any) => (v.vendor_status || "active") === "active").length;
  const pendingCount = vendors.filter((v: any) => v.vendor_status === "pending").length;
  const suspendedCount = vendors.filter((v: any) => v.vendor_status === "suspended").length;
  const now = new Date();
  const newThisMonth = vendors.filter((v: any) => {
    const d = new Date(v.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const topVendor = useMemo(() => {
    if (vendors.length === 0) return null;
    let best: any = null;
    let bestRev = 0;
    vendors.forEach((v: any) => {
      const rev = getVendorRevenue(v.user_id);
      if (rev > bestRev) { bestRev = rev; best = v; }
    });
    return best ? { name: best.company_name || best.full_name || "—", revenue: bestRev } : null;
  }, [vendors, getVendorRevenue]);

  // ── Cities for filter ──
  const cities = useMemo(() => {
    const s = new Set<string>();
    vendors.forEach((v: any) => { if (v.city) s.add(v.city); });
    return Array.from(s).sort();
  }, [vendors]);

  // ── Filter vendors ──
  const filteredVendors = useMemo(() => {
    return vendors.filter((v: any) => {
      if (statusFilter !== "all" && (v.vendor_status || "active") !== statusFilter) return false;
      if (cityFilter !== "all" && (v.city || "") !== cityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !(v.full_name || "").toLowerCase().includes(q) &&
          !(v.company_name || "").toLowerCase().includes(q) &&
          !(v.phone || "").includes(q) &&
          !(v.email || "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [vendors, statusFilter, cityFilter, search]);

  // ── Toggle verified ──
  const toggleVerified = useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      const { error } = await supabase.from("vendor_inventory")
        .update({ is_verified, verified_at: is_verified ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin_vendor_inventory"] });
      toast({ title: vars.is_verified ? "Item Verified" : "Verification Removed" });
    },
  });

  // ── Delete item ──
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

  // ── Update vendor status ──
  const updateVendorStatus = useMutation({
    mutationFn: async ({ userId, status, reason }: { userId: string; status: string; reason?: string }) => {
      const updates: any = { vendor_status: status };
      if (status === "suspended") {
        updates.suspension_reason = reason || null;
        updates.suspended_at = new Date().toISOString();
      } else {
        updates.suspension_reason = null;
        updates.suspended_at = null;
      }
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin_vendors"] });
      setSuspendVendor(null);
      setSuspendReason("");
      toast({ title: `Vendor ${vars.status === "suspended" ? "suspended" : vars.status === "active" ? "activated" : "updated"}` });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Create chat with vendor ──
  const startChat = useMutation({
    mutationFn: async (vendor: any) => {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("vendor_id", vendor.user_id)
        .eq("type", "client")
        .eq("client_id", user!.id)
        .maybeSingle();
      if (existing) return existing.id;
      // Create new
      const { data, error } = await supabase.from("chat_conversations").insert({
        vendor_id: vendor.user_id,
        type: "client",
        client_id: user!.id,
        title: `Admin ↔ ${vendor.company_name || vendor.full_name || "Vendor"}`,
      } as any).select("id").single();
      if (error) throw error;
      await supabase.from("chat_messages").insert({
        conversation_id: data.id,
        sender_id: user!.id,
        sender_type: "system",
        message: "Admin started a conversation",
        message_type: "system",
      } as any);
      return data.id;
    },
    onSuccess: () => toast({ title: "Chat opened — go to Chat tab" }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Form handlers (kept from original) ──
  const handleFormSave = async (data: Record<string, any>, variants: { attributeType: string; rows: any[] } | null) => {
    const vendorId = addForVendorId || editItem?.vendor_id;
    if (!vendorId) throw new Error("No vendor selected");
    const itemData: Record<string, any> = {
      name: data.title, short_description: data.short_description, description: data.description,
      address: data.address || null, categories: data.categories || [], search_keywords: data.search_keywords || null,
      display_order: data.display_order || 0, quantity: data.quantity || 1, is_available: data.is_active !== false,
      has_variants: data.has_variants || false, price_value: data.price_value, pricing_unit: data.pricing_unit,
      image_url: data.image_url || null, image_urls: data.image_urls || [], vendor_id: vendorId,
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
    if (variants && variants.rows.length > 0) {
      await supabase.from("vendor_inventory_variants").delete().eq("inventory_item_id", itemId);
      const variantInserts = variants.rows.map((v, i) => ({
        inventory_item_id: itemId, attribute_type: variants.attributeType, attribute_value: v.attribute_value,
        price_value: v.price_value, pricing_unit: v.pricing_unit, stock_quantity: v.stock_quantity,
        image_url: v.image_url, display_order: i,
      }));
      const { error: vErr } = await supabase.from("vendor_inventory_variants").insert(variantInserts);
      if (vErr) throw vErr;
    } else if (editItem?.has_variants && !data.has_variants) {
      await supabase.from("vendor_inventory_variants").delete().eq("inventory_item_id", itemId);
    }
    queryClient.invalidateQueries({ queryKey: ["admin_vendor_inventory"] });
    toast({ title: editItem ? "Item Updated" : "Item Added" });
    setEditItem(null);
    setAddForVendorId(null);
  };

  const openAddForm = (vendorId: string) => { setAddForVendorId(vendorId); setEditItem(null); setIsFormOpen(true); };
  const openEditForm = (item: any) => {
    setEditItem({ ...item, title: item.name, short_description: item.short_description || "", is_active: item.is_available, _variantTable: "vendor_inventory_variants" });
    setAddForVendorId(null); setIsFormOpen(true);
  };

  const [catalogServiceFilter, setCatalogServiceFilter] = useState("all");
  const filteredInventory = inventory.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || (item.category || "").toLowerCase().includes(search.toLowerCase());
    const matchService = catalogServiceFilter === "all" || ((item as any).service_type || "rental") === catalogServiceFilter;
    return matchSearch && matchService;
  });

  const isLoading = vendorsLoading || inventoryLoading;
  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{totalVendors}</p>
          <p className="text-[10px] text-muted-foreground">Total Vendors</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="text-[10px] text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{newThisMonth}</p>
          <p className="text-[10px] text-muted-foreground">New This Month</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-sm font-bold text-foreground truncate">{topVendor?.name || "—"}</p>
          <p className="text-xs text-emerald-600 font-semibold">{topVendor ? `₹${Math.round(topVendor.revenue).toLocaleString("en-IN")}` : ""}</p>
          <p className="text-[10px] text-muted-foreground">Top Vendor</p>
        </CardContent></Card>
      </div>

      {/* ── Header + Search + Filters ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5" />Vendor Management</h2>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..." className="pl-8 h-8 text-xs" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          {cities.length > 0 && (
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vendors"><Users className="h-4 w-4 mr-1" />Vendors ({filteredVendors.length})</TabsTrigger>
          <TabsTrigger value="catalog"><Package className="h-4 w-4 mr-1" />Catalog ({inventory.length})</TabsTrigger>
          <TabsTrigger value="service-requests"><Package className="h-4 w-4 mr-1" />Service Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="service-requests" className="mt-4">
          <ServiceAccessRequests />
        </TabsContent>

        {/* ══ Vendors Tab ══ */}
        <TabsContent value="vendors" className="mt-4">
          {filteredVendors.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Vendors Found</h3>
            </CardContent></Card>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Vendor</TableHead>
                      <TableHead className="text-xs w-[80px]">Status</TableHead>
                      <TableHead className="text-xs w-[60px] text-center">Items</TableHead>
                      <TableHead className="text-xs w-[60px] text-center">Orders</TableHead>
                      <TableHead className="text-xs w-[90px] text-right">Revenue</TableHead>
                      <TableHead className="text-xs w-[80px]">Joined</TableHead>
                      <TableHead className="text-xs w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor: any) => {
                      const status = vendor.vendor_status || "active";
                      const revenue = getVendorRevenue(vendor.user_id);
                      return (
                        <TableRow key={vendor.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedVendor(vendor)}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                                {getInitials(vendor.full_name || vendor.company_name || "V")}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{vendor.company_name || vendor.full_name || "Unnamed"}</p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  {vendor.phone && <span>{vendor.phone}</span>}
                                  {vendor.city && <span>&middot; {vendor.city}</span>}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[10px] ${STATUS_BADGE[status] || ""}`}>{status}</Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm font-medium">{getVendorItemCount(vendor.user_id)}</TableCell>
                          <TableCell className="text-center text-sm font-medium">{getVendorOrderCount(vendor.user_id)}</TableCell>
                          <TableCell className="text-right text-sm font-medium">₹{Math.round(revenue).toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{format(new Date(vendor.created_at), "dd MMM yy")}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-7 px-1.5"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedVendor(vendor); }}>
                                  <Eye className="h-3.5 w-3.5 mr-2" />View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); startChat.mutate(vendor); }}>
                                  <MessageSquare className="h-3.5 w-3.5 mr-2" />Chat with Vendor
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openAddForm(vendor.user_id); }}>
                                  <Plus className="h-3.5 w-3.5 mr-2" />Add Product
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {status === "pending" && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateVendorStatus.mutate({ userId: vendor.user_id, status: "active" }); }}>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-600" />Approve
                                  </DropdownMenuItem>
                                )}
                                {status !== "suspended" ? (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSuspendVendor(vendor); }} className="text-destructive">
                                    <Ban className="h-3.5 w-3.5 mr-2" />Suspend
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateVendorStatus.mutate({ userId: vendor.user_id, status: "active" }); }}>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-600" />Reactivate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ══ Catalog Tab ══ */}
        <TabsContent value="catalog" className="mt-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[{ value: "all", label: "All" }, { value: "rental", label: "Rentals" }, { value: "venue", label: "Venues" }, { value: "crew", label: "Crew" }].map((opt) => (
              <Button key={opt.value} variant={catalogServiceFilter === opt.value ? "default" : "outline"} size="sm" onClick={() => setCatalogServiceFilter(opt.value)}>{opt.label}</Button>
            ))}
          </div>
          {filteredInventory.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No Items</h3></CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInventory.map((item) => {
                const vendor = vendors.find((v: any) => v.user_id === item.vendor_id);
                return (
                  <Card key={item.id} className={!item.is_available ? "opacity-60" : ""}>
                    {item.image_url && <div className="aspect-video w-full overflow-hidden rounded-t-lg"><img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /></div>}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div><CardTitle className="text-base">{item.name}</CardTitle><Badge variant="outline" className="text-[10px] capitalize mt-1">{(item as any).service_type || "rental"}</Badge></div>
                        <div className="flex gap-1">
                          {(item as any).is_verified && <Badge className="bg-emerald-500 text-white shrink-0 text-[10px]"><ShieldCheck className="h-3 w-3 mr-0.5" />Verified</Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {vendor && <p className="text-xs text-muted-foreground">by {(vendor as any).company_name || (vendor as any).full_name}</p>}
                      <LogisticsEditor item={item} />
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Switch checked={(item as any).is_verified || false} onCheckedChange={(c) => toggleVerified.mutate({ id: item.id, is_verified: c })} className="scale-75" />
                          <span className="text-[10px] text-muted-foreground">Verified</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7" onClick={() => openEditForm(item)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="h-7" onClick={() => { if (confirm("Delete?")) deleteItem.mutate(item.id); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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

      {/* ══ Vendor Detail Sheet ══ */}
      {selectedVendor && (
        <VendorDetailSheet
          vendor={selectedVendor}
          open={!!selectedVendor}
          onOpenChange={(o) => { if (!o) setSelectedVendor(null); }}
          inventory={inventory}
          rentalOrders={rentalOrders}
          reviews={reviews}
          onAddItem={(vid) => { setSelectedVendor(null); openAddForm(vid); }}
          onEditItem={(item) => { setSelectedVendor(null); openEditForm(item); }}
          onDeleteItem={(id) => deleteItem.mutate(id)}
          onToggleVerified={(id, v) => toggleVerified.mutate({ id, is_verified: v })}
          onStatusChange={(userId, status, reason) => updateVendorStatus.mutate({ userId, status, reason })}
          onChat={(vendor) => startChat.mutate(vendor)}
        />
      )}

      {/* ══ Suspend Dialog ══ */}
      {suspendVendor && (
        <Sheet open={!!suspendVendor} onOpenChange={(o) => { if (!o) { setSuspendVendor(null); setSuspendReason(""); } }}>
          <SheetContent className="w-full sm:max-w-sm">
            <SheetHeader><SheetTitle>Suspend Vendor</SheetTitle></SheetHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm">Suspending <strong>{suspendVendor.company_name || suspendVendor.full_name}</strong>. Their products will be hidden from the marketplace.</p>
              <div className="space-y-1.5">
                <Label className="text-xs">Reason for suspension</Label>
                <Textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Policy violation, quality issue, etc." rows={3} />
              </div>
              <Button variant="destructive" className="w-full" onClick={() => updateVendorStatus.mutate({ userId: suspendVendor.user_id, status: "suspended", reason: suspendReason })} disabled={updateVendorStatus.isPending}>
                {updateVendorStatus.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Confirm Suspension
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* ══ Item Form Dialog ══ */}
      <RentalItemFormDialog
        open={isFormOpen}
        onOpenChange={(open) => { setIsFormOpen(open); if (!open) { setEditItem(null); setAddForVendorId(null); } }}
        editingItem={editItem}
        onSave={handleFormSave}
        title={editItem ? "Edit Catalog Item" : "Add Catalog Item"}
        vendorMode
      />
    </div>
  );
};

// ═══════════════════════════════════════════
// Vendor Detail Sheet (tabbed)
// ═══════════════════════════════════════════
const VendorDetailSheet = ({
  vendor, open, onOpenChange, inventory, rentalOrders, reviews,
  onAddItem, onEditItem, onDeleteItem, onToggleVerified, onStatusChange, onChat,
}: {
  vendor: any; open: boolean; onOpenChange: (v: boolean) => void;
  inventory: any[]; rentalOrders: any[]; reviews: any[];
  onAddItem: (vid: string) => void; onEditItem: (item: any) => void; onDeleteItem: (id: string) => void;
  onToggleVerified: (id: string, v: boolean) => void;
  onStatusChange: (userId: string, status: string, reason?: string) => void;
  onChat: (vendor: any) => void;
}) => {
  const [tab, setTab] = useState("profile");
  const vendorItems = inventory.filter((i) => i.vendor_id === vendor.user_id);
  const vendorOrders = rentalOrders.filter((o) => o.assigned_vendor_id === vendor.user_id);
  const vendorItemIds = new Set(vendorItems.map((i) => i.id));
  const vendorReviews = reviews.filter((r) => vendorItemIds.has(r.rental_id));
  const status = vendor.vendor_status || "active";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {getInitials(vendor.full_name || vendor.company_name || "V")}
            </div>
            <div className="min-w-0">
              <span className="truncate block">{vendor.company_name || vendor.full_name || "Vendor"}</span>
              <Badge variant="secondary" className={`text-[10px] ${STATUS_BADGE[status]}`}>{status}</Badge>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <div className="flex gap-1 border-b border-border mb-4 overflow-x-auto">
            {[
              { value: "profile", label: "Profile" },
              { value: "inventory", label: `Inventory (${vendorItems.length})` },
              { value: "orders", label: `Orders (${vendorOrders.length})` },
              { value: "reviews", label: `Reviews (${vendorReviews.length})` },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {tab === "profile" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><Label className="text-[10px] text-muted-foreground">Name</Label><p className="font-medium">{vendor.full_name || "—"}</p></div>
                <div><Label className="text-[10px] text-muted-foreground">Company</Label><p>{vendor.company_name || "—"}</p></div>
                <div><Label className="text-[10px] text-muted-foreground">Phone</Label><p>{vendor.phone || "—"}</p></div>
                <div><Label className="text-[10px] text-muted-foreground">Email</Label><p className="truncate">{vendor.email || "—"}</p></div>
                <div><Label className="text-[10px] text-muted-foreground">City</Label><p>{vendor.city || "—"}</p></div>
                <div><Label className="text-[10px] text-muted-foreground">GST</Label><p>{vendor.gst_number || "—"}</p></div>
                <div><Label className="text-[10px] text-muted-foreground">PAN</Label><p>{vendor.pan_number || "—"}</p></div>
                <div><Label className="text-[10px] text-muted-foreground">Joined</Label><p>{format(new Date(vendor.created_at), "dd MMM yyyy")}</p></div>
              </div>
              {vendor.address && <div><Label className="text-[10px] text-muted-foreground">Address</Label><p className="text-sm">{vendor.address}</p></div>}
              {vendor.godown_address && <div><Label className="text-[10px] text-muted-foreground">Godown</Label><p className="text-sm">{vendor.godown_address}</p></div>}
              {vendor.bio && <div><Label className="text-[10px] text-muted-foreground">About</Label><p className="text-sm">{vendor.bio}</p></div>}
              {vendor.suspension_reason && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                  <Label className="text-[10px] text-red-600">Suspension Reason</Label>
                  <p className="text-sm text-red-700 dark:text-red-400">{vendor.suspension_reason}</p>
                </div>
              )}
              <Separator />
              <div className="flex flex-wrap gap-2">
                {status === "pending" && (
                  <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => onStatusChange(vendor.user_id, "active")}>
                    <CheckCircle2 className="h-3.5 w-3.5" />Approve Vendor
                  </Button>
                )}
                {status === "suspended" ? (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onStatusChange(vendor.user_id, "active")}>
                    <CheckCircle2 className="h-3.5 w-3.5" />Reactivate
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => onStatusChange(vendor.user_id, "suspended")}>
                    <Ban className="h-3.5 w-3.5" />Suspend
                  </Button>
                )}
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onChat(vendor)}>
                  <MessageSquare className="h-3.5 w-3.5" />Chat
                </Button>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {tab === "inventory" && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" className="gap-1" onClick={() => onAddItem(vendor.user_id)}><Plus className="h-3.5 w-3.5" />Add Item</Button>
              </div>
              {vendorItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No inventory items.</p>
              ) : (
                vendorItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.image_url ? <img src={item.image_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>Qty: {item.quantity}</span>
                          {item.price_value && <span>₹{item.price_value}</span>}
                          {(item as any).is_verified && <ShieldCheck className="h-3 w-3 text-emerald-500" />}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Switch checked={(item as any).is_verified || false} onCheckedChange={(c) => onToggleVerified(item.id, c)} className="scale-[0.6]" />
                      <Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => onEditItem(item)}><Edit className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => { if (confirm("Delete?")) onDeleteItem(item.id); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Orders Tab */}
          {tab === "orders" && (
            <div className="space-y-2">
              {vendorOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No orders yet.</p>
              ) : (
                vendorOrders.slice(0, 30).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{order.title || order.id.slice(0, 8)}</p>
                      <p className="text-[10px] text-muted-foreground">{order.client_name || "—"} &middot; {format(new Date(order.created_at), "dd MMM yy")}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {order.vendor_payout && <span className="text-xs font-semibold">₹{Math.round(order.vendor_payout).toLocaleString("en-IN")}</span>}
                      <Badge variant="secondary" className="text-[9px] capitalize">{order.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {tab === "reviews" && (
            <div className="space-y-2">
              {vendorReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No reviews yet.</p>
              ) : (
                vendorReviews.map((review) => (
                  <div key={review.id} className="p-2.5 rounded-lg bg-muted/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{review.reviewer_name}</span>
                      </div>
                      <Badge variant="secondary" className={`text-[9px] ${review.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {review.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                    {review.review_text && <p className="text-xs text-muted-foreground line-clamp-2">{review.review_text}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ── Admin-only logistics estimate editor (per inventory item) ──
const LogisticsEditor = ({ item }: { item: any }) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [vol, setVol] = useState<string>(item.volume_units?.toString() ?? "");
  const [lab, setLab] = useState<string>(item.labor_weight?.toString() ?? "");
  const source = item.logistics_source || "ai_estimate";

  const save = async () => {
    const { error } = await supabase
      .from("vendor_inventory")
      .update({
        volume_units: vol === "" ? null : Number(vol),
        labor_weight: lab === "" ? null : Number(lab),
        logistics_source: "admin_override",
      })
      .eq("id", item.id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Logistics updated" });
    qc.invalidateQueries({ queryKey: ["admin-vendor-inventory"] });
  };

  return (
    <div className="border border-dashed border-border rounded-md p-2 space-y-1.5 bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Logistics Estimate</span>
        <Badge variant="outline" className="text-[9px] capitalize">{source.replace("_", " ")}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <label className="text-[9px] text-muted-foreground">Volume (CBM)</label>
          <input
            type="number"
            step="0.1"
            value={vol}
            onChange={(e) => setVol(e.target.value)}
            className="w-full h-7 px-2 text-xs border border-input rounded bg-background"
          />
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground">Labor (kg)</label>
          <input
            type="number"
            value={lab}
            onChange={(e) => setLab(e.target.value)}
            className="w-full h-7 px-2 text-xs border border-input rounded bg-background"
          />
        </div>
      </div>
      <Button size="sm" variant="outline" className="w-full h-6 text-[10px]" onClick={save}>Save logistics</Button>
    </div>
  );
};

// ── Admin: vendor service access requests ──
const ServiceAccessRequests = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["service-access-requests"],
    queryFn: async () => {
      const { data } = await (supabase.from as any)("vendor_service_access")
        .select("id, vendor_id, service, status, requested_at")
        .order("requested_at", { ascending: false });
      const ids = Array.from(new Set((data || []).map((r: any) => r.vendor_id)));
      if (ids.length === 0) return data || [];
      const { data: profs } = await supabase.from("profiles")
        .select("user_id, company_name, full_name").in("user_id", ids as any);
      const map = new Map((profs || []).map((p: any) => [p.user_id, p]));
      return (data || []).map((r: any) => ({ ...r, profile: map.get(r.vendor_id) }));
    },
  });
  const review = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await (supabase.from as any)("vendor_service_access")
        .update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast({ title: `Request ${vars.status}` });
      qc.invalidateQueries({ queryKey: ["service-access-requests"] });
    },
  });
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold mb-2">Vendor Service Access Requests</h3>
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No requests.</p>}
        {rows.map((r: any) => (
          <div key={r.id} className="flex items-center justify-between border rounded-md p-3">
            <div>
              <p className="text-sm font-medium">{r.profile?.company_name || r.profile?.full_name || r.vendor_id.slice(0,8)}</p>
              <p className="text-xs text-muted-foreground">Service: <strong>{r.service}</strong> · Status: {r.status}</p>
            </div>
            {r.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => review.mutate({ id: r.id, status: "approved" })}>Approve</Button>
                <Button size="sm" variant="destructive"
                  onClick={() => review.mutate({ id: r.id, status: "rejected" })}>Reject</Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default VendorInventoryAdmin;
