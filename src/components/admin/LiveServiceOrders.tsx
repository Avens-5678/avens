import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useServiceOrders,
  useCreateServiceOrder,
  useUpdateServiceOrder,
  useDeleteServiceOrder,
  type ServiceOrderInsert,
} from "@/hooks/useServiceOrders";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Search, MapPin, Calendar, Package, Phone, Trash2, Eye,
  CheckCircle, Clock, Filter, X, FileText,
} from "lucide-react";
import QuoteMaker from "./QuoteMaker";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  quoted: "bg-purple-100 text-purple-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const SERVICE_TYPES = [
  "General", "Wedding", "Corporate Event", "Conference", "Exhibition",
  "Product Launch", "Concert", "Sports Event", "Government Event", "Private Party",
];

const LiveServiceOrders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationSearch, setLocationSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [quoteMakerOrder, setQuoteMakerOrder] = useState<string | null>(null);

  const [newOrder, setNewOrder] = useState<ServiceOrderInsert>({
    title: "", service_type: "General", service_details: "",
    location: "", event_date: "", budget: "", client_name: "",
    client_phone: "", client_email: "", notes: "",
  });

  const { data: orders, isLoading } = useServiceOrders({
    status: statusFilter, service_type: typeFilter, location: locationSearch,
  });

  const createOrder = useCreateServiceOrder();
  const updateOrder = useUpdateServiceOrder();
  const deleteOrder = useDeleteServiceOrder();
  const { toast } = useToast();

  const handleCreate = () => {
    if (!newOrder.title) return;
    createOrder.mutate(newOrder, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewOrder({ title: "", service_type: "General", service_details: "", location: "", event_date: "", budget: "", client_name: "", client_phone: "", client_email: "", notes: "" });
      },
    });
  };

  const handleSendConfirmation = async (order: any) => {
    if (!order.client_phone) {
      toast({ title: "No phone number", description: "Client phone is required to send confirmation.", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("wati-vendor-reminder", {
        body: { action: "send_reminder", vendor_ids: [] },
      });

      // For now, open WhatsApp directly with confirmation message
      const phone = order.client_phone.replace(/[^0-9]/g, "");
      const message = `🎪 *Evnting - Service Request Confirmation*\n\nHi ${order.client_name || "there"},\n\nThank you for your service request!\n\n📋 *Request:* ${order.title}\n📍 *Location:* ${order.location || "TBD"}\n📅 *Date:* ${order.event_date ? new Date(order.event_date).toLocaleDateString() : "TBD"}\n\nOur team has received your request and will get back to you shortly with a detailed quote.\n\nBest regards,\nTeam Evnting`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

      updateOrder.mutate({ id: order.id, status: "in_progress" });
      toast({ title: "Confirmation sent", description: "WhatsApp confirmation opened." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const stats = {
    total: orders?.length || 0,
    new: orders?.filter(o => o.status === "new").length || 0,
    in_progress: orders?.filter(o => o.status === "in_progress").length || 0,
    quoted: orders?.filter(o => o.status === "quoted").length || 0,
    confirmed: orders?.filter(o => o.status === "confirmed").length || 0,
  };

  // If quote maker is open, show it
  if (quoteMakerOrder) {
    return (
      <QuoteMaker
        prefillOrderId={quoteMakerOrder}
        prefillSourceType="service_order"
        onClose={() => setQuoteMakerOrder(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
         <h2 className="text-2xl font-bold">Service Requests</h2>
          <p className="text-muted-foreground text-sm">Manage service requests & generate quotes</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Service Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Service Order</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={newOrder.title} onChange={e => setNewOrder({ ...newOrder, title: e.target.value })} placeholder="e.g. Wedding Reception - 500 Guests" /></div>
              <div>
                <Label>Service Type</Label>
                <Select value={newOrder.service_type} onValueChange={v => setNewOrder({ ...newOrder, service_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SERVICE_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Service Details</Label><Textarea value={newOrder.service_details} onChange={e => setNewOrder({ ...newOrder, service_details: e.target.value })} placeholder="Requirements, preferences..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Location</Label><Input value={newOrder.location} onChange={e => setNewOrder({ ...newOrder, location: e.target.value })} /></div>
                <div><Label>Event Date</Label><Input type="date" value={newOrder.event_date} onChange={e => setNewOrder({ ...newOrder, event_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Budget</Label><Input value={newOrder.budget} onChange={e => setNewOrder({ ...newOrder, budget: e.target.value })} placeholder="₹5,00,000" /></div>
                <div><Label>Guest Count</Label><Input type="number" value={newOrder.guest_count || ""} onChange={e => setNewOrder({ ...newOrder, guest_count: parseInt(e.target.value) || undefined })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Client Name</Label><Input value={newOrder.client_name} onChange={e => setNewOrder({ ...newOrder, client_name: e.target.value })} /></div>
                <div><Label>Client Phone</Label><Input value={newOrder.client_phone} onChange={e => setNewOrder({ ...newOrder, client_phone: e.target.value })} /></div>
              </div>
              <div><Label>Client Email</Label><Input value={newOrder.client_email} onChange={e => setNewOrder({ ...newOrder, client_email: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={newOrder.notes} onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })} /></div>
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
          { label: "In Progress", value: stats.in_progress, icon: Calendar },
          { label: "Quoted", value: stats.quoted, icon: FileText },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle },
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
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs mb-1 block"><Package className="inline h-3 w-3 mr-1" />Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {SERVICE_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs mb-1 block"><MapPin className="inline h-3 w-3 mr-1" />Location</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={locationSearch} onChange={e => setLocationSearch(e.target.value)} placeholder="Search by city..." className="pl-9" />
              </div>
            </div>
            {(statusFilter !== "all" || typeFilter !== "all" || locationSearch) && (
              <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("all"); setTypeFilter("all"); setLocationSearch(""); }}>
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
            <h3 className="text-lg font-medium">No service orders found</h3>
            <p className="text-muted-foreground text-sm">Create your first service order or adjust filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
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
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" />{order.service_type}</span>
                      {order.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{order.location}</span>}
                      {order.event_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(order.event_date).toLocaleDateString()}</span>}
                      {order.budget && <span>💰 {order.budget}</span>}
                      {order.client_name && <span>👤 {order.client_name}</span>}
                      {order.guest_count && <span>👥 {order.guest_count} guests</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setViewOrder(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => setQuoteMakerOrder(order.id)} variant="default">
                      <FileText className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Create Quote</span>
                    </Button>
                    {order.client_phone && (
                      <Button size="sm" variant="outline" onClick={() => handleSendConfirmation(order)}>
                        <Phone className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Send Confirmation</span>
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

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Service Order Details</DialogTitle></DialogHeader>
          {viewOrder && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-muted-foreground">Title</Label><p className="font-medium">{viewOrder.title}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[viewOrder.status]}`}>{viewOrder.status.replace(/_/g, " ")}</span></p></div>
                <div><Label className="text-muted-foreground">Type</Label><p>{viewOrder.service_type}</p></div>
                <div><Label className="text-muted-foreground">Location</Label><p>{viewOrder.location || "—"}</p></div>
                <div><Label className="text-muted-foreground">Event Date</Label><p>{viewOrder.event_date ? new Date(viewOrder.event_date).toLocaleDateString() : "—"}</p></div>
                <div><Label className="text-muted-foreground">Budget</Label><p>{viewOrder.budget || "—"}</p></div>
                <div><Label className="text-muted-foreground">Client</Label><p>{viewOrder.client_name || "—"}</p></div>
                <div><Label className="text-muted-foreground">Phone</Label><p>{viewOrder.client_phone || "—"}</p></div>
                <div><Label className="text-muted-foreground">Guest Count</Label><p>{viewOrder.guest_count || "—"}</p></div>
                <div><Label className="text-muted-foreground">Email</Label><p>{viewOrder.client_email || "—"}</p></div>
              </div>
              {viewOrder.service_details && (
                <div><Label className="text-muted-foreground">Service Details</Label><p className="whitespace-pre-wrap">{viewOrder.service_details}</p></div>
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

export default LiveServiceOrders;
