import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventRequests } from "@/hooks/useEventRequests";
import { useClientRentalOrders } from "@/hooks/useRentalOrders";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Calendar, MapPin, Users, Package, Clock, Truck, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import OrderQuoteCard from "@/components/dashboard/OrderQuoteCard";
import { EquipmentDetailsDisplay } from "@/utils/formatEquipmentDetails";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  sent_to_vendors: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  quoted: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  declined: "bg-red-500/10 text-red-600 border-red-500/20",
  out_for_delivery: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  delivered: "bg-teal-500/10 text-teal-600 border-teal-500/20",
};

const PENDING_STATUSES = ["new", "sent_to_vendors", "quoted", "accepted", "in_progress", "out_for_delivery", "delivered"];
const COMPLETED_STATUSES = ["completed", "confirmed", "cancelled", "declined"];

const PastOrders = () => {
  const { user } = useAuth();
  const { data: serviceRequests, isLoading: loadingServices } = useEventRequests();
  const { data: rentalOrders, isLoading: loadingRentals } = useClientRentalOrders(user?.id);
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get("order");

  // Scroll to + flash highlight on the deep-linked order row
  useEffect(() => {
    if (!highlightOrderId) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`order-${highlightOrderId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => el.classList.remove("ring-2", "ring-primary", "ring-offset-2"), 2500);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [highlightOrderId, rentalOrders]);

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
  const pendingRentals = allRentalOrders.filter(o => PENDING_STATUSES.includes(o.status));
  const completedRentals = allRentalOrders.filter(o => COMPLETED_STATUSES.includes(o.status));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Orders</h2>
      <p className="text-muted-foreground">View your assigned event requests and rental orders.</p>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({allRentalOrders.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-1" />
            Pending ({pendingRentals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedRentals.length})
          </TabsTrigger>
          <TabsTrigger value="services">
            Events ({allServiceRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* All Rental Orders */}
        <TabsContent value="all" className="space-y-4 mt-4">
          {allRentalOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground">Browse the marketplace and place your first booking.</p>
              </CardContent>
            </Card>
          ) : (
            allRentalOrders.map((order) => (
              <RentalOrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>

        {/* Pending Rental Orders */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingRentals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Orders</h3>
                <p className="text-muted-foreground">All caught up! No active rental orders.</p>
              </CardContent>
            </Card>
          ) : (
            pendingRentals.map((order) => (
              <RentalOrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>

        {/* Completed Rental Orders */}
        <TabsContent value="completed" className="space-y-4 mt-4">
          {completedRentals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Orders</h3>
                <p className="text-muted-foreground">Completed and cancelled orders will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            completedRentals.map((order) => (
              <RentalOrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>

        {/* Event Requests */}
        <TabsContent value="services" className="space-y-4 mt-4">
          {allServiceRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Event Requests</h3>
                <p className="text-muted-foreground">You haven't been assigned any event requests yet.</p>
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
      </Tabs>
    </div>
  );
};

const RentalOrderCard = ({ order }: { order: any }) => {
  const navigate = useNavigate();
  const [deliveryId, setDeliveryId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await (supabase.from as any)("delivery_orders")
        .select("id").eq("order_id", order.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (active) setDeliveryId(data?.id || null);
    })();
    return () => { active = false; };
  }, [order.id]);

  return (
  <Card id={`order-${order.id}`} className="transition-all duration-500">
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
          <EquipmentDetailsDisplay details={order.equipment_details} />
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {deliveryId && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => navigate(`/track-delivery/${deliveryId}`)}
          >
            <Truck className="h-3.5 w-3.5" />
            Track Order
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => navigate(`/client/dashboard?tab=inbox`)}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Open Chat
        </Button>
      </div>
      <div className="mt-3">
        <OrderQuoteCard orderId={order.id} />
      </div>
    </CardContent>
  </Card>
  );
};

export default PastOrders;
