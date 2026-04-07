import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import DeliveryTrackingMap from "@/components/ecommerce/DeliveryTrackingMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, Truck, MapPin, Package, Phone, Clock } from "lucide-react";
import { format } from "date-fns";

const TrackDelivery = () => {
  const { deliveryOrderId } = useParams<{ deliveryOrderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: delivery, isLoading } = useQuery({
    queryKey: ["delivery-order", deliveryOrderId],
    enabled: !!deliveryOrderId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_orders")
        .select("*")
        .eq("id", deliveryOrderId!)
        .eq("customer_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch vendor name
  const { data: vendorProfile } = useQuery({
    queryKey: ["delivery-vendor", delivery?.vendor_id],
    enabled: !!delivery?.vendor_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, company_name")
        .eq("user_id", delivery!.vendor_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <Layout><div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div></Layout>;
  if (!delivery) return <Layout><div className="container mx-auto px-4 py-20 text-center"><h2 className="text-xl font-bold mb-4">Delivery not found</h2><Button onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Go Back</Button></div></Layout>;

  const vendorName = vendorProfile?.company_name || vendorProfile?.full_name || "Vendor";
  const fb = delivery.fee_breakdown as any || {};

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-6 space-y-6 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Back
        </button>

        <div>
          <h1 className="text-xl font-bold text-foreground">Delivery Tracking</h1>
          <p className="text-sm text-muted-foreground">From {vendorName}</p>
        </div>

        {/* Map */}
        <DeliveryTrackingMap
          deliveryOrderId={delivery.id}
          pickupLat={delivery.pickup_lat}
          pickupLng={delivery.pickup_lng}
          pickupLabel={delivery.pickup_address}
          dropoffLat={delivery.dropoff_lat}
          dropoffLng={delivery.dropoff_lng}
          dropoffLabel={delivery.dropoff_address}
          driverLat={delivery.driver_lat}
          driverLng={delivery.driver_lng}
          status={delivery.status}
          deliveredAt={delivery.delivered_at}
          deliveryPhotoUrl={delivery.delivery_photo_url}
          driverName={delivery.driver_name}
          vehicleType={fb.vehicle_type}
        />

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4 text-blue-500" />Route</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">From:</span> {delivery.pickup_address}</p>
                <p><span className="font-medium text-foreground">To:</span> {delivery.dropoff_address}</p>
              </div>
              <div className="flex items-center gap-3 pt-1">
                {delivery.distance_km && <Badge variant="outline" className="text-[10px]">{delivery.distance_km} km</Badge>}
                {delivery.duration_minutes && <Badge variant="outline" className="text-[10px]">{delivery.duration_minutes} min</Badge>}
                {delivery.scheduled_date && <Badge variant="outline" className="text-[10px]">{format(new Date(delivery.scheduled_date), "dd MMM")}</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" />Delivery Details</h3>
              <div className="text-xs space-y-1">
                {fb.vehicle_type && <p className="text-muted-foreground">Vehicle: <span className="font-medium text-foreground">{fb.vehicle_type}</span></p>}
                <p className="text-muted-foreground">Fee: <span className="font-bold text-foreground">₹{Math.round(delivery.delivery_fee).toLocaleString("en-IN")}</span></p>
                {delivery.driver_name && (
                  <p className="text-muted-foreground">Driver: <span className="font-medium text-foreground">{delivery.driver_name}</span></p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TrackDelivery;
