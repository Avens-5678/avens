import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EquipmentDetailsDisplay } from "@/utils/formatEquipmentDetails";
import Layout from "@/components/Layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Calendar, MapPin, Clock, CheckCircle2, Circle, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

const STATUS_STEPS_RENTAL = ["new", "sent_to_vendors", "accepted", "quoted", "confirmed", "in_progress", "completed"];
const STATUS_STEPS_SERVICE = ["new", "in_progress", "quoted", "confirmed", "completed"];

const statusLabels: Record<string, string> = {
  new: "Order Received",
  pending: "Pending",
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

const statusColors: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  sent_to_vendors: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  declined: "bg-red-500/15 text-red-700 dark:text-red-300",
  quoted: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  confirmed: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  in_progress: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  completed: "bg-green-500/15 text-green-700 dark:text-green-300",
  cancelled: "bg-red-500/15 text-red-700 dark:text-red-300",
};

type OrderResult = {
  type: "rental" | "service";
  id: string;
  title: string;
  status: string;
  created_at: string;
  event_date: string | null;
  location: string | null;
  client_name: string | null;
  details: string | null;
  vendor_quote_amount?: number | null;
};

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const trimmed = orderId.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);

    try {
      const { data, error: rpcError } = await supabase.rpc("lookup_order_by_id", {
        order_id: trimmed,
      });

      if (rpcError || !data) {
        setError("No order found with this ID. Please check and try again.");
        setLoading(false);
        return;
      }

      setOrder(data as OrderResult);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSteps = (type: "rental" | "service") =>
    type === "rental" ? STATUS_STEPS_RENTAL : STATUS_STEPS_SERVICE;

  const getCurrentStepIndex = (status: string, type: "rental" | "service") => {
    const steps = getSteps(type);
    const idx = steps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <section className="bg-primary/5 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Package className="h-4 w-4" />
              Order Tracking
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Track Your Order
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Enter your order ID to check the current status and progress of your rental or service request.
            </p>

            {/* Search */}
            <div className="max-w-lg mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Enter your Order ID..."
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-12 h-12 text-base rounded-xl"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading || !orderId.trim()} size="lg" className="rounded-xl h-12 px-6">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Track"}
              </Button>
            </div>
          </div>
        </section>

        {/* Results */}
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-3xl">
          {error && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="flex items-center gap-3 py-6">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-destructive text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {searched && !order && !error && !loading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No results found</p>
            </div>
          )}

          {order && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {order.type === "rental" ? "Rental Order" : "Service Order"}
                      </p>
                      <CardTitle className="text-xl">{order.title}</CardTitle>
                      {order.client_name && (
                        <p className="text-sm text-muted-foreground mt-1">Client: {order.client_name}</p>
                      )}
                    </div>
                    <Badge className={statusColors[order.status] || "bg-muted text-muted-foreground"}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>Placed: {format(new Date(order.created_at), "dd MMM yyyy")}</span>
                    </div>
                    {order.event_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Event: {format(new Date(order.event_date), "dd MMM yyyy")}</span>
                      </div>
                    )}
                    {order.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{order.location}</span>
                      </div>
                    )}
                  </div>
                  {order.details && (
                    <div className="border-t border-border pt-3 mt-3">
                      <p className="text-sm font-medium text-foreground mb-2">Equipment Details</p>
                      <EquipmentDetailsDisplay details={order.details} />
                    </div>
                  )}
                  {order.vendor_quote_amount != null && order.vendor_quote_amount > 0 && (
                    <div className="border-t border-border pt-3">
                      <p className="text-sm font-medium text-foreground">
                        Quoted Amount: ₹{order.vendor_quote_amount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Stepper */}
              {order.status !== "cancelled" && order.status !== "vendor_declined" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between relative">
                      {/* Progress line */}
                      <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
                      <div
                        className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
                        style={{
                          width: `${(getCurrentStepIndex(order.status, order.type) / (getSteps(order.type).length - 1)) * 100}%`,
                        }}
                      />
                      {getSteps(order.type).map((step, i) => {
                        const currentIdx = getCurrentStepIndex(order.status, order.type);
                        const isCompleted = i < currentIdx;
                        const isCurrent = i === currentIdx;
                        return (
                          <div key={step} className="relative flex flex-col items-center z-10" style={{ width: `${100 / getSteps(order.type).length}%` }}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCompleted
                                ? "bg-primary border-primary text-primary-foreground"
                                : isCurrent
                                ? "bg-background border-primary text-primary ring-4 ring-primary/20"
                                : "bg-background border-border text-muted-foreground"
                            }`}>
                              {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                            </div>
                            <span className={`text-[10px] sm:text-xs mt-2 text-center leading-tight ${
                              isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                            }`}>
                              {statusLabels[step] || step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cancelled / Declined */}
              {(order.status === "cancelled" || order.status === "vendor_declined") && (
                <Card className="border-destructive/30">
                  <CardContent className="flex items-center gap-3 py-6">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <p className="text-sm text-destructive font-medium">
                      This order has been {order.status === "cancelled" ? "cancelled" : "declined by the vendor"}.
                    </p>
                  </CardContent>
                </Card>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Order ID: <span className="font-mono">{order.id}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrder;
