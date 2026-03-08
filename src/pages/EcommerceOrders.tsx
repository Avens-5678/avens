import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useRentalOrders } from "@/hooks/useRentalOrders";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Briefcase, Calendar, MapPin, Clock, ArrowLeft, LogIn, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { CheckCircle2, Circle } from "lucide-react";

const ACTIVE_STATUSES = ["new", "sent_to_vendor", "vendor_accepted", "quoted", "confirmed", "in_progress", "pending", "approved"];
const COMPLETED_STATUSES = ["completed", "delivered", "cancelled", "vendor_declined"];

const statusColors: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  approved: "bg-green-500/15 text-green-700 dark:text-green-300",
  sent_to_vendor: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  vendor_accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  vendor_declined: "bg-red-500/15 text-red-700 dark:text-red-300",
  quoted: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  confirmed: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  in_progress: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  completed: "bg-green-500/15 text-green-700 dark:text-green-300",
  delivered: "bg-green-500/15 text-green-700 dark:text-green-300",
  cancelled: "bg-red-500/15 text-red-700 dark:text-red-300",
};

const statusLabels: Record<string, string> = {
  new: "New",
  pending: "Pending",
  approved: "Approved",
  sent_to_vendor: "Sent to Vendor",
  vendor_accepted: "Vendor Accepted",
  vendor_declined: "Vendor Declined",
  quoted: "Quoted",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const EcommerceOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: rentalOrders, isLoading: rentalsLoading } = useRentalOrders();
  const { data: serviceOrders, isLoading: servicesLoading } = useServiceOrders();

  const userEmail = user?.email;

  // Filter orders by user email
  const myRentalOrders = useMemo(() => {
    if (!rentalOrders || !userEmail) return [];
    return rentalOrders.filter(
      (o) => o.client_email?.toLowerCase() === userEmail.toLowerCase() ||
             o.assigned_vendor_id === user?.id
    );
  }, [rentalOrders, userEmail, user?.id]);

  const myServiceOrders = useMemo(() => {
    if (!serviceOrders || !userEmail) return [];
    return serviceOrders.filter(
      (o) => o.client_email?.toLowerCase() === userEmail.toLowerCase()
    );
  }, [serviceOrders, userEmail]);

  // Combine and split into active/previous
  const allOrders = useMemo(() => {
    const rentals = myRentalOrders.map((o) => ({ ...o, orderType: "rental" as const }));
    const services = myServiceOrders.map((o) => ({ ...o, orderType: "service" as const }));
    return [...rentals, ...services].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [myRentalOrders, myServiceOrders]);

  const activeOrders = allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const previousOrders = allOrders.filter((o) => COMPLETED_STATUSES.includes(o.status));

  const isLoading = authLoading || rentalsLoading || servicesLoading;

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="py-12 text-center space-y-4">
              <LogIn className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground">Sign in to view your orders</h2>
              <p className="text-muted-foreground text-sm">
                You need to be logged in to see your rental and service orders.
              </p>
              <Button onClick={() => navigate("/auth")} className="mt-4">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const RENTAL_STEPS = ["new", "sent_to_vendor", "vendor_accepted", "quoted", "confirmed", "in_progress", "completed"];
  const SERVICE_STEPS = ["new", "in_progress", "quoted", "confirmed", "completed"];

  const getSteps = (orderType: string) => {
    const steps = orderType === "rental" ? RENTAL_STEPS : SERVICE_STEPS;
    return steps.map((s) => ({ key: s, label: statusLabels[s] || s }));
  };

  const getStepIndex = (status: string, orderType: string) => {
    const steps = orderType === "rental" ? RENTAL_STEPS : SERVICE_STEPS;
    const idx = steps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const StatusStepper = ({ status, orderType }: { status: string; orderType: string }) => {
    const steps = getSteps(orderType);
    const currentIdx = getStepIndex(status, orderType);
    return (
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide pt-3 pb-1">
        {steps.map((step, i) => {
          const isDone = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={step.key} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center gap-1">
                {isDone ? (
                  <CheckCircle2 className={`h-5 w-5 ${isCurrent ? "text-primary" : "text-primary/60"}`} />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
                <span className={`text-[10px] sm:text-xs whitespace-nowrap ${isCurrent ? "font-semibold text-primary" : isDone ? "text-foreground/70" : "text-muted-foreground/50"}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 sm:w-10 h-0.5 mx-1 ${i < currentIdx ? "bg-primary/60" : "bg-muted-foreground/20"}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const OrderCard = ({ order, showStepper }: { order: (typeof allOrders)[0]; showStepper?: boolean }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {order.orderType === "rental" ? (
                <Package className="h-4 w-4 text-primary flex-shrink-0" />
              ) : (
                <Briefcase className="h-4 w-4 text-accent flex-shrink-0" />
              )}
              <h3 className="font-semibold text-foreground truncate">{order.title}</h3>
              <Badge variant="outline" className="text-xs">
                {order.orderType === "rental" ? "Rental" : "Service"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {order.event_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(order.event_date), "dd MMM yyyy")}
                </span>
              )}
              {order.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {order.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(order.created_at), "dd MMM yyyy")}
              </span>
              {order.budget && (
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {order.budget}
                </span>
              )}
            </div>

            {"equipment_category" in order && order.equipment_category && (
              <p className="text-xs text-muted-foreground">
                Category: {order.equipment_category}
              </p>
            )}
            {"service_type" in order && order.service_type && (
              <p className="text-xs text-muted-foreground">
                Type: {order.service_type}
              </p>
            )}
          </div>

          <Badge className={`flex-shrink-0 ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
            {statusLabels[order.status] || order.status}
          </Badge>
        </div>

        {showStepper && (
          <StatusStepper status={order.status} orderType={order.orderType} />
        )}
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-16">
      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <section className="bg-gradient-to-br from-primary/90 via-primary to-primary/80">
          <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-14">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/ecommerce")}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground">My Orders</h1>
            <p className="text-primary-foreground/80 mt-2">
              Track your rental and service orders in one place.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-6 sm:px-8 lg:px-12 py-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : (
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="active" className="gap-2">
                  Active
                  {activeOrders.length > 0 && (
                    <span className="flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-xs font-medium px-1.5">
                      {activeOrders.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="previous" className="gap-2">
                  Previous
                  {previousOrders.length > 0 && (
                    <span className="flex items-center justify-center h-5 min-w-[20px] rounded-full bg-muted-foreground/30 text-foreground text-xs font-medium px-1.5">
                      {previousOrders.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-3">
                {activeOrders.length === 0 ? (
                  <EmptyState message="No active orders right now." />
                ) : (
                  activeOrders.map((order) => <OrderCard key={order.id} order={order} showStepper />)
                )}
              </TabsContent>

              <TabsContent value="previous" className="space-y-3">
                {previousOrders.length === 0 ? (
                  <EmptyState message="No previous orders yet." />
                ) : (
                  previousOrders.map((order) => <OrderCard key={order.id} order={order} />)
                )}
              </TabsContent>
            </Tabs>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default EcommerceOrders;
