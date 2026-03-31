import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import EcommerceHeader from "@/components/ecommerce/EcommerceHeader";
import { useAuth } from "@/hooks/useAuth";
import { useRentalOrders } from "@/hooks/useRentalOrders";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package, Briefcase, Calendar, MapPin, Clock, ArrowLeft, LogIn,
  IndianRupee, CheckCircle2, Circle, ChevronRight, ShoppingBag, Truck,
} from "lucide-react";
import { format } from "date-fns";

const ACTIVE_STATUSES = ["new", "sent_to_vendors", "accepted", "quoted", "confirmed", "in_progress", "pending", "approved"];
const COMPLETED_STATUSES = ["completed", "delivered", "cancelled", "declined"];

const statusColors: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  approved: "bg-green-500/15 text-green-700 dark:text-green-300",
  sent_to_vendors: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  declined: "bg-red-500/15 text-red-700 dark:text-red-300",
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
  sent_to_vendors: "Sent to Vendor",
  accepted: "Vendor Accepted",
  declined: "Vendor Declined",
  quoted: "Quoted",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const RENTAL_STEPS = ["new", "sent_to_vendors", "accepted", "quoted", "confirmed", "in_progress", "completed"];
const SERVICE_STEPS = ["new", "in_progress", "quoted", "confirmed", "completed"];

const EcommerceOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: rentalOrders, isLoading: rentalsLoading } = useRentalOrders();
  const { data: serviceOrders, isLoading: servicesLoading } = useServiceOrders();

  const userEmail = user?.email;

  const myRentalOrders = useMemo(() => {
    if (!rentalOrders || !user?.id) return [];
    return rentalOrders.filter(
      (o) => o.client_id === user.id
    );
  }, [rentalOrders, user?.id]);

  const myServiceOrders = useMemo(() => {
    if (!serviceOrders || !userEmail) return [];
    return serviceOrders.filter((o) => o.client_email?.toLowerCase() === userEmail.toLowerCase());
  }, [serviceOrders, userEmail]);

  const allOrders = useMemo(() => {
    const rentals = myRentalOrders.map((o) => ({ ...o, orderType: "rental" as const }));
    const services = myServiceOrders.map((o) => ({ ...o, orderType: "service" as const }));
    return [...rentals, ...services].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [myRentalOrders, myServiceOrders]);

  const activeOrders = allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const previousOrders = allOrders.filter((o) => COMPLETED_STATUSES.includes(o.status));

  const isLoading = authLoading || rentalsLoading || servicesLoading;

  if (authLoading) {
    return (
      <Layout hideNavbar>
        <EcommerceHeader searchTerm="" onSearchChange={() => {}} categories={[]} selectedSearchCategory="" onSearchCategoryChange={() => {}} />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout hideNavbar>
        <EcommerceHeader searchTerm="" onSearchChange={() => {}} categories={[]} selectedSearchCategory="" onSearchCategoryChange={() => {}} />
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-sm w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <LogIn className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Sign in to view your orders</h2>
            <p className="text-sm text-muted-foreground">You need to be logged in to see your rental and service orders.</p>
            <Button onClick={() => navigate("/auth")} size="lg">Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

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
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide pt-4 pb-1">
        {steps.map((step, i) => {
          const isDone = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={step.key} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDone
                    ? isCurrent ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground/40"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                <span className={`text-[10px] sm:text-[11px] whitespace-nowrap max-w-[60px] sm:max-w-none text-center leading-tight ${
                  isCurrent ? "font-semibold text-primary" : isDone ? "text-foreground/70" : "text-muted-foreground/40"
                }`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 sm:w-10 h-0.5 mx-0.5 sm:mx-1 rounded-full ${i < currentIdx ? "bg-primary/40" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const OrderCard = ({ order, showStepper }: { order: (typeof allOrders)[0]; showStepper?: boolean }) => (
    <div className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      <div className="p-4 sm:p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              order.orderType === "rental" ? "bg-primary/10" : "bg-accent/10"
            }`}>
              {order.orderType === "rental" ? (
                <Package className="h-4.5 w-4.5 text-primary" />
              ) : (
                <Briefcase className="h-4.5 w-4.5 text-accent" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{order.title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {order.orderType === "rental" ? "Rental" : "Service"}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <Badge className={`flex-shrink-0 text-[11px] ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
            {statusLabels[order.status] || order.status}
          </Badge>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {order.event_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(order.event_date), "dd MMM yyyy")}
            </span>
          )}
          {order.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {order.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Placed {format(new Date(order.created_at), "dd MMM yyyy")}
          </span>
          {order.budget && (
            <span className="flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              {order.budget}
            </span>
          )}
        </div>

        {"equipment_category" in order && order.equipment_category && order.equipment_category !== "Cart Order" && (
          <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
            <Truck className="h-3 w-3" /> {order.equipment_category}
          </p>
        )}

        {/* Stepper */}
        {showStepper && <StatusStepper status={order.status} orderType={order.orderType} />}
      </div>
    </div>
  );

  const EmptyState = ({ message, icon: Icon }: { message: string; icon: any }) => (
    <div className="text-center py-16 space-y-3">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
        <Icon className="h-7 w-7 text-muted-foreground/40" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={() => navigate("/ecommerce")} className="gap-1.5 text-xs">
        <ShoppingBag className="h-3.5 w-3.5" /> Browse Shop
      </Button>
    </div>
  );

  return (
    <Layout hideNavbar>
      <EcommerceHeader
        searchTerm=""
        onSearchChange={(v) => { if (v) navigate(`/ecommerce?search=${encodeURIComponent(v)}`); }}
        categories={[]}
        selectedSearchCategory=""
        onSearchCategoryChange={() => {}}
      />

      {/* Breadcrumb */}
      <div className="bg-muted/40 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <button onClick={() => navigate("/ecommerce")} className="hover:text-primary transition-colors">Home</button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => navigate("/ecommerce")} className="hover:text-primary transition-colors">Shop</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">My Orders</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your rental and service requests in one place.</p>
        </div>
      </div>

      {/* Content */}
      <section className="bg-muted/20 min-h-[50vh]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : (
            <Tabs defaultValue="active" className="space-y-5">
              <TabsList className="bg-background border border-border rounded-lg h-10 p-1">
                <TabsTrigger value="active" className="rounded-md text-sm gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Active
                  {activeOrders.length > 0 && (
                    <span className="h-5 min-w-[20px] rounded-full bg-primary-foreground/20 text-xs font-semibold px-1.5 flex items-center justify-center">
                      {activeOrders.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="previous" className="rounded-md text-sm gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Previous
                  {previousOrders.length > 0 && (
                    <span className="h-5 min-w-[20px] rounded-full bg-muted-foreground/20 text-xs font-semibold px-1.5 flex items-center justify-center">
                      {previousOrders.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-3">
                {activeOrders.length === 0 ? (
                  <EmptyState message="No active orders right now." icon={Package} />
                ) : (
                  activeOrders.map((order) => <OrderCard key={order.id} order={order} showStepper />)
                )}
              </TabsContent>

              <TabsContent value="previous" className="space-y-3">
                {previousOrders.length === 0 ? (
                  <EmptyState message="No completed orders yet." icon={CheckCircle2} />
                ) : (
                  previousOrders.map((order) => <OrderCard key={order.id} order={order} />)
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EcommerceOrders;
