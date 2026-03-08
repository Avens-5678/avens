import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventRequests, useAssignVendor, useVendors, EventRequest } from "@/hooks/useEventRequests";
import { useUpdateEventStatus } from "@/hooks/useEventRequests";
import { useRentalOrders, useUpdateRentalOrder } from "@/hooks/useRentalOrders";
import { useServiceOrders, useUpdateServiceOrder } from "@/hooks/useServiceOrders";
import { Loader2, Calendar, Users as UsersIcon, MapPin, ClipboardList, Package, Briefcase } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  new: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  sent_to_vendor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  vendor_accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  vendor_declined: "bg-red-500/10 text-red-600 border-red-500/20",
  quoted: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  new: "New",
  sent_to_vendor: "Sent to Vendor",
  vendor_accepted: "Vendor Accepted",
  vendor_declined: "Vendor Declined",
  quoted: "Quoted",
  confirmed: "Confirmed",
  delivered: "Delivered",
};

const allStatuses: EventRequest["status"][] = ["pending", "approved", "in_progress", "completed", "cancelled"];
const rentalStatuses = ["new", "sent_to_vendor", "vendor_accepted", "vendor_declined", "quoted", "confirmed", "in_progress", "completed", "delivered", "cancelled"];

const serviceStatuses = ["new", "in_progress", "quoted", "confirmed", "completed", "cancelled"];

const EventCenter = () => {
  const { data: requests, isLoading: requestsLoading } = useEventRequests();
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { mutate: assignVendor, isPending: isAssigning } = useAssignVendor();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateEventStatus();
  const { data: rentalOrders, isLoading: rentalsLoading } = useRentalOrders();
  const { mutate: updateRentalOrder, isPending: isUpdatingRental } = useUpdateRentalOrder();
  const { data: serviceOrders, isLoading: servicesLoading } = useServiceOrders();
  const { mutate: updateServiceOrder, isPending: isUpdatingService } = useUpdateServiceOrder();
  const [selectedVendor, setSelectedVendor] = useState<Record<string, string>>({});

  const handleAssign = (requestId: string) => {
    const vendorId = selectedVendor[requestId];
    if (vendorId) {
      assignVendor({ requestId, vendorId });
    }
  };

  const handleStatusChange = (requestId: string, status: EventRequest["status"]) => {
    updateStatus({ id: requestId, status });
  };

  const handleRentalStatusChange = (orderId: string, status: string) => {
    updateRentalOrder({ id: orderId, status });
  };
  const handleServiceStatusChange = (orderId: string, status: string) => {
    updateServiceOrder({ id: orderId, status });
  };

  if (requestsLoading || vendorsLoading || rentalsLoading || servicesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const activeRequests = requests?.filter(r => ["approved", "in_progress"].includes(r.status)) || [];
  const completedRequests = requests?.filter(r => r.status === "completed") || [];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rental Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{rentalOrders?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Service Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{serviceOrders?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Event Requests and Rental Orders */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Event Requests ({requests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="rentals">
            <Package className="h-4 w-4 mr-2" />
            Rental Orders ({rentalOrders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="services">
            <Briefcase className="h-4 w-4 mr-2" />
            Service Orders ({serviceOrders?.length || 0})
          </TabsTrigger>
        </TabsList>
        {/* Event Requests Tab */}
        <TabsContent value="events" className="space-y-6">
          {/* Pending Requests - Priority Section */}
          {pendingRequests.length > 0 && (
            <Card className="border-yellow-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-yellow-600" />
                  Pending Review ({pendingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Assign Vendor</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.event_type}</TableCell>
                          <TableCell>
                            {request.event_date 
                              ? format(new Date(request.event_date), "MMM d, yyyy")
                              : "-"
                            }
                          </TableCell>
                          <TableCell>{request.location || "-"}</TableCell>
                          <TableCell>{request.guest_count || "-"}</TableCell>
                          <TableCell>{request.budget || "-"}</TableCell>
                          <TableCell>{format(new Date(request.created_at), "MMM d")}</TableCell>
                          <TableCell>
                            <Select
                              value={selectedVendor[request.id] || ""}
                              onValueChange={(value) => 
                                setSelectedVendor(prev => ({ ...prev, [request.id]: value }))
                              }
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select vendor" />
                              </SelectTrigger>
                              <SelectContent>
                                {vendors?.map((vendor) => (
                                  <SelectItem key={vendor.user_id} value={vendor.user_id}>
                                    {vendor.full_name || vendor.email}
                                  </SelectItem>
                                ))}
                                {(!vendors || vendors.length === 0) && (
                                  <SelectItem value="none" disabled>
                                    No vendors available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleAssign(request.id)}
                              disabled={!selectedVendor[request.id] || isAssigning}
                            >
                              {isAssigning && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                              Assign
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Event Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Event Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {!requests || requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No event requests yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Update Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => {
                        const assignedVendor = vendors?.find(v => v.user_id === request.assigned_vendor_id);
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <Badge className={statusColors[request.status]}>
                                {statusLabels[request.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{request.event_type}</TableCell>
                            <TableCell>
                              {request.event_date 
                                ? format(new Date(request.event_date), "MMM d, yyyy")
                                : "-"
                              }
                            </TableCell>
                            <TableCell>{request.location || "-"}</TableCell>
                            <TableCell>{request.guest_count || "-"}</TableCell>
                            <TableCell>
                              {assignedVendor 
                                ? assignedVendor.full_name || assignedVendor.email
                                : <span className="text-muted-foreground">Unassigned</span>
                              }
                            </TableCell>
                            <TableCell>{format(new Date(request.created_at), "MMM d, yyyy")}</TableCell>
                            <TableCell>
                              <Select
                                value={request.status}
                                onValueChange={(value) => handleStatusChange(request.id, value as EventRequest["status"])}
                                disabled={isUpdatingStatus}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {allStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {statusLabels[status]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rental Orders Tab */}
        <TabsContent value="rentals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Rental Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {!rentalOrders || rentalOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rental orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Update Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rentalOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Badge className={statusColors[order.status] || "bg-muted text-muted-foreground"}>
                              {statusLabels[order.status] || order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">{order.title}</TableCell>
                          <TableCell>{order.equipment_category}</TableCell>
                          <TableCell>{order.client_name || "-"}</TableCell>
                          <TableCell>{order.client_phone || "-"}</TableCell>
                          <TableCell>{order.location || "-"}</TableCell>
                          <TableCell>
                            {order.event_date
                              ? format(new Date(order.event_date), "MMM d, yyyy")
                              : "-"
                            }
                          </TableCell>
                          <TableCell>{order.budget || "-"}</TableCell>
                          <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleRentalStatusChange(order.id, value)}
                              disabled={isUpdatingRental}
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {rentalStatuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {statusLabels[status] || status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventCenter;
