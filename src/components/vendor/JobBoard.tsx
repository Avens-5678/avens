import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquipmentDetailsDisplay } from "@/utils/formatEquipmentDetails";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEventRequests, useUpdateEventStatus, EventRequest } from "@/hooks/useEventRequests";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, MapPin, Users, Briefcase, Bell, Package, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  sent_to_vendors: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  quoted: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  declined: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  new: "New",
  sent_to_vendors: "Sent",
  quoted: "Quoted",
  accepted: "Accepted",
  confirmed: "Confirmed",
  declined: "Declined",
};

const generateGoogleCalendarUrl = (title: string, date: string | null, location: string | null) => {
  const eventTitle = encodeURIComponent(title);
  const eventLocation = encodeURIComponent(location || "");
  let dateStr = "";
  if (date) {
    const d = new Date(date);
    const start = d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const end = new Date(d.getTime() + 3600000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    dateStr = `${start}/${end}`;
  } else {
    const d = new Date();
    const start = d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const end = new Date(d.getTime() + 3600000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    dateStr = `${start}/${end}`;
  }
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${dateStr}&location=${eventLocation}`;
};

const JobBoard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: jobs, isLoading, error } = useEventRequests();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateEventStatus();
  const [respondingOrder, setRespondingOrder] = useState<string | null>(null);
  const [declineNote, setDeclineNote] = useState("");

  const respondToOrder = useMutation({
    mutationFn: async ({ orderId, action, note }: { orderId: string; action: "accepted" | "declined"; note?: string }) => {
      const { error } = await supabase
        .from("rental_orders")
        .update({
          status: action,
          vendor_response: note || (action === "accepted" ? "Accepted" : "Declined"),
          vendor_responded_at: new Date().toISOString(),
        })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor_rental_orders"] });
      toast({
        title: variables.action === "accepted" ? "Order Accepted" : "Order Declined",
        description: variables.action === "accepted"
          ? "The Evnting team will be in touch to finalize details."
          : "The order has been declined.",
      });
      setRespondingOrder(null);
      setDeclineNote("");
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Fetch rental orders assigned to this vendor
  const { data: rentalOrders, isLoading: rentalLoading } = useQuery({
    queryKey: ["vendor_rental_orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_orders")
        .select("*")
        .eq("assigned_vendor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleStatusChange = (jobId: string, newStatus: EventRequest["status"]) => {
    updateStatus({ id: jobId, status: newStatus });
  };

  const loading = isLoading || rentalLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Error loading job assignments</p>
        </CardContent>
      </Card>
    );
  }

  const hasJobs = (jobs && jobs.length > 0) || (rentalOrders && rentalOrders.length > 0);

  if (!hasJobs) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Jobs Assigned Yet</h3>
          <p className="text-muted-foreground">
            When you're assigned to events or rental orders, they will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalCount = (jobs?.length || 0) + (rentalOrders?.length || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Assigned Jobs</h2>
        <Badge variant="outline">{totalCount} jobs</Badge>
      </div>
      
      <div className="grid gap-4">
        {/* Rental Orders */}
        {rentalOrders && rentalOrders.length > 0 && rentalOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg">{order.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rental Order • {format(new Date(order.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[order.status] || ""}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = generateGoogleCalendarUrl(
                        order.title,
                        order.event_date,
                        order.location
                      );
                      window.open(url, "_blank");
                    }}
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Reminder</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {order.event_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(order.event_date), "MMM d, yyyy")}</span>
                  </div>
                )}
                {order.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{order.location}</span>
                  </div>
                )}
                {order.equipment_category && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{order.equipment_category}</span>
                  </div>
                )}
                {order.budget && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Budget:</span>
                    <span>{order.budget}</span>
                  </div>
                )}
              </div>

              {order.equipment_details && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Equipment Details:</p>
                  <EquipmentDetailsDisplay details={order.equipment_details} />
                </div>
              )}

              {/* Accept / Decline Controls */}
              {order.status === "sent_to_vendors" && (
                <div className="border-t pt-3 space-y-3">
                  {respondingOrder === order.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={declineNote}
                        onChange={(e) => setDeclineNote(e.target.value)}
                        placeholder="Reason for declining (optional)..."
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={respondToOrder.isPending}
                          onClick={() => respondToOrder.mutate({ orderId: order.id, action: "declined", note: declineNote })}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {respondToOrder.isPending ? "Declining..." : "Confirm Decline"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setRespondingOrder(null); setDeclineNote(""); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={respondToOrder.isPending}
                        onClick={() => respondToOrder.mutate({ orderId: order.id, action: "accepted" })}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setRespondingOrder(order.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />Decline
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Show response if already responded */}
              {(order.status === "accepted" || order.status === "declined") && (
                <div className={`border-t pt-3 p-3 rounded-md text-sm ${order.status === "accepted" ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
                  <p className="font-medium flex items-center gap-1">
                    {order.status === "accepted" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                    {order.status === "accepted" ? "You accepted this order" : "You declined this order"}
                  </p>
                  {order.vendor_response && <p className="text-muted-foreground mt-1">{order.vendor_response}</p>}
                </div>
              )}

              {/* Vendor Status Progression */}
              {["accepted", "confirmed", "in_progress", "out_for_delivery", "delivered"].includes(order.status) && (
                <div className="flex items-center gap-4 pt-2 border-t">
                  <span className="text-sm font-medium">Update Status:</span>
                  <Select
                    value={order.status}
                    onValueChange={(value) => {
                      respondToOrder.mutate({ orderId: order.id, action: value as any, note: value });
                    }}
                    disabled={respondToOrder.isPending}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Event Requests */}
        {jobs && jobs.map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{job.event_type}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Event Request • {format(new Date(job.updated_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[job.status] || ""}>
                    {statusLabels[job.status] || job.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = generateGoogleCalendarUrl(
                        job.event_type,
                        job.event_date,
                        job.location
                      );
                      window.open(url, "_blank");
                    }}
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Reminder</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {job.event_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(job.event_date), "MMM d, yyyy")}</span>
                  </div>
                )}
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.guest_count && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{job.guest_count} guests</span>
                  </div>
                )}
                {job.budget && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Budget:</span>
                    <span>{job.budget}</span>
                  </div>
                )}
              </div>

              {job.requirements && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Requirements:</p>
                  <p className="text-sm text-muted-foreground">{job.requirements}</p>
                </div>
              )}

              {/* Status Update Controls */}
              {job.status !== "completed" && job.status !== "cancelled" && (
                <div className="flex items-center gap-4 pt-2 border-t">
                  <span className="text-sm font-medium">Update Status:</span>
                  <Select
                    value={job.status}
                    onValueChange={(value) => handleStatusChange(job.id, value as EventRequest["status"])}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobBoard;
