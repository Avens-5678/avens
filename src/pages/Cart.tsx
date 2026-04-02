import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import EcommerceHeader from "@/components/ecommerce/EcommerceHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isMeasurableUnit, calculateCartTotal, calculateManpowerFee, isInstantBookable } from "@/utils/pricingUtils";
import { useLogisticsConfig } from "@/hooks/useLogisticsConfig";
import { useDynamicTransport } from "@/hooks/useDynamicTransport";
import MapPinPicker from "@/components/ecommerce/MapPinPicker";
import PaymentPlanSelector from "@/components/ecommerce/PaymentPlanSelector";
import { PaymentPlan, MilestoneBreakdown, calculateMilestoneBreakdown, useCreateMilestones } from "@/hooks/usePaymentMilestones";
import {
  ShoppingCart, Trash2, ArrowLeft, Send, Package, Plus, Minus,
  CalendarDays, Tag, ChevronRight, Zap, Truck, Users, Loader2, MapPin, Building2, Gift, Star,
} from "lucide-react";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import { detectBundle, groupItemsByCategory, CATEGORY_LABELS } from "@/utils/bundleDetection";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Cart = () => {
  const { items, removeItem, updateQuantity, updateDimensions, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: logisticsConfig } = useLogisticsConfig();
  const { calculate: calcDynamicTransport, result: dynamicTransportResult, loading: transportLoading } = useDynamicTransport();

  const [showEnquiry, setShowEnquiry] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileData, setProfileData] = useState<{ full_name: string; email: string; phone: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan>("advance");
  const [milestoneBreakdown, setMilestoneBreakdown] = useState<MilestoneBreakdown | null>(null);
  const { mutateAsync: createMilestones } = useCreateMilestones();
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState<{ id: string; code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [eventDetails, setEventDetails] = useState({
    event_start_date: "",
    event_end_date: "",
    venue_address_line1: "",
    venue_address_line2: "",
    venue_pincode: "",
    venue_lat: 0,
    venue_lng: 0,
    notes: "",
  });

  const primaryVenueItem = items.find((item: any) => item.service_type === "venue");
  const primaryVenueAddress = primaryVenueItem?.address || "";
  const bookingFromDates = items.map((item) => item.booking_from).filter(Boolean) as string[];
  const derivedStartDate = bookingFromDates.length > 0 ? [...bookingFromDates].sort()[0] : "";

  // Detect if cart has venue items — venue bookings skip venue address fields
  const hasVenueItem = items.some((item: any) => item.service_type === "venue");
  const isVenueOnlyCart = items.length > 0 && items.every((item: any) => item.service_type === "venue");
  const showVenueAddressFields = !isVenueOnlyCart;

  // Instant booking logic
  const allItemsPriced = items.length > 0 && items.every(i => i.price_value != null);
  const minBookingHours = logisticsConfig?.min_booking_hours || 48;
  const dateIsSet = !!derivedStartDate;
  const canInstantBook = allItemsPriced && dateIsSet && isInstantBookable(derivedStartDate, minBookingHours);
  const showInstantBookFlow = allItemsPriced; // Show the flow if all items are priced, but enable button only if date qualifies
  const hasRequiredLocation = !showVenueAddressFields || !!eventDetails.venue_address_line1 || !!primaryVenueAddress;

  // Fetch loyalty balance
  useEffect(() => {
    if (!user) return;
    supabase.from("loyalty_accounts").select("current_balance").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setLoyaltyBalance(data.current_balance || 0); });
  }, [user]);

  const pointsDiscount = Math.floor(pointsToRedeem / 100) * 50; // 100 pts = ₹50

  // Calculate manpower fee
  const manpowerFee = logisticsConfig
    ? calculateManpowerFee(items, logisticsConfig.labor_units_per_loader, logisticsConfig.loader_daily_rate)
    : 0;

  // Calculate total volume units from cart
  const totalVolumeUnits = items.reduce((sum, i) => sum + ((i as any).volume_units || 1) * i.quantity, 0);

  // Auto-calc dynamic transport when venue location is set and we have a vendor with lat/lng
  useEffect(() => {
    if (!user) return;
    if (eventDetails.venue_lat && eventDetails.venue_lng) {
      // Find vendor with lat/lng (from profile)
      const vendorItem = items.find(i => i.vendor_id);
      if (vendorItem?.vendor_id) {
        // Fetch vendor's warehouse lat/lng
        supabase.from("profiles").select("warehouse_lat, warehouse_lng").eq("user_id", vendorItem.vendor_id).single().then(({ data }) => {
          if (data && (data as any).warehouse_lat && (data as any).warehouse_lng) {
            calcDynamicTransport({
              warehouse_lat: (data as any).warehouse_lat,
              warehouse_lng: (data as any).warehouse_lng,
              venue_lat: eventDetails.venue_lat,
              venue_lng: eventDetails.venue_lng,
              total_volume_units: totalVolumeUnits,
            });
          }
        });
      } else if (eventDetails.venue_pincode && eventDetails.venue_pincode.length >= 5) {
        // Fallback: use pincode-based with volume
        const vendorPincodeItem = items.find(i => i.vendor_pincode);
        if (vendorPincodeItem?.vendor_pincode) {
          // Use old edge function as fallback
          supabase.functions.invoke("calculate-transport", {
            body: { vendor_pincode: vendorPincodeItem.vendor_pincode, client_pincode: eventDetails.venue_pincode },
          });
        }
      }
    }
  }, [eventDetails.venue_lat, eventDetails.venue_lng, totalVolumeUnits]);

  const transportFee = dynamicTransportResult?.fee || 0;

  useEffect(() => {
    if (!primaryVenueAddress || isVenueOnlyCart) return;

    setEventDetails((prev) => (
      prev.venue_address_line1
        ? prev
        : { ...prev, venue_address_line1: primaryVenueAddress }
    ));
  }, [primaryVenueAddress, isVenueOnlyCart]);

  useEffect(() => {
    if (!showVenueAddressFields || eventDetails.venue_lat || eventDetails.venue_lng) return;

    const pinCode = eventDetails.venue_pincode.trim();
    if (pinCode.length < 5) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pinCode)}&country=India&format=json&limit=1`
        );
        const data = await res.json();

        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setEventDetails((prev) => (
            prev.venue_lat || prev.venue_lng
              ? prev
              : {
                  ...prev,
                  venue_lat: parseFloat(data[0].lat),
                  venue_lng: parseFloat(data[0].lon),
                }
          ));
        }
      } catch {
        // Ignore geocode fallback failures and allow manual pin drop instead
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [showVenueAddressFields, eventDetails.venue_pincode, eventDetails.venue_lat, eventDetails.venue_lng]);

  const formatItemPrice = (item: any) => {
    if (item.price_value != null) {
      return `₹${item.price_value.toLocaleString()}`;
    }
    if (item.price_range) return `₹${item.price_range}`;
    return "Quote on request";
  };

  const getItemTotal = (item: any) => {
    if (item.price_value != null) return item.price_value * item.quantity;
    return null;
  };

  // Fetch profile when user is available
  const fetchProfile = async () => {
    if (!user || profileLoaded) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("user_id", user.id)
      .single();
    if (data && data.full_name && data.phone) {
      setProfileData({ full_name: data.full_name, email: data.email || user.email || "", phone: data.phone });
    } else {
      setProfileData(null);
    }
    setProfileLoaded(true);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from("discount_coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!coupon) { toast({ title: "Invalid coupon", description: "This coupon code does not exist.", variant: "destructive" }); return; }
      const now = new Date();
      if (coupon.starts_at && new Date(coupon.starts_at) > now) { toast({ title: "Coupon not active yet", variant: "destructive" }); return; }
      if (coupon.expires_at && new Date(coupon.expires_at) < now) { toast({ title: "Coupon expired", variant: "destructive" }); return; }
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) { toast({ title: "Coupon usage limit reached", variant: "destructive" }); return; }
      if (user && coupon.per_user_limit) {
        const { count } = await supabase.from("coupon_usage").select("id", { count: "exact", head: true }).eq("coupon_id", coupon.id).eq("user_id", user.id);
        if ((count || 0) >= coupon.per_user_limit) { toast({ title: "You've already used this coupon", variant: "destructive" }); return; }
      }
      const { calculatedTotal: ct } = calculateCartTotal(items);
      if (coupon.min_order_amount && ct < coupon.min_order_amount) { toast({ title: `Minimum order ₹${Math.round(coupon.min_order_amount)} required`, variant: "destructive" }); return; }
      let discount = coupon.discount_type === "percentage" ? (ct * coupon.discount_value) / 100 : coupon.discount_value;
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) discount = coupon.max_discount_amount;
      discount = Math.round(discount);
      setCouponDiscount(discount);
      setCouponApplied({ id: coupon.id, code: coupon.code, discount });
      toast({ title: "Coupon applied!", description: `₹${discount} discount` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setCouponDiscount(0); setCouponApplied(null); setCouponCode(""); };

  const { calculatedTotal, hasQuoteItems } = calculateCartTotal(items);
  const vendorSubtotal = items.reduce(
    (sum, item) => sum + (((item as any).vendor_base_price ?? item.price_value ?? 0) * item.quantity),
    0
  );
  const platformFee = calculatedTotal - vendorSubtotal;
  const vendorPayout = vendorSubtotal + transportFee + manpowerFee;
  const bundle = useMemo(() => detectBundle(items, calculatedTotal), [items, calculatedTotal]);
  const grandTotal = calculatedTotal + manpowerFee + transportFee - couponDiscount - bundle.customerDiscount - pointsDiscount;

  useEffect(() => {
    if (!showInstantBookFlow || grandTotal <= 0) {
      setMilestoneBreakdown(null);
      return;
    }

    setMilestoneBreakdown(
      calculateMilestoneBreakdown(
        grandTotal,
        platformFee,
        vendorPayout,
        derivedStartDate || null,
        selectedPlan
      )
    );
  }, [showInstantBookFlow, grandTotal, platformFee, vendorPayout, derivedStartDate, selectedPlan]);

  const handleSendEnquiry = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to sign in to send an enquiry.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!profileData?.full_name || !profileData?.phone) {
      toast({ title: "Complete your profile", description: "Please fill in your name and phone number first.", variant: "destructive" });
      navigate("/client");
      return;
    }
    if (!derivedStartDate) {
      toast({ title: "Missing dates", description: "Please add items with booking dates.", variant: "destructive" });
      return;
    }
    if (showVenueAddressFields && !eventDetails.venue_address_line1 && !primaryVenueAddress) {
      toast({ title: "Missing information", description: "Please fill in the venue address.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const cartPayload = items.map(item => ({
        rental_id: item.id,
        title: item.title,
        variant_id: item.variant_id || null,
        variant_label: item.variant_label || null,
        quantity: item.quantity,
        length: item.length || null,
        breadth: item.breadth || null,
        price_value: item.price_value,
        pricing_unit: item.pricing_unit,
      }));
      const normalizedPhone = profileData.phone ? normalizePhoneNumber(profileData.phone) : null;
      const venueLocation = [eventDetails.venue_address_line1 || primaryVenueAddress, eventDetails.venue_address_line2, eventDetails.venue_pincode].filter(Boolean).join(", ");
      const orderId = crypto.randomUUID();

      // Determine if instant book
      const isInstant = canInstantBook && hasRequiredLocation;

      // Create bundle order if multi-category
      let bundleOrderId: string | null = null;
      if (bundle.isBundle) {
        bundleOrderId = crypto.randomUUID();
        const { error: bundleError } = await supabase.from("bundle_orders").insert({
          id: bundleOrderId,
          customer_id: user.id,
          event_name: eventDetails.notes ? `Event - ${items.length} items` : null,
          event_date: derivedStartDate || null,
          event_venue_address: eventDetails.venue_address_line1 || primaryVenueAddress || null,
          bundle_type: bundle.bundleType,
          categories_included: bundle.categoriesIncluded,
          subtotal: calculatedTotal,
          category_commission: platformFee,
          bundle_premium_rate: bundle.premiumRate,
          bundle_premium_amount: bundle.premiumAmount,
          total_amount: grandTotal,
          customer_savings: bundle.customerDiscount,
          status: isInstant ? "confirmed" : "pending",
          payment_status: "unpaid",
        } as any);
        if (bundleError) console.error("Bundle order creation failed:", bundleError);

        // Create bundle order items
        const bundleItems = items.map((item) => ({
          bundle_order_id: bundleOrderId,
          item_id: item.id,
          item_type: item.service_type === "venue" ? "venue" : item.service_type === "crew" ? "crew" : "equipment",
          vendor_id: item.vendor_id || user.id,
          item_name: item.title,
          quantity: item.quantity,
          price_per_unit: item.price_value || 0,
          total_price: (item.price_value || 0) * item.quantity,
          rental_start: item.booking_from || null,
          rental_end: item.booking_till || null,
        }));
        await supabase.from("bundle_order_items").insert(bundleItems as any);
      }

      // Determine the vendor from cart items (first vendor item found)
      const vendorItem = items.find(i => i.vendor_id);
      const assignedVendorId = vendorItem?.vendor_id || null;
      const vendorInventoryItemId = vendorItem ? vendorItem.id : null;

      const orderData: Record<string, any> = {
        id: orderId,
        title: `${isInstant ? "Instant Booking" : "Cart Enquiry"} - ${items.length} item(s)${bundle.isBundle ? ` [${bundle.label}]` : ""}`,
        equipment_category: "Cart Order",
        equipment_details: JSON.stringify({ cart_items: cartPayload, event_details: { ...eventDetails, customer_name: profileData.full_name, email: profileData.email, contact_number: profileData.phone } }),
        client_name: profileData.full_name,
        client_email: profileData.email,
        client_phone: normalizedPhone,
        event_date: derivedStartDate || null,
        location: venueLocation || primaryVenueAddress || null,
        notes: eventDetails.notes || null,
        status: isInstant ? "confirmed" : "new",
        client_id: user.id,
        assigned_vendor_id: assignedVendorId,
        vendor_inventory_item_id: vendorInventoryItemId,
        payment_plan: selectedPlan,
        bundle_order_id: bundleOrderId,
      };

      if (isInstant) {
        orderData.manpower_fee = manpowerFee;
        orderData.transport_fee = transportFee;
        orderData.platform_fee = platformFee;
        orderData.vendor_payout = vendorPayout;
      }

      const { error } = await supabase.from("rental_orders").insert(orderData as any);
      if (error) throw error;

      // Create payment milestones
      if (isInstant && milestoneBreakdown) {
        try {
          await createMilestones({ orderId, breakdown: milestoneBreakdown });
        } catch (mErr) {
          console.error("Failed to create milestones:", mErr);
        }
      }

      // Record coupon usage
      if (couponApplied && user) {
        try {
          await supabase.from("coupon_usage").insert({
            coupon_id: couponApplied.id,
            user_id: user.id,
            order_id: orderId,
            order_type: "rental",
            discount_applied: couponApplied.discount,
          } as any);
          await supabase.from("discount_coupons")
            .update({ used_count: (await supabase.from("discount_coupons").select("used_count").eq("id", couponApplied.id).single()).data?.used_count + 1 } as any)
            .eq("id", couponApplied.id);
        } catch (couponErr) {
          console.error("Coupon usage tracking failed:", couponErr);
        }
      }

      // Create delivery order if transport was calculated
      if (dynamicTransportResult && transportFee > 0 && eventDetails.venue_lat) {
        try {
          const vendorForDelivery = items.find(i => i.vendor_id);
          if (vendorForDelivery?.vendor_id) {
            const { data: vendorProf } = await supabase.from("profiles").select("warehouse_lat, warehouse_lng, address").eq("user_id", vendorForDelivery.vendor_id).single();
            if (vendorProf) {
              await supabase.from("delivery_orders").insert({
                order_id: orderId,
                order_type: bundleOrderId ? "bundle" : "rental",
                customer_id: user.id,
                vendor_id: vendorForDelivery.vendor_id,
                pickup_lat: (vendorProf as any).warehouse_lat || 0,
                pickup_lng: (vendorProf as any).warehouse_lng || 0,
                pickup_address: (vendorProf as any).address || "Vendor warehouse",
                dropoff_lat: eventDetails.venue_lat,
                dropoff_lng: eventDetails.venue_lng,
                dropoff_address: eventDetails.venue_address_line1 || "Event venue",
                distance_km: dynamicTransportResult.distance_km,
                duration_minutes: dynamicTransportResult.duration_min,
                delivery_fee: transportFee,
                fee_breakdown: {
                  vehicle_type: dynamicTransportResult.vehicle_type,
                  base_fare: dynamicTransportResult.base_fare,
                  extra_km: dynamicTransportResult.extra_km,
                  per_km_rate: dynamicTransportResult.per_km_rate,
                  surge_applied: dynamicTransportResult.surge_applied,
                  volume_units: dynamicTransportResult.total_volume_units,
                },
                scheduled_date: derivedStartDate || null,
                status: "pending",
              } as any);
            }
          }
        } catch (delErr) {
          console.error("Delivery order creation failed:", delErr);
        }
      }

      if (normalizedPhone) {
        try {
          await supabase.functions.invoke("send-whatsapp", {
            body: {
              to: normalizedPhone,
              template_name: "rental_confirmation",
              template_params: [profileData.full_name || "Customer", orderId.slice(0, 8).toUpperCase(), `${items.length} item(s)`, `${Math.round(grandTotal)}`],
              recipient_name: profileData.full_name,
              recipient_type: "customer",
            },
          });
        } catch (whatsappErr) {
          console.error("WhatsApp rental confirmation failed:", whatsappErr);
        }
      }

      // Push notification to vendor about new order
      if (assignedVendorId) {
        try {
          await supabase.functions.invoke("send-push-notification", {
            body: {
              user_id: assignedVendorId,
              title: "New Order Received",
              body: `New ${isInstant ? "booking" : "enquiry"} for ${items.length} item(s) — ₹${Math.round(grandTotal).toLocaleString("en-IN")}`,
              type: "order_update",
              data: { link: "/vendor/dashboard?tab=orders", order_id: orderId },
            },
          });
        } catch {}
      }

      // Award loyalty points (10 pts per ₹100 spent)
      if (isInstant && user && calculatedTotal > 0) {
        try {
          const basePoints = Math.floor(calculatedTotal / 100) * 10;
          const bonusPoints = bundle.isBundle ? 100 : 0;
          const totalPts = basePoints + bonusPoints;
          if (totalPts > 0) {
            await supabase.rpc("award_loyalty_points", {
              p_user_id: user.id, p_points: totalPts, p_type: "order_earned",
              p_description: `Earned from order #${orderId.slice(0, 8).toUpperCase()}${bonusPoints ? " + bundle bonus" : ""}`,
              p_reference_id: orderId, p_reference_type: "order",
            });
          }
        } catch {}
      }
      // Deduct redeemed points
      if (pointsToRedeem > 0 && user) {
        try {
          await supabase.rpc("award_loyalty_points", {
            p_user_id: user.id, p_points: -pointsToRedeem, p_type: "redeemed",
            p_description: `Redeemed at checkout for order #${orderId.slice(0, 8).toUpperCase()}`,
            p_reference_id: orderId, p_reference_type: "order",
          });
        } catch {}
      }

      toast({ title: isInstant ? "Booking Confirmed!" : "Enquiry Sent!", description: isInstant ? "Your booking is confirmed. Vendor will be notified." : "Our team will respond within 24 hours." });
      clearCart();
      setCouponApplied(null);
      setCouponDiscount(0);
      setCouponCode("");
      setPointsToRedeem(0);
      setShowEnquiry(false);
      setEventDetails({ event_start_date: "", event_end_date: "", venue_address_line1: "", venue_address_line2: "", venue_pincode: "", venue_lat: 0, venue_lng: 0, notes: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send enquiry", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRazorpayCheckout = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to sign in to book.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!profileData?.full_name || !profileData?.phone) {
      toast({ title: "Complete your profile", description: "Please fill in your name and phone number first.", variant: "destructive" });
      navigate("/client");
      return;
    }
    if (!derivedStartDate) {
      toast({ title: "Missing dates", description: "Please add items with booking dates.", variant: "destructive" });
      return;
    }
    if (showVenueAddressFields && !eventDetails.venue_address_line1 && !primaryVenueAddress) {
      toast({ title: "Missing information", description: "Please fill in the venue address.", variant: "destructive" });
      return;
    }
    if (!milestoneBreakdown) {
      toast({ title: "Error", description: "Payment plan not calculated. Please try again.", variant: "destructive" });
      return;
    }
    if (!window.Razorpay) {
      toast({ title: "Payment unavailable", description: "Please disable your ad blocker and refresh the page.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const orderId = crypto.randomUUID();

    try {
      const cartPayload = items.map(item => ({
        rental_id: item.id,
        title: item.title,
        variant_id: item.variant_id || null,
        variant_label: item.variant_label || null,
        quantity: item.quantity,
        length: item.length || null,
        breadth: item.breadth || null,
        price_value: item.price_value,
        pricing_unit: item.pricing_unit,
      }));
      const normalizedPhone = profileData.phone ? normalizePhoneNumber(profileData.phone) : null;
      const venueLocation = [eventDetails.venue_address_line1 || primaryVenueAddress, eventDetails.venue_address_line2, eventDetails.venue_pincode].filter(Boolean).join(", ");
      // Create bundle order if multi-category
      let rzpBundleOrderId: string | null = null;
      if (bundle.isBundle) {
        rzpBundleOrderId = crypto.randomUUID();
        await supabase.from("bundle_orders").insert({
          id: rzpBundleOrderId,
          customer_id: user.id,
          event_date: derivedStartDate || null,
          event_venue_address: eventDetails.venue_address_line1 || primaryVenueAddress || null,
          bundle_type: bundle.bundleType,
          categories_included: bundle.categoriesIncluded,
          subtotal: calculatedTotal,
          category_commission: platformFee,
          bundle_premium_rate: bundle.premiumRate,
          bundle_premium_amount: bundle.premiumAmount,
          total_amount: grandTotal,
          customer_savings: bundle.customerDiscount,
          status: "pending",
          payment_status: "unpaid",
        } as any);
        const bundleItems = items.map((item) => ({
          bundle_order_id: rzpBundleOrderId,
          item_id: item.id,
          item_type: item.service_type === "venue" ? "venue" : item.service_type === "crew" ? "crew" : "equipment",
          vendor_id: item.vendor_id || user.id,
          item_name: item.title,
          quantity: item.quantity,
          price_per_unit: item.price_value || 0,
          total_price: (item.price_value || 0) * item.quantity,
          rental_start: item.booking_from || null,
          rental_end: item.booking_till || null,
        }));
        await supabase.from("bundle_order_items").insert(bundleItems as any);
      }

      const vendorItem = items.find(i => i.vendor_id);
      const assignedVendorId = vendorItem?.vendor_id || null;
      const vendorInventoryItemId = vendorItem ? vendorItem.id : null;

      // Insert order with status 'accepted' — confirmed only after Razorpay signature verification
      const { error: orderError } = await supabase.from("rental_orders").insert({
        id: orderId,
        title: `Instant Booking - ${items.length} item(s)${bundle.isBundle ? ` [${bundle.label}]` : ""}`,
        equipment_category: "Cart Order",
        equipment_details: JSON.stringify({
          cart_items: cartPayload,
          event_details: { ...eventDetails, customer_name: profileData.full_name, email: profileData.email, contact_number: profileData.phone },
        }),
        client_name: profileData.full_name,
        client_email: profileData.email,
        client_phone: normalizedPhone,
        event_date: derivedStartDate || null,
        location: venueLocation || primaryVenueAddress || null,
        notes: eventDetails.notes || null,
        status: "accepted",
        client_id: user.id,
        assigned_vendor_id: assignedVendorId,
        vendor_inventory_item_id: vendorInventoryItemId,
        payment_plan: selectedPlan,
        manpower_fee: manpowerFee,
        transport_fee: transportFee,
        platform_fee: platformFee,
        vendor_payout: vendorPayout,
        bundle_order_id: rzpBundleOrderId,
      } as any);
      if (orderError) throw orderError;

      // Insert milestones all as pending — verify-razorpay-payment marks milestone 1 paid
      const milestoneRows = milestoneBreakdown.milestones.map(m => ({
        order_id: orderId,
        milestone_name: m.name,
        amount_due: m.amount,
        due_date: m.due_date,
        status: "pending",
        paid_at: null,
        payment_plan: milestoneBreakdown.plan,
        milestone_order: m.milestone_order,
      }));
      const { error: msError } = await supabase.from("payment_milestones").insert(milestoneRows as any);
      if (msError) throw msError;

      // Create delivery order for Razorpay checkout
      if (dynamicTransportResult && transportFee > 0 && eventDetails.venue_lat) {
        const vendorForDel = items.find(i => i.vendor_id);
        if (vendorForDel?.vendor_id) {
          const { data: vp } = await supabase.from("profiles").select("warehouse_lat, warehouse_lng, address").eq("user_id", vendorForDel.vendor_id).single();
          if (vp) {
            await supabase.from("delivery_orders").insert({
              order_id: orderId, order_type: rzpBundleOrderId ? "bundle" : "rental",
              customer_id: user.id, vendor_id: vendorForDel.vendor_id,
              pickup_lat: (vp as any).warehouse_lat || 0, pickup_lng: (vp as any).warehouse_lng || 0,
              pickup_address: (vp as any).address || "Vendor warehouse",
              dropoff_lat: eventDetails.venue_lat, dropoff_lng: eventDetails.venue_lng,
              dropoff_address: eventDetails.venue_address_line1 || "Event venue",
              distance_km: dynamicTransportResult.distance_km, duration_minutes: dynamicTransportResult.duration_min,
              delivery_fee: transportFee,
              fee_breakdown: { vehicle_type: dynamicTransportResult.vehicle_type, base_fare: dynamicTransportResult.base_fare, extra_km: dynamicTransportResult.extra_km, per_km_rate: dynamicTransportResult.per_km_rate, surge_applied: dynamicTransportResult.surge_applied, volume_units: dynamicTransportResult.total_volume_units },
              scheduled_date: derivedStartDate || null, status: "pending",
            } as any);
          }
        }
      }

      // Create the Razorpay order on the backend
      const amountToPay = milestoneBreakdown.milestones[0].amount;
      const { data: rzpData, error: rzpFnError } = await supabase.functions.invoke("create-razorpay-order", {
        body: { amount: amountToPay, currency: "INR", order_id: orderId },
      });
      if (rzpFnError || !rzpData?.razorpay_order_id) {
        throw new Error(rzpFnError?.message || "Failed to create payment order");
      }

      // Open Razorpay checkout popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amountToPay * 100, // paise
        currency: "INR",
        name: "Evnting.com",
        description: `Booking - ${items.length} item(s)`,
        order_id: rzpData.razorpay_order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
              phone: normalizedPhone,
              name: profileData.full_name,
            },
          });
          if (verifyError || !verifyData?.success) {
            toast({
              title: "Payment verification failed",
              description: `Please contact support with payment ID: ${response.razorpay_payment_id}`,
              variant: "destructive",
            });
            return;
          }
          // Mark bundle as paid
          if (rzpBundleOrderId) {
            supabase.from("bundle_orders").update({
              status: "confirmed", payment_status: "paid",
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              updated_at: new Date().toISOString(),
            } as any).eq("id", rzpBundleOrderId).then(() => {});
          }
          // Record coupon usage on successful payment
          if (couponApplied) {
            supabase.from("coupon_usage").insert({
              coupon_id: couponApplied.id, user_id: user.id, order_id: orderId,
              order_type: "rental", discount_applied: couponApplied.discount,
            } as any).then(() => {
              supabase.from("discount_coupons").select("used_count").eq("id", couponApplied.id).single()
                .then(({ data }) => {
                  if (data) supabase.from("discount_coupons").update({ used_count: (data.used_count || 0) + 1 } as any).eq("id", couponApplied.id).then(() => {});
                });
            });
          }
          toast({ title: "Booking Confirmed!", description: "Payment successful. You'll receive a WhatsApp confirmation shortly." });
          clearCart();
          navigate("/ecommerce/orders");
        },
        prefill: {
          name: profileData.full_name,
          email: profileData.email,
          contact: normalizedPhone || profileData.phone,
        },
        theme: { color: "#7c3aed" },
        modal: {
          ondismiss: () => {
            toast({ title: "Payment cancelled", description: "Your booking was not confirmed. You can try again.", variant: "destructive" });
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      // setSubmitting is intentionally NOT reset here —
      // ondismiss handles the cancel case; the success handler navigates away.
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to initiate payment", variant: "destructive" });
      setSubmitting(false);
    }
  };

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
            <span className="text-foreground font-medium">Cart ({items.length})</span>
          </div>
        </div>
      </div>

      <section className="py-6 sm:py-8 pb-24 lg:pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          {items.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-sm text-muted-foreground mb-6">Browse our equipment collection and add items to get started.</p>
              <Button onClick={() => navigate("/ecommerce")} size="lg" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
              {/* Cart Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">Shopping Cart</h1>
                  <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                    Remove all
                  </button>
                </div>

                {/* Bundle Deal Banner */}
                {bundle.isBundle && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center flex-shrink-0">
                      <Gift className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        {bundle.label} — {bundle.categoriesIncluded.length} categories
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Save ₹{Math.round(bundle.customerDiscount).toLocaleString("en-IN")} by booking {bundle.categoriesIncluded.map(c => CATEGORY_LABELS[c] || c).join(" + ")} together!
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {items.map((item) => {
                    const itemTotal = getItemTotal(item);
                    return (
                      <div key={`${item.id}-${item.variant_id || ''}`} className="bg-background border border-border rounded-xl p-4 sm:p-5">
                        <div className="flex gap-4">
                          <button onClick={() => navigate(`/ecommerce/${item.id}`)} className="flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.title} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-border" />
                            ) : (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground/40" />
                              </div>
                            )}
                          </button>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <button onClick={() => navigate(`/ecommerce/${item.id}`)} className="text-sm sm:text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 text-left">
                                  {item.title}
                                </button>
                                {item.variant_label && (
                                  <Badge variant="secondary" className="mt-1 text-[10px]">{item.variant_label}</Badge>
                                )}
                              </div>
                              <button onClick={() => removeItem(item.id, item.variant_id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{formatItemPrice(item)}</span>
                              {item.pricing_unit && (
                                <span className="text-xs text-muted-foreground">/ {item.pricing_unit}</span>
                              )}
                            </div>

                            {/* Show booking dates per item */}
                            {(item.booking_from || item.booking_till) && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5" />
                                <span>{item.booking_from} → {item.booking_till}</span>
                                {item.booking_slot && item.booking_slot !== "full_day" && (
                                  <Badge variant="outline" className="text-[10px] capitalize">{item.booking_slot.replace("_", " ")}</Badge>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              {isMeasurableUnit(item.pricing_unit) ? (
                                <div className="space-y-1.5">
                                  <div className="grid grid-cols-2 gap-2 max-w-[200px]">
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] text-muted-foreground">Length</span>
                                      <Input
                                        type="number" min={0} step="any"
                                        value={item.length || ""}
                                        onChange={e => updateDimensions(item.id, parseFloat(e.target.value) || 0, item.breadth || 0, item.variant_id)}
                                        className="h-8 text-sm"
                                        placeholder="L"
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] text-muted-foreground">Breadth</span>
                                      <Input
                                        type="number" min={0} step="any"
                                        value={item.breadth || ""}
                                        onChange={e => updateDimensions(item.id, item.length || 0, parseFloat(e.target.value) || 0, item.variant_id)}
                                        className="h-8 text-sm"
                                        placeholder="B"
                                      />
                                    </div>
                                  </div>
                                  {(item.length || 0) > 0 && (item.breadth || 0) > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      Area: <span className="font-medium text-foreground">{item.quantity.toLocaleString()} {item.pricing_unit?.replace("Per ", "")}</span>
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                  <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant_id)} className="px-3 py-1.5 hover:bg-muted transition-colors text-sm font-medium">−</button>
                                  <span className="px-3 py-1.5 text-sm font-semibold border-x border-border min-w-[40px] text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant_id)} className="px-3 py-1.5 hover:bg-muted transition-colors text-sm font-medium">+</button>
                                </div>
                              )}

                              {itemTotal != null && (
                                <span className="text-base font-bold text-foreground">₹{itemTotal.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button variant="outline" onClick={() => navigate("/ecommerce")} size="sm" className="gap-2 text-sm">
                  <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
                </Button>
              </div>

              {/* Sidebar */}
              <div className="lg:sticky lg:top-20 space-y-4 self-start">
                {showEnquiry ? (
                  <div className="bg-background border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <h3 className="text-base font-bold text-foreground">
                          {isVenueOnlyCart || hasVenueItem ? "Booking Details" : "Event Details"}
                        </h3>
                      </div>
                      <button onClick={() => setShowEnquiry(false)} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      {profileData && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                          <p className="font-medium text-foreground">{profileData.full_name}</p>
                          <p className="text-muted-foreground text-xs">{profileData.email}</p>
                          <p className="text-muted-foreground text-xs">{profileData.phone}</p>
                        </div>
                      )}
                      {/* Booking dates derived from cart items */}
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                        <p className="text-xs font-semibold text-foreground">Booking Dates (from cart)</p>
                        {items.map(item => (
                          item.booking_from ? (
                            <div key={`${item.id}-${item.variant_id || ''}-dates`} className="flex justify-between text-xs">
                              <span className="text-muted-foreground line-clamp-1">{item.title}</span>
                              <span className="font-medium text-foreground flex-shrink-0">{item.booking_from} → {item.booking_till}</span>
                            </div>
                          ) : null
                        ))}
                      </div>
                      {showVenueAddressFields && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs">Venue Address Line 1 *</Label>
                            <Input value={eventDetails.venue_address_line1} onChange={e => setEventDetails(p => ({ ...p, venue_address_line1: e.target.value }))} placeholder="Street address, building name" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Venue Address Line 2</Label>
                            <Input value={eventDetails.venue_address_line2} onChange={e => setEventDetails(p => ({ ...p, venue_address_line2: e.target.value }))} placeholder="Area, landmark" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Pin Code</Label>
                            <Input value={eventDetails.venue_pincode} onChange={e => setEventDetails(p => ({ ...p, venue_pincode: e.target.value }))} placeholder="500001" maxLength={6} />
                          </div>
                          {/* Map Pin Picker for venue delivery */}
                          <MapPinPicker
                            label="📍 Pin your venue location"
                            description="Drop a pin for precise delivery distance & cost calculation."
                            onLocationSelect={(lat, lng, addr) => {
                              setEventDetails(p => ({
                                ...p,
                                venue_lat: lat,
                                venue_lng: lng,
                                venue_address_line1: addr || p.venue_address_line1,
                              }));
                            }}
                            compact
                          />
                        </>
                      )}
                      <div className="space-y-1">
                        <Label className="text-xs">Additional Notes</Label>
                        <Textarea value={eventDetails.notes} onChange={e => setEventDetails(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requirements..." rows={3} />
                      </div>

                      {/* Logistics breakdown for instant book */}
                      {showInstantBookFlow && dateIsSet && (
                        <div className="space-y-2 pt-2">
                          <Separator />
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Logistics Breakdown</h4>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="flex items-center gap-1.5 text-muted-foreground"><Package className="h-3.5 w-3.5" /> Items Subtotal</span>
                              <span className="font-medium">₹{calculatedTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-3.5 w-3.5" /> Manpower</span>
                              <span className="font-medium">₹{manpowerFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Truck className="h-3.5 w-3.5" /> Transport
                                {transportLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                              </span>
                              <span className="font-medium">
                                {!user ? "Login to see delivery fee" : dynamicTransportResult ? `₹${transportFee.toLocaleString()}` : eventDetails.venue_lat ? "Calculating..." : "Pin venue on map"}
                              </span>
                            </div>
                            {dynamicTransportResult && (
                              <div className="bg-muted/50 rounded-md p-2 space-y-0.5">
                                <p className="text-[10px] text-muted-foreground">
                                  🚛 {dynamicTransportResult.vehicle_type} · {dynamicTransportResult.distance_km} km driving distance
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  Base ₹{dynamicTransportResult.base_fare} + {dynamicTransportResult.extra_km} km × ₹{dynamicTransportResult.per_km_rate}/km
                                  {dynamicTransportResult.surge_applied && " × 1.5x night surge"}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  📦 {dynamicTransportResult.total_volume_units} volume units
                                </p>
                              </div>
                            )}
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="text-base font-bold">Grand Total</span>
                            <span className="text-lg font-bold text-primary">₹{grandTotal.toLocaleString()}</span>
                          </div>

                          {!canInstantBook && dateIsSet && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              ⚠ Event is less than {minBookingHours} hours away — falls back to enquiry mode.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Payment Plan Selector — only for instant book eligible orders */}
                      {canInstantBook && grandTotal > 0 && (
                        <PaymentPlanSelector
                          grandTotal={grandTotal}
                          platformFee={platformFee}
                          vendorPayout={vendorPayout}
                          eventDate={derivedStartDate || null}
                          selectedPlan={selectedPlan}
                          onPlanSelect={(plan, breakdown) => {
                            setSelectedPlan(plan);
                            setMilestoneBreakdown(breakdown);
                          }}
                        />
                      )}
                    </div>

                    {canInstantBook ? (
                      <Button onClick={handleRazorpayCheckout} className="w-full gap-2" size="lg" disabled={submitting}>
                        <Zap className="h-4 w-4" /> {submitting ? "Opening Payment..." : `Pay ₹${milestoneBreakdown?.milestones[0]?.amount?.toLocaleString("en-IN") || grandTotal.toLocaleString()} & Book`}
                      </Button>
                    ) : (
                      <Button onClick={handleSendEnquiry} className="w-full gap-2" size="lg" disabled={submitting}>
                        <Send className="h-4 w-4" /> {submitting ? "Sending..." : "Send Enquiry"}
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Price Summary */}
                    <div className="bg-background border border-border rounded-xl p-5 space-y-4">
                      <h3 className="text-base font-bold text-foreground">Price Details</h3>
                      <Separator />
                      <div className="space-y-2.5">
                        {items.map((item) => {
                          const total = getItemTotal(item);
                          return (
                            <div key={`${item.id}-${item.variant_id || ''}`} className="flex justify-between gap-3 text-sm">
                              <span className="text-muted-foreground line-clamp-1 flex-1">
                                {item.title}
                                <span className="text-xs ml-1">
                                  {isMeasurableUnit(item.pricing_unit)
                                    ? `(${item.quantity} ${item.pricing_unit?.replace("Per ", "")})`
                                    : `× ${item.quantity}`}
                                </span>
                              </span>
                              <span className="font-medium text-foreground flex-shrink-0">
                                {total != null ? `₹${total.toLocaleString()}` : "TBD"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <Separator />

                      {/* Show logistics preview if all priced */}
                      {showInstantBookFlow && (
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>+ Manpower (est.)</span>
                            <span>₹{manpowerFee.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>+ Transport (est.)</span>
                            <span>Calculated at checkout</span>
                          </div>
                          <Separator />
                        </div>
                      )}

                      {/* Coupon */}
                      <div className="space-y-2">
                        {couponApplied ? (
                          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{couponApplied.code}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-emerald-600">-₹{couponApplied.discount.toLocaleString()}</span>
                              <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="Coupon code"
                              className="h-8 text-xs font-mono flex-1"
                              onKeyDown={(e) => { if (e.key === "Enter") applyCoupon(); }}
                            />
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}>
                              {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Tag className="h-3 w-3" />}Apply
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Bundle Discount */}
                      {bundle.isBundle && bundle.customerDiscount > 0 && (
                        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Gift className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{bundle.label} Discount</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-600">-₹{Math.round(bundle.customerDiscount).toLocaleString("en-IN")}</span>
                        </div>
                      )}

                      {/* Loyalty Points Redemption */}
                      {user && loyaltyBalance > 0 && (
                        <div className="space-y-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1"><Star className="h-3 w-3" />Loyalty Points</span>
                            <span className="text-[10px] text-muted-foreground">{loyaltyBalance} pts available</span>
                          </div>
                          {pointsToRedeem > 0 ? (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-purple-600">Using {pointsToRedeem} pts</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-purple-600">-₹{pointsDiscount.toLocaleString("en-IN")}</span>
                                <button onClick={() => setPointsToRedeem(0)} className="text-[10px] text-muted-foreground hover:text-destructive">Remove</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={Math.min(loyaltyBalance, Math.floor(calculatedTotal / 50) * 100)}
                                step={100}
                                placeholder="Points to use"
                                className="h-7 text-xs flex-1"
                                onChange={(e) => {
                                  const v = Math.min(parseInt(e.target.value) || 0, loyaltyBalance, Math.floor(calculatedTotal / 50) * 100);
                                  setPointsToRedeem(Math.max(0, Math.floor(v / 100) * 100));
                                }}
                              />
                              <span className="text-[10px] text-muted-foreground self-center whitespace-nowrap">100 pts = ₹50</span>
                            </div>
                          )}
                        </div>
                      )}
                      <Separator />

                      {calculatedTotal > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold text-foreground">Estimated Total</span>
                          <div className="text-right">
                            {(couponDiscount > 0 || bundle.customerDiscount > 0) && (
                              <span className="text-xs line-through text-muted-foreground mr-2">₹{calculatedTotal.toLocaleString()}</span>
                            )}
                            <span className="text-lg font-bold text-primary">₹{Math.round(calculatedTotal - couponDiscount - bundle.customerDiscount).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      )}
                      {hasQuoteItems && (
                        <p className="text-[11px] text-muted-foreground">* Some items require a custom quote. Final price confirmed by our team.</p>
                      )}

                      {canInstantBook && (
                        <Badge variant="secondary" className="gap-1">
                          <Zap className="h-3 w-3" /> Instant Book eligible
                        </Badge>
                      )}

                      <Button
                        onClick={async () => {
                          if (!user && !authLoading) {
                            toast({ title: "Please log in", description: "Sign in to send your enquiry.", variant: "destructive" });
                            navigate("/auth");
                            return;
                          }
                          if (user) {
                            const { data } = await supabase
                              .from("profiles")
                              .select("full_name, email, phone")
                              .eq("user_id", user.id)
                              .single();
                            if (data && data.full_name && data.phone) {
                              setProfileData({ full_name: data.full_name, email: data.email || user.email || "", phone: data.phone });
                              setProfileLoaded(true);
                              setShowEnquiry(true);
                            } else {
                              toast({ title: "Complete your profile", description: "Please add your name and phone number to proceed.", variant: "destructive" });
                              navigate("/client");
                            }
                          }
                        }}
                        className="w-full gap-2"
                        size="lg"
                      >
                        {canInstantBook ? (
                          <><Zap className="h-4 w-4" /> Proceed to Book</>
                        ) : (
                          <><Send className="h-4 w-4" /> Proceed to Enquiry</>
                        )}
                      </Button>
                      <p className="text-[11px] text-muted-foreground text-center">
                        {canInstantBook ? "Secure this booking with your first payment." : "Our team will respond within 24 hours."}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile sticky bottom CTA */}
      {items.length > 0 && !showEnquiry && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg px-4 py-3 flex items-center gap-3 lg:hidden">
          <div className="flex-1 min-w-0">
            {calculatedTotal > 0 && (
              <p className="text-base font-bold text-foreground leading-tight">
                ₹{calculatedTotal.toLocaleString()}
                <span className="text-xs font-normal text-muted-foreground ml-1">est. total</span>
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>
          <Button
            size="sm"
            className="gap-1.5 h-10 px-5"
            onClick={async () => {
              if (!user && !authLoading) {
                toast({ title: "Please log in", description: "Sign in to send your enquiry.", variant: "destructive" });
                navigate("/auth");
                return;
              }
              if (user) {
                const { data } = await supabase
                  .from("profiles")
                  .select("full_name, email, phone")
                  .eq("user_id", user.id)
                  .single();
                if (data && data.full_name && data.phone) {
                  setProfileData({ full_name: data.full_name, email: data.email || user.email || "", phone: data.phone });
                  setProfileLoaded(true);
                  setShowEnquiry(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  toast({ title: "Complete your profile", description: "Please add your name and phone number to proceed.", variant: "destructive" });
                  navigate("/client");
                }
              }
            }}
          >
            {canInstantBook ? <><Zap className="h-3.5 w-3.5" />Proceed to Book</> : <><Send className="h-3.5 w-3.5" />Proceed to Enquiry</>}
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default Cart;
