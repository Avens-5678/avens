import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVendorRentalOrders, useUpdateRentalOrder } from "@/hooks/useRentalOrders";
import { useAuth } from "@/hooks/useAuth";
import { EquipmentDetailsDisplay } from "@/utils/formatEquipmentDetails";
import { Loader2, Calendar, MapPin, Package, Clock, CheckCircle2, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import OrderQuoteCard from "@/components/dashboard/OrderQuoteCard";
import MilestoneTracker from "@/components/vendor/MilestoneTracker";

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  sent_to_vendors: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  quoted: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  out_for_delivery: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  delivered: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  declined: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  new: "New Order",
  sent_to_vendors: "Pending",
  quoted: "Quoted",
  accepted: "Accepted",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
};

const PENDING_STATUSES = ["new", "sent_to_vendors", "quoted", "accepted", "confirmed", "in_progress", "out_for_delivery", "delivered"];
const COMPLETED_STATUSES = ["completed", "cancelled", "declined"];

const vendorProgressStatuses = [
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
];

const OrderTracker = () => {
  const { user } = useAuth();
  const { data: orders, isLoading } = useVendorRentalOrders(user?.id);
  const { mutate: updateOrder, isPending } = useUpdateRentalOrder();

  const handleStatusChange = (id: string, status: string) => {
    updateOrder({ id, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allOrders = orders || [];
  const pendingOrders = allOrders.filter(o => PENDING_STATUSES.includes(o.status));
  const completedOrders = allOrders.filter(o => COMPLETED_STATUSES.includes(o.status));

  if (allOrders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
          <p className="text-muted-foreground">
            Orders for your listed items will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderOrderCard = (order: typeof allOrders[0], showStatusUpdate: boolean) => (
    <Card key={order.id} className={showStatusUpdate ? "border-primary/20" : "opacity-80"}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{order.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {order.client_name && <span className="font-medium">{order.client_name}</span>}
              {" · "}
              {format(new Date(order.created_at), "MMM d, yyyy")}
            </p>
          </div>
          <Badge className={statusColors[order.status] || ""}>
            {statusLabels[order.status] || order.status}
          </Badge>
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
              <span className="truncate">{order.location}</span>
            </div>
          )}
          {order.vendor_payout != null && order.vendor_payout > 0 && (
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">₹{order.vendor_payout.toLocaleString("en-IN")}</span>
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
            <p className="text-sm font-medium mb-1">Order Details:</p>
            <EquipmentDetailsDisplay details={order.equipment_details} />
          </div>
        )}

        {order.client_phone && (
          <p className="text-sm text-muted-foreground">📞 {order.client_phone}</p>
        )}

        <OrderQuoteCard orderId={order.id} />

        {showStatusUpdate && ["new", "accepted", "confirmed", "in_progress", "out_for_delivery", "delivered"].includes(order.status) && (
          <div className="flex items-center gap-3 pt-2 border-t">
            <span className="text-sm font-medium">Update Status:</span>
            <Select
              value={order.status}
              onValueChange={(value) => handleStatusChange(order.id, value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vendorProgressStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Orders</h2>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-1.5" /> Active ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingOrders.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No active orders</CardContent></Card>
          ) : pendingOrders.map(o => renderOrderCard(o, true))}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4 mt-4">
          {completedOrders.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No completed orders yet</CardContent></Card>
          ) : completedOrders.map(o => renderOrderCard(o, false))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderTracker;
