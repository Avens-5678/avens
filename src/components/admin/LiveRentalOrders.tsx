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
import {
  Plus, Send, Search, MapPin, Calendar, Package, Phone, Trash2, Eye,
  CheckCircle, Clock, MessageSquare, Filter, X, Users,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  sent_to_vendors: "bg-yellow-100 text-yellow-800",
  quoted: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
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

  const [newOrder, setNewOrder] = useState<RentalOrderInsert>({
    title: "", equipment_category: "General", equipment_details: "",
    location: "", event_date: "", budget: "", client_name: "",
    client_phone: "", client_email: "", notes: "",
  });

  const { data: orders, isLoading } = useRentalOrders({
    status: statusFilter, category: categoryFilter, location: locationSearch,
  });

  const createOrder = useCreateRentalOrder();
  const updateOrder = useUpdateRentalOrder();
  const deleteOrder = useDeleteRentalOrder();
  const sendToVendor = useSendToVendor();

  // Fetch matching vendors when send dialog opens
  const { data: matchingVendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["matching_vendors", selectedOrder?.equipment_category, selectedOrder?.location],
    queryFn: async () => {
      if (!selectedOrder) return [];

      // Get all vendor user IDs
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "vendor");
      if (!roles || roles.length === 0) return [];

      const vendorIds = roles.map((r) => r.user_id);

      // Get vendor profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", vendorIds);

      // Get vendor inventory matching category
      const { data: inventory } = await supabase
        .from("vendor_inventory")
        .select("*")
        .eq("is_available", true);

      // Filter vendors who have matching items AND matching city
      const results = (profiles || []).map((profile: any) => {
        const vendorItems = (inventory || []).filter(
          (i) => i.vendor_id === profile.user_id
        );
        const matchingItems = vendorItems.filter(
          (i) => i.category === selectedOrder.equipment_category || selectedOrder.equipment_category === "General"
        );
        const cityMatch = !selectedOrder.location ||
          ((profile as any).city || "").toLowerCase().includes(selectedOrder.location.toLowerCase());

        return {
          ...profile,
          matchingItems,
          totalItems: vendorItems.length,
          cityMatch,
          hasMatchingItems: matchingItems.length > 0,
        };
      });

      // Sort: matching items + city first, then matching items, then city, then rest
      return results.sort((a: any, b: any) => {
        const scoreA = (a.hasMatchingItems ? 2 : 0) + (a.cityMatch ? 1 : 0);
        const scoreB = (b.hasMatchingItems ? 2 : 0) + (b.cityMatch ? 1 : 0);
        return scoreB - scoreA;
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
    setIsSendOpen(true);
  };

  const stats = {
    total: orders?.length || 0,
    new: orders?.filter((o) => o.status === "new").length || 0,
    sent: orders?.filter((o) => o.status === "sent_to_vendors").length || 0,
    quoted: orders?.filter((o) => o.status === "quoted").length || 0,
    accepted: orders?.filter((o) => o.status === "accepted").length || 0,
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Package },
          { label: "New", value: stats.new, icon: Clock },
          { label: "Sent", value: stats.sent, icon: Send },
          { label: "Quoted", value: stats.quoted, icon: MessageSquare },
          { label: "Accepted", value: stats.accepted, icon: CheckCircle },
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
                    {order.vendor_response && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <strong>Vendor Response:</strong> {order.vendor_response}
                        {order.vendor_quote_amount && <span className="ml-2 font-bold">₹{order.vendor_quote_amount.toLocaleString()}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setViewOrder(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(order.status === "new" || order.status === "sent_to_vendors") && (
                      <Button size="sm" onClick={() => openSendDialog(order)} className="bg-green-600 hover:bg-green-700 text-white">
                        <Send className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Send via WhatsApp</span>
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

      {/* Send to Vendor Dialog - with Search */}
      <Dialog open={isSendOpen} onOpenChange={(open) => { setIsSendOpen(open); if (!open) { setSelectedOrder(null); setSelectedOrderId(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find & Send to Vendor
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

          {/* Matching Vendors */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Matching Vendors
              {matchingVendors && <Badge variant="secondary">{matchingVendors.length} found</Badge>}
            </h4>

            {vendorsLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Searching vendors...</p>
            ) : !matchingVendors?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">No vendors found. Enter details manually below.</p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {matchingVendors.map((vendor: any) => (
                  <div
                    key={vendor.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      vendorPhone === vendor.phone ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => selectVendorFromList(vendor)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{vendor.full_name || vendor.company_name || "Unnamed"}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {vendor.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{vendor.phone}</span>}
                          {(vendor as any).city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{(vendor as any).city}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {vendor.hasMatchingItems && (
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                            {vendor.matchingItems.length} matching items
                          </Badge>
                        )}
                        {vendor.cityMatch && selectedOrder?.location && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            <MapPin className="h-3 w-3 mr-1" />City match
                          </Badge>
                        )}
                        {!vendor.hasMatchingItems && !vendor.cityMatch && (
                          <Badge variant="outline" className="text-xs">No match</Badge>
                        )}
                      </div>
                    </div>
                    {vendor.matchingItems.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {vendor.matchingItems.slice(0, 3).map((item: any) => (
                          <Badge key={item.id} variant="outline" className="text-xs">
                            {item.name} (Qty: {item.quantity})
                          </Badge>
                        ))}
                        {vendor.matchingItems.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{vendor.matchingItems.length - 3} more</Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual entry */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold text-sm">Send Details</h4>
            <div>
              <Label>Vendor WhatsApp Number *</Label>
              <Input value={vendorPhone} onChange={(e) => setVendorPhone(e.target.value)} placeholder="919876543210 (with country code)" />
              <p className="text-xs text-muted-foreground mt-1">Include country code without + (e.g. 919876543210)</p>
            </div>
            <div>
              <Label>Vendor Name</Label>
              <Input value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Optional" />
            </div>
            <Button onClick={handleSendToVendor} disabled={sendToVendor.isPending || !vendorPhone} className="w-full bg-green-600 hover:bg-green-700">
              <Phone className="mr-2 h-4 w-4" />
              {sendToVendor.isPending ? "Sending..." : "Send via WhatsApp"}
            </Button>
          </div>
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
                <div><Label className="text-muted-foreground">Equipment Details</Label><p className="whitespace-pre-wrap">{viewOrder.equipment_details}</p></div>
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
