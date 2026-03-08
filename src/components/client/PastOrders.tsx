import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventRequests } from "@/hooks/useEventRequests";
import { useRentalOrders } from "@/hooks/useRentalOrders";
import { Loader2, Calendar, MapPin, Users, Package, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import OrderQuoteCard from "@/components/dashboard/OrderQuoteCard";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  quoted: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  declined: "bg-red-500/10 text-red-600 border-red-500/20",
};

const PastOrders = () => {
  const { data: serviceRequests, isLoading: loadingServices } = useEventRequests();
  const { data: rentalOrders, isLoading: loadingRentals } = useRentalOrders();

  const isLoading = loadingServices || loadingRentals;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allServiceRequests = serviceRequests || [];
  const allRentalOrders = rentalOrders || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Past Orders</h2>
      <p className="text-muted-foreground">View all your event requests and rental orders in one place.</p>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">
            Event Requests ({allServiceRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rentals">
            Rental Orders ({allRentalOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4 mt-4">
          {allServiceRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Event Requests</h3>
                <p className="text-muted-foreground">You haven't submitted any event requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            allServiceRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.event_type}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(request.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge className={statusColors[request.status] || ""}>
                      {request.status.replace(/_/g, " ")}
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
                    {request.budget && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Budget:</span>
                        <span>{request.budget}</span>
                      </div>
                    )}
                  </div>
                  {request.requirements && (
                    <div className="bg-muted/50 p-3 rounded-md mt-3">
                      <p className="text-sm text-muted-foreground">{request.requirements}</p>
                    </div>
                  )}
                  <div className="mt-3">
                    <OrderQuoteCard orderId={request.id} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rentals" className="space-y-4 mt-4">
          {allRentalOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rental Orders</h3>
                <p className="text-muted-foreground">You haven't placed any rental orders yet.</p>
              </CardContent>
            </Card>
          ) : (
            allRentalOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge className={statusColors[order.status] || ""}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{order.equipment_category}</span>
                    </div>
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
                    {order.budget && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Budget:</span>
                        <span>{order.budget}</span>
                      </div>
                    )}
                  </div>
                  {order.equipment_details && (
                    <div className="bg-muted/50 p-3 rounded-md mt-3">
                      <p className="text-sm text-muted-foreground">{order.equipment_details}</p>
                    </div>
                  )}
                  <div className="mt-3">
                    <OrderQuoteCard orderId={order.id} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PastOrders;
