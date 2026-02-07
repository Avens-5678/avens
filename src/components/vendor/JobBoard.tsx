import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEventRequests, useUpdateEventStatus, EventRequest } from "@/hooks/useEventRequests";
import { Loader2, Calendar, MapPin, Users, Briefcase } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const JobBoard = () => {
  const { data: jobs, isLoading, error } = useEventRequests();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateEventStatus();

  const handleStatusChange = (jobId: string, newStatus: EventRequest["status"]) => {
    updateStatus({ id: jobId, status: newStatus });
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
          <p className="text-destructive">Error loading job assignments</p>
        </CardContent>
      </Card>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Jobs Assigned Yet</h3>
          <p className="text-muted-foreground">
            When you're assigned to events, they will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Assigned Jobs</h2>
        <Badge variant="outline">{jobs.length} jobs</Badge>
      </div>
      
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{job.event_type}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Assigned on {format(new Date(job.updated_at), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge className={statusColors[job.status] || ""}>
                  {statusLabels[job.status] || job.status}
                </Badge>
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
