import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEventRequests } from "@/hooks/useEventRequests";
import { Loader2, Calendar, MapPin, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import VendorCard from "./VendorCard";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pending Review",
  approved: "Vendor Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const EventTracker = () => {
  const { data: requests, isLoading, error } = useEventRequests();

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
          <p className="text-destructive">Error loading event requests</p>
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Event Requests Yet</h3>
          <p className="text-muted-foreground">
            Submit your first event request to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Event Requests</h2>
      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{request.event_type}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submitted {format(new Date(request.created_at), "MMM d, yyyy")}
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

              {/* Show vendor info if assigned */}
              {request.assigned_vendor_id && (
                <VendorCard vendorId={request.assigned_vendor_id} />
              )}

              {/* Pending message */}
              {!request.assigned_vendor_id && request.status === "pending" && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-md">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-700">
                      Your request is under review. We'll assign a vendor shortly.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventTracker;
