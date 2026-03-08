import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  useRentalOrders,
  useCreateRentalOrder,
  useUpdateRentalOrder,
  useDeleteRentalOrder,
  useSendToVendor,
  type RentalOrderInsert,
} from "@/hooks/useRentalOrders";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Send, Search, MapPin, Calendar, Package, Phone, Trash2, Eye,
  CheckCircle, Clock, MessageSquare, Filter, X, Users, ChevronDown, ChevronUp,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  sent_to_vendors: "bg-yellow-100 text-yellow-800",
  quoted: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const CATEGORIES = [
  "General", "Structures & Venues", "Stages & Platforms", "Lighting & Sound",
  "AC & Climate Control", "Furniture & Decor", "Catering Equipment",
  "AV Equipment", "Power & Generators", "Transport & Logistics",
];

const LiveRentalOrders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationSearch, setLocationSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());
  const [vendorSearch, setVendorSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [localityFilter, setLocalityFilter] = useState("");

  const [newOrder, setNewOrder] = useState<RentalOrderInsert>({
    title: "", equipment_category: "General", equipment_details: "",
    location: "", event_date: "", budget: "", client_name: "",
    client_phone: "", client_email: "", notes: "",
  });

  const { data: orders, isLoading } = useRentalOrders({
    status: statusFilter, category: categoryFilter, location: locationSearch,
  });

  // Fetch vendor profiles for assigned orders
  const vendorIds = [...new Set((orders || []).filter(o => o.assigned_vendor_id).map(o => o.assigned_vendor_id!))];
  const { data: vendorProfiles } = useQuery({
    queryKey: ["vendor_profiles_for_orders", vendorIds],
    queryFn: async () => {
      if (vendorIds.length === 0) return {};
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name, phone, city")
        .in("user_id", vendorIds);
      const map: Record<string, any> = {};
      (data || []).forEach((p: any) => { map[p.user_id] = p; });
      return map;
    },
    enabled: vendorIds.length > 0,
  });

  const createOrder = useCreateRentalOrder();
  const updateOrder = useUpdateRentalOrder();
  const deleteOrder = useDeleteRentalOrder();
  const sendToVendor = useSendToVendor();

  // Fetch matching vendors when send dialog opens
  const { data: matchingVendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["matching_vendors", selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder) return [];

      // Get ALL vendor inventory (don't filter by vendor role — show anyone with inventory)
      const { data: inventory } = await supabase
        .from("vendor_inventory")
        .select("*")
        .eq("is_available", true);

      // Get unique vendor IDs from inventory
      const inventoryVendorIds = [...new Set((inventory || []).map(i => i.vendor_id))];
      if (inventoryVendorIds.length === 0) return [];

      // Get profiles for all vendors who have inventory
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", inventoryVendorIds);

      // Also fetch admin's in-house rentals catalog
      const { data: adminRentals } = await supabase
        .from("rentals")
        .select("*")
        .eq("is_active", true);

      // Word-level exact match: check if keyword matches a whole word in text
      const exactWordMatch = (text: string, keyword: string): boolean => {
        const words = text.toLowerCase().split(/[\s,\-–()/]+/).filter(w => w.length >= 1);
        return words.some(w => w === keyword);
      };

      // Fuzzy matching (Levenshtein) — only for keywords with 4+ chars
      const fuzzyWordMatch = (text: string, keyword: string): boolean => {
        const words = text.toLowerCase().split(/[\s,\-–()/]+/).filter(w => w.length >= 2);
        return words.some(w => {
          if (w === keyword || w.includes(keyword) || keyword.includes(w)) return true;
          const dist = levenshteinDistance(w, keyword);
          return dist <= Math.max(1, Math.floor(Math.min(w.length, keyword.length) / 3));
        });
      };

      const levenshteinDistance = (a: string, b: string): number => {
        const matrix: number[][] = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
          for (let j = 1; j <= a.length; j++) {
            matrix[i][j] = b[i - 1] === a[j - 1]
              ? matrix[i - 1][j - 1]
              : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
          }
        }
        return matrix[b.length][a.length];
      };

      // Matching function: short keywords (< 4 chars) use exact word match only,
      // long keywords (4+ chars) use fuzzy match
      const itemMatchesKeyword = (text: string, kw: string): boolean => {
        if (kw.length < 4) {
          return exactWordMatch(text, kw);
        }
        return fuzzyWordMatch(text, kw);
      };

      // Extract item-name keywords from title (and cart item titles for Cart Orders)
      let orderTitle = (selectedOrder.title || "").toLowerCase();
      const orderLocation = (selectedOrder.location || "").toLowerCase();

      // For cart orders, extract actual item titles from equipment_details JSON
      if (selectedOrder.equipment_category === "Cart Order" && selectedOrder.equipment_details) {
        try {
          const parsed = JSON.parse(selectedOrder.equipment_details);
          const cartItemTitles = (parsed.cart_items || []).map((ci: any) => ci.title || "").join(" ");
          if (cartItemTitles) {
            orderTitle = cartItemTitles.toLowerCase();
          }
        } catch {}
      }
      
      const stopWords = new Set([
        "the", "a", "an", "for", "and", "or", "of", "in", "to", "with", "is", "at", "on", "by",
        "rental", "rentals", "order", "orders", "units", "unit", "nos", "set", "sets", "pcs",
        "-", "–", "", "x", "day", "days", "event", "per", "cart", "enquiry", "items", "item",
      ]);

      // Treat location words as stop words
      const locationWords = orderLocation.split(/[\s,\-–()/]+/).map(w => w.trim().toLowerCase()).filter(w => w.length >= 2);
      locationWords.forEach(w => stopWords.add(w));

      const extractKeywords = (text: string) =>
        text.split(/[\s,\-–()/]+/)
          .map(w => w.trim().toLowerCase().replace(/[^a-z]/g, ''))
          .filter(w => w.length >= 2 && !stopWords.has(w));

      const allKeywords = [...new Set(extractKeywords(orderTitle).filter(w => !/^\d+$/.test(w)))];

      // Match items: ALL keywords must match (AND logic) for precision
      const itemMatchesAllKeywords = (name: string, keywords: string): boolean => {
        const searchText = `${name} ${keywords}`;
        return allKeywords.every(kw => itemMatchesKeyword(searchText, kw));
      };

      // Filter vendors with precise matching
      const results = (profiles || []).map((profile: any) => {
        const vendorItems = (inventory || []).filter(
          (i) => i.vendor_id === profile.user_id
        );

        const matchingItems = vendorItems.filter((item) => {
          return itemMatchesAllKeywords(
            item.name || "",
            item.search_keywords || ""
          );
        });

        // Also find matching admin rentals
        const matchingAdminRentals = (adminRentals || []).filter((rental: any) => {
          return itemMatchesAllKeywords(
            rental.title || "",
            rental.search_keywords || ""
          );
        });

        // City/location matching (fuzzy for location)
        const orderLoc = orderLocation;
        const cityMatchFn = (text: string) => {
          if (!orderLoc) return true;
          const t = text.toLowerCase();
          if (t.includes(orderLoc) || orderLoc.includes(t)) return true;
          return locationWords.some(w => w.length >= 3 && t.includes(w));
        };

        return {
          ...profile,
          allItems: vendorItems,
          matchingItems,
          matchingAdminRentals,
          totalItems: vendorItems.length,
          cityMatch: cityMatchFn(profile.city || "") || cityMatchFn(profile.address || "") || cityMatchFn(profile.godown_address || ""),
          hasMatchingItems: matchingItems.length > 0,
        };
      });

      // Sort: matching items + city first, then by total items
      return results.sort((a: any, b: any) => {
        const scoreA = (a.hasMatchingItems ? 2 : 0) + (a.cityMatch ? 1 : 0);
        const scoreB = (b.hasMatchingItems ? 2 : 0) + (b.cityMatch ? 1 : 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.totalItems - a.totalItems;
      });
    },
    enabled: isSendOpen && !!selectedOrder,
  });

  const handleCreate = () => {
    if (!newOrder.title) return;
    createOrder.mutate(newOrder, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewOrder({
          title: "", equipment_category: "General", equipment_details: "",
          location: "", event_date: "", budget: "", client_name: "",
          client_phone: "", client_email: "", notes: "",
        });
      },
    });
  };

  const handleSendToVendor = () => {
    if (!selectedOrderId || !vendorPhone) return;
    sendToVendor.mutate(
      { orderId: selectedOrderId, vendorPhone, vendorName },
      {
        onSuccess: () => {
          setIsSendOpen(false);
          setVendorPhone("");
          setVendorName("");
          setSelectedOrderId(null);
          setSelectedOrder(null);
        },
      }
    );
  };

  const selectVendorFromList = (vendor: any) => {
    setVendorPhone(vendor.phone || "");
    setVendorName(vendor.full_name || vendor.company_name || "");
  };

  const openSendDialog = (order: any) => {
    setSelectedOrderId(order.id);
    setSelectedOrder(order);
    setVendorPhone("");
    setVendorName("");
    setSelectedVendors(new Set());
    setExpandedVendors(new Set());
    setVendorSearch("");
    setCityFilter("");
    setLocalityFilter("");
    setIsSendOpen(true);
  };

  const toggleVendorSelection = (vendorId: string) => {
    setSelectedVendors(prev => {
      const next = new Set(prev);
      if (next.has(vendorId)) next.delete(vendorId);
      else next.add(vendorId);
      return next;
    });
  };

  const toggleVendorExpand = (vendorId: string) => {
    setExpandedVendors(prev => {
      const next = new Set(prev);
      if (next.has(vendorId)) next.delete(vendorId);
      else next.add(vendorId);
      return next;
    });
  };

  // Collect all matching admin rentals from vendor results
  const adminCatalogItems = matchingVendors?.length
    ? matchingVendors[0]?.matchingAdminRentals || []
    : [];

  // Get unique cities from vendors for filter dropdown
  const availableCities = [...new Set(
    (matchingVendors || [])
      .map((v: any) => v.city)
      .filter(Boolean)
      .map((c: string) => c.trim())
  )].sort();

  const filteredVendors = matchingVendors?.filter((v: any) => {
    // Text search filter
    if (vendorSearch) {
      const q = vendorSearch.toLowerCase();
      const textMatch = (v.full_name || "").toLowerCase().includes(q) ||
        (v.company_name || "").toLowerCase().includes(q) ||
        (v.city || "").toLowerCase().includes(q) ||
        (v.phone || "").includes(q) ||
        (v.allItems || []).some((item: any) => (item.name || "").toLowerCase().includes(q));
      if (!textMatch) return false;
    }

    // City filter - bidirectional and word-level matching
    if (cityFilter && cityFilter !== "all") {
      const cf = cityFilter.toLowerCase();
      const vc = (v.city || "").toLowerCase();
      const cityMatch = vc.includes(cf) || cf.includes(vc) ||
        cf.split(/[\s,]+/).some(w => w.length >= 2 && vc.includes(w));
      if (!cityMatch) return false;
    }

    // Locality filter (searches address + godown_address)
    if (localityFilter) {
      const loc = localityFilter.toLowerCase();
      const locMatch = (v.address || "").toLowerCase().includes(loc) ||
        (v.godown_address || "").toLowerCase().includes(loc) ||
        (v.city || "").toLowerCase().includes(loc);
      if (!locMatch) return false;
    }

    return true;
  });

  const stats = {
    total: orders?.length || 0,
    new: orders?.filter((o) => o.status === "new").length || 0,
    sent: orders?.filter((o) => o.status === "sent_to_vendors").length || 0,
    quoted: orders?.filter((o) => o.status === "quoted").length || 0,
    accepted: orders?.filter((o) => o.status === "accepted").length || 0,
    declined: orders?.filter((o) => o.status === "declined").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Live Rental Orders</h2>
          <p className="text-muted-foreground text-sm">Search, filter & send orders to vendors via WhatsApp</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Rental Order</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={newOrder.title} onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })} placeholder="e.g. 50 Round Tables for Wedding" /></div>
              <div>
                <Label>Equipment Category</Label>
                <Select value={newOrder.equipment_category} onValueChange={(v) => setNewOrder({ ...newOrder, equipment_category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Equipment Details</Label><Textarea value={newOrder.equipment_details} onChange={(e) => setNewOrder({ ...newOrder, equipment_details: e.target.value })} placeholder="Specifications, quantities, sizes..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Location / City</Label><Input value={newOrder.location} onChange={(e) => setNewOrder({ ...newOrder, location: e.target.value })} placeholder="City" /></div>
                <div><Label>Event Date</Label><Input type="date" value={newOrder.event_date} onChange={(e) => setNewOrder({ ...newOrder, event_date: e.target.value })} /></div>
              </div>
              <div><Label>Budget</Label><Input value={newOrder.budget} onChange={(e) => setNewOrder({ ...newOrder, budget: e.target.value })} placeholder="₹50,000 - ₹1,00,000" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Client Name</Label><Input value={newOrder.client_name} onChange={(e) => setNewOrder({ ...newOrder, client_name: e.target.value })} /></div>
                <div><Label>Client Phone</Label><Input value={newOrder.client_phone} onChange={(e) => setNewOrder({ ...newOrder, client_phone: e.target.value })} /></div>
              </div>
              <div><Label>Client Email</Label><Input value={newOrder.client_email} onChange={(e) => setNewOrder({ ...newOrder, client_email: e.target.value })} /></div>
              <div><Label>Admin Notes</Label><Textarea value={newOrder.notes} onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })} /></div>
              <Button onClick={handleCreate} disabled={createOrder.isPending || !newOrder.title} className="w-full">
                {createOrder.isPending ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Package },
          { label: "New", value: stats.new, icon: Clock },
          { label: "Sent", value: stats.sent, icon: Send },
          { label: "Quoted", value: stats.quoted, icon: MessageSquare },
          { label: "Accepted", value: stats.accepted, icon: CheckCircle },
          { label: "Declined", value: stats.declined, icon: X },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <Label className="text-xs mb-1 block"><Filter className="inline h-3 w-3 mr-1" />Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="sent_to_vendors">Sent to Vendors</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs mb-1 block"><Package className="inline h-3 w-3 mr-1" />Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs mb-1 block"><MapPin className="inline h-3 w-3 mr-1" />Location</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder="Search by city..." className="pl-9" />
              </div>
            </div>
            {(statusFilter !== "all" || categoryFilter !== "all" || locationSearch) && (
              <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); setLocationSearch(""); }}>
                <X className="h-4 w-4 mr-1" />Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
      ) : !orders?.length ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-muted-foreground text-sm">Create your first rental order or adjust filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{order.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" />{order.equipment_category}</span>
                      {order.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{order.location}</span>}
                      {order.event_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(order.event_date).toLocaleDateString()}</span>}
                      {order.budget && <span>💰 {order.budget}</span>}
                      {order.client_name && <span>👤 {order.client_name}</span>}
                    </div>

                    {/* Assigned Vendor Info */}
                    {order.assigned_vendor_id && vendorProfiles?.[order.assigned_vendor_id] && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          {vendorProfiles[order.assigned_vendor_id].full_name || vendorProfiles[order.assigned_vendor_id].company_name || "Vendor"}
                        </span>
                        {vendorProfiles[order.assigned_vendor_id].phone && (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />{vendorProfiles[order.assigned_vendor_id].phone}
                          </span>
                        )}
                        {vendorProfiles[order.assigned_vendor_id].city && (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{vendorProfiles[order.assigned_vendor_id].city}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Vendor Response */}
                    {order.vendor_response && (
                      <div className={`mt-2 p-2 rounded text-sm border ${
                        order.status === "accepted" ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" :
                        order.status === "declined" ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800" :
                        "bg-muted border-border"
                      }`}>
                        <div className="flex items-center gap-2">
                          {order.status === "accepted" && <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />}
                          {order.status === "declined" && <X className="h-4 w-4 text-red-600 shrink-0" />}
                          <strong>{order.status === "accepted" ? "Accepted" : order.status === "declined" ? "Declined" : "Response"}:</strong>
                          <span>{order.vendor_response}</span>
                          {order.vendor_quote_amount && <span className="ml-2 font-bold">₹{order.vendor_quote_amount.toLocaleString()}</span>}
                        </div>
                        {order.vendor_responded_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Responded: {new Date(order.vendor_responded_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setViewOrder(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(order.status === "new" || order.status === "sent_to_vendors" || order.status === "declined") && (
                      <Button size="sm" onClick={() => openSendDialog(order)} variant="default">
                        <Search className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">{order.status === "declined" ? "Resend" : "Search Vendors"}</span>
                      </Button>
                    )}
                    {(order.status === "quoted" || order.status === "accepted") && (
                      <Button size="sm" variant="default" onClick={() => updateOrder.mutate({ id: order.id, status: "confirmed" })}>
                        <CheckCircle className="h-4 w-4 mr-1" />Confirm
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => deleteOrder.mutate(order.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search Vendors Dialog */}
      <Dialog open={isSendOpen} onOpenChange={(open) => { setIsSendOpen(open); if (!open) { setSelectedOrder(null); setSelectedOrderId(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Vendors
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="p-3 bg-muted rounded-lg text-sm mb-2">
              <p className="font-medium">{selectedOrder.title}</p>
              <p className="text-muted-foreground">
                {selectedOrder.equipment_category} • {selectedOrder.location || "No location"}
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                placeholder="Search by name, company, item, phone..."
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block"><MapPin className="inline h-3 w-3 mr-1" />City</Label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="All Cities" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {availableCities.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block"><MapPin className="inline h-3 w-3 mr-1" />Locality / Area</Label>
                <Input
                  value={localityFilter}
                  onChange={(e) => setLocalityFilter(e.target.value)}
                  placeholder="e.g. Gachibowli"
                  className="h-9"
                />
              </div>
            </div>
            {((cityFilter && cityFilter !== "all") || localityFilter || vendorSearch) && (
              <Button variant="ghost" size="sm" onClick={() => { setCityFilter("all"); setLocalityFilter(""); setVendorSearch(""); }}>
                <X className="h-3 w-3 mr-1" />Clear Filters
              </Button>
            )}
          </div>

          {/* Admin In-House Catalog */}
          {adminCatalogItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-sm">
                <Package className="h-4 w-4" />
                Admin In-House Catalog
                <Badge variant="secondary">{adminCatalogItems.length} match</Badge>
              </h4>
              <div className="space-y-1">
                {adminCatalogItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-accent/30 rounded-lg border border-accent">
                    <div>
                      <span className="font-medium">{item.title}</span>
                      {item.short_description && <span className="text-muted-foreground ml-2">— {item.short_description}</span>}
                    </div>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {item.price_value ? `₹${item.price_value}` : item.price_range || ""}
                      {item.pricing_unit ? `/${item.pricing_unit}` : ""}
                      {item.quantity ? ` • Qty: ${item.quantity}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vendor list with checkboxes */}
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Vendors
              {filteredVendors && <Badge variant="secondary">{filteredVendors.length} found</Badge>}
              {selectedVendors.size > 0 && <Badge>{selectedVendors.size} selected</Badge>}
            </h4>

            {vendorsLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Searching vendors...</p>
            ) : !filteredVendors?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">No vendors found.</p>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {filteredVendors.map((vendor: any) => {
                  const isSelected = selectedVendors.has(vendor.user_id);
                  const isExpanded = expandedVendors.has(vendor.user_id);
                  return (
                    <div key={vendor.id} className={`rounded-lg border transition-colors ${isSelected ? "border-primary bg-primary/5" : ""}`}>
                      <div className="p-3 flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleVendorSelection(vendor.user_id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{vendor.full_name || vendor.company_name || "Unnamed Vendor"}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                                {vendor.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{vendor.phone}</span>}
                                {vendor.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{vendor.city}</span>}
                                {vendor.company_name && vendor.full_name && <span>🏢 {vendor.company_name}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {vendor.hasMatchingItems && (
                                <Badge variant="secondary" className="text-xs">
                                  {vendor.matchingItems.length} match
                                </Badge>
                              )}
                              {vendor.cityMatch && selectedOrder?.location && (
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="h-3 w-3 mr-1" />City
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Expandable items section */}
                          {vendor.totalItems > 0 && (
                            <button
                              onClick={() => toggleVendorExpand(vendor.user_id)}
                              className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                            >
                              <Package className="h-3 w-3" />
                              {vendor.totalItems} item{vendor.totalItems > 1 ? "s" : ""} in catalog
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          )}

                          {isExpanded && (
                            <div className="mt-2 space-y-1 pl-1">
                              {vendor.matchingItems.length > 0 && (
                                <p className="text-xs font-medium text-primary mb-1">Matching Items:</p>
                              )}
                              {vendor.matchingItems.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between text-xs p-1.5 bg-primary/5 rounded">
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-muted-foreground">Qty: {item.quantity} {item.price_per_day ? `• ₹${item.price_per_day}/day` : ""}</span>
                                </div>
                              ))}
                              {(() => {
                                const matchingIds = new Set(vendor.matchingItems.map((i: any) => i.id));
                                const otherItems = (vendor.allItems || []).filter((i: any) => !matchingIds.has(i.id));
                                if (otherItems.length === 0) return null;
                                return (
                                  <>
                                    <p className="text-xs font-medium text-muted-foreground mb-1 mt-2">Other Items:</p>
                                    {otherItems.map((item: any) => (
                                      <div key={item.id} className="flex items-center justify-between text-xs p-1.5 bg-muted/50 rounded">
                                        <span>{item.name}</span>
                                        <span className="text-muted-foreground">Qty: {item.quantity} {item.price_per_day ? `• ₹${item.price_per_day}/day` : ""}</span>
                                      </div>
                                    ))}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Send to selected vendors */}
          {selectedVendors.size > 0 && (
            <div className="border-t pt-4">
              <Button
                onClick={async () => {
                  // Send to all selected vendors and assign rental order
                  const selectedVendorsList = filteredVendors?.filter((v: any) => selectedVendors.has(v.user_id)) || [];
                  for (const vendor of selectedVendorsList) {
                    if (selectedOrderId) {
                      // Assign vendor to the rental order
                      await supabase
                        .from("rental_orders")
                        .update({ assigned_vendor_id: vendor.user_id, status: "sent_to_vendors" })
                        .eq("id", selectedOrderId);

                      sendToVendor.mutate(
                        { orderId: selectedOrderId, vendorPhone: vendor.phone || "", vendorName: vendor.full_name || vendor.company_name || "" },
                      );
                    }
                  }
                  setIsSendOpen(false);
                  setSelectedOrder(null);
                  setSelectedOrderId(null);
                }}
                disabled={sendToVendor.isPending}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {sendToVendor.isPending ? "Sending..." : `Send to ${selectedVendors.size} Vendor${selectedVendors.size > 1 ? "s" : ""} via WhatsApp`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order Details</DialogTitle></DialogHeader>
          {viewOrder && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-muted-foreground">Title</Label><p className="font-medium">{viewOrder.title}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[viewOrder.status]}`}>{viewOrder.status.replace(/_/g, " ")}</span></p></div>
                <div><Label className="text-muted-foreground">Category</Label><p>{viewOrder.equipment_category}</p></div>
                <div><Label className="text-muted-foreground">Location</Label><p>{viewOrder.location || "—"}</p></div>
                <div><Label className="text-muted-foreground">Event Date</Label><p>{viewOrder.event_date ? new Date(viewOrder.event_date).toLocaleDateString() : "—"}</p></div>
                <div><Label className="text-muted-foreground">Budget</Label><p>{viewOrder.budget || "—"}</p></div>
                <div><Label className="text-muted-foreground">Client</Label><p>{viewOrder.client_name || "—"}</p></div>
                <div><Label className="text-muted-foreground">Client Phone</Label><p>{viewOrder.client_phone || "—"}</p></div>
              </div>
              {viewOrder.equipment_details && (
                <div><Label className="text-muted-foreground">Equipment Details</Label><EquipmentDetailsDisplay details={viewOrder.equipment_details} /></div>
              )}
              )}
              {viewOrder.vendor_response && (
                <div className="p-3 bg-muted rounded">
                  <Label className="text-muted-foreground">Vendor Response</Label>
                  <p>{viewOrder.vendor_response}</p>
                  {viewOrder.vendor_quote_amount && <p className="font-bold mt-1">Quote: ₹{viewOrder.vendor_quote_amount.toLocaleString()}</p>}
                  {viewOrder.vendor_responded_at && <p className="text-xs text-muted-foreground mt-1">Responded: {new Date(viewOrder.vendor_responded_at).toLocaleString()}</p>}
                </div>
              )}
              {viewOrder.whatsapp_sent_at && (
                <p className="text-xs text-muted-foreground">WhatsApp sent: {new Date(viewOrder.whatsapp_sent_at).toLocaleString()}</p>
              )}
              {viewOrder.notes && (
                <div><Label className="text-muted-foreground">Notes</Label><p>{viewOrder.notes}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveRentalOrders;
