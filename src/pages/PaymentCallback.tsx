import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Browser.close().catch(() => {});
    }

    const verify = async () => {
      const paymentLinkId = searchParams.get("razorpay_payment_link_id");
      const paymentLinkRefId = searchParams.get("razorpay_payment_link_reference_id");
      const paymentId = searchParams.get("razorpay_payment_id");
      const paymentLinkStatus = searchParams.get("razorpay_payment_link_status");
      const signature = searchParams.get("razorpay_signature");

      if (!paymentId || !signature || paymentLinkStatus !== "paid") {
        setStatus("failed");
        toast({ title: "Payment failed", description: "Payment was not completed.", variant: "destructive" });
        setTimeout(() => navigate("/cart"), 3000);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
          body: {
            razorpay_payment_link_id: paymentLinkId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            razorpay_payment_link_reference_id: paymentLinkRefId,
            razorpay_payment_link_status: paymentLinkStatus,
            order_id: paymentLinkRefId,
            is_payment_link: true,
          },
        });

        if (error || !data?.success) {
          throw new Error(data?.error || error?.message || "Verification failed");
        }

        // Handle bundle + coupon from stored context
        const pendingRaw = localStorage.getItem("evnting_pending_payment");
        if (pendingRaw) {
          try {
            const pending = JSON.parse(pendingRaw);
            if (pending.rzpBundleOrderId) {
              supabase.from("bundle_orders").update({
                status: "confirmed", payment_status: "paid",
                razorpay_payment_id: paymentId,
                updated_at: new Date().toISOString(),
              } as any).eq("id", pending.rzpBundleOrderId).then(() => {});
            }
            if (pending.couponApplied && user?.id) {
              supabase.from("coupon_usage").insert({
                coupon_id: pending.couponApplied.id, user_id: user.id, order_id: pending.orderId,
                order_type: "rental", discount_applied: pending.couponApplied.discount,
              } as any).then(() => {
                supabase.from("discount_coupons").select("used_count").eq("id", pending.couponApplied.id).single()
                  .then(({ data: d }) => {
                    if (d) supabase.from("discount_coupons").update({ used_count: (d.used_count || 0) + 1 } as any).eq("id", pending.couponApplied.id).then(() => {});
                  });
              });
            }
          } catch {}
          localStorage.removeItem("evnting_pending_payment");
        }

        // Clear cart
        localStorage.removeItem("evnting_cart");
        localStorage.removeItem("evnting_event_name");

        setStatus("success");
        toast({ title: "Booking Confirmed!", description: "Payment successful. You'll receive a WhatsApp confirmation shortly." });
        setTimeout(() => navigate("/ecommerce/orders"), 2000);
      } catch (err: any) {
        setStatus("failed");
        toast({ title: "Verification failed", description: err.message, variant: "destructive" });
        setTimeout(() => navigate("/cart"), 3000);
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === "verifying" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium">Verifying payment...</p>
            <p className="text-sm text-muted-foreground">Please wait, do not close this page.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <p className="text-lg font-medium">Payment Successful!</p>
            <p className="text-sm text-muted-foreground">Redirecting to your orders...</p>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-lg font-medium">Payment Failed</p>
            <p className="text-sm text-muted-foreground">Redirecting back to cart...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
