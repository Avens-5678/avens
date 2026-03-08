import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEventRequests, useUpdateEventStatus, EventRequest } from "@/hooks/useEventRequests";
import { Loader2, Calendar, MapPin, Users, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import OrderQuoteCard from "@/components/dashboard/OrderQuoteCard";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pending Review",
  approved: "Assigned to You",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const vendorStatuses: EventRequest["status"][] = ["approved", "in_progress", "completed"];

const OrderTracker = () => {
  const { data: requests, isLoading, error } = useEventRequests();
  const { mutate: updateStatus, isPending } = useUpdateEventStatus();

  const handleStatusChange = (id: string, status: EventRequest["status"]) => {
    updateStatus({ id, status });
  };

  if (isLoading) {
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
          <p className="text-destructive">Error loading orders</p>
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Orders Assigned</h3>
          <p className="text-muted-foreground">
            You'll see orders here once they're assigned to you.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeOrders = requests.filter(r => ["approved", "in_progress"].includes(r.status));
  const pastOrders = requests.filter(r => ["completed", "cancelled"].includes(r.status));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Orders</h2>
      
      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Active Orders ({activeOrders.length})
          </h3>
          <div className="grid gap-4">
            {activeOrders.map((request) => (
              <Card key={request.id} className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.event_type}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assigned {format(new Date(request.updated_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge className={statusColors[request.status] || ""}>
                      {statusLabels[request.status] || request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {request.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(request.event_date), "MMM d, yyyy")}</span>
                      </div>
                    )}
                    {request.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{request.location}</span>
                      </div>
                    )}
                    {request.guest_count && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{request.guest_count} guests</span>
                      </div>
                    )}
                    {request.budget && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Budget:</span>
                        <span>{request.budget}</span>
                      </div>
                    )}
                  </div>

                  {request.requirements && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Requirements:</p>
                      <p className="text-sm text-muted-foreground">{request.requirements}</p>
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <span className="text-sm font-medium">Update Status:</span>
                    <Select
                      value={request.status}
                      onValueChange={(value) => handleStatusChange(request.id, value as EventRequest["status"])}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {vendorStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Orders */}
      {pastOrders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Previous Orders ({pastOrders.length})
          </h3>
          <div className="grid gap-4">
            {pastOrders.map((request) => (
              <Card key={request.id} className="opacity-80">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.event_type}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(request.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge className={statusColors[request.status] || ""}>
                      {statusLabels[request.status] || request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {request.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(request.event_date), "MMM d, yyyy")}</span>
                      </div>
                    )}
                    {request.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{request.location}</span>
                      </div>
                    )}
                    {request.guest_count && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{request.guest_count} guests</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracker;
