import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { WhatsAppBot } from "@/components/ui/whatsapp-bot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useHeroBanners, useServices, useRentals, useTrustedClients, useAboutContent } from "@/hooks/useData";
import { useDashboardPath } from "@/hooks/useDashboardPath";
import { ArrowRight, Sparkles, Award, Calendar, Camera, Heart, User, Trophy, Users, ChevronLeft, ChevronRight, Star, Shield, Lock, RefreshCw, Headphones, Zap, MapPin, Clock, Package, Music, Lightbulb, Tent, Utensils, Flower2, Theater } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import InquiryForm from "@/components/Forms/InquiryForm";
import Layout from "@/components/Layout/Layout";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Skeleton } from "@/components/ui/skeleton";

// DO NOT use React.lazy() at module level — Vite TDZ bug
let _cachedTestimonials: ReturnType<typeof lazy> | null = null;
const getTestimonialsSection = () => {
  if (!_cachedTestimonials) _cachedTestimonials = lazy(() => import("@/components/TestimonialsSection"));
  return _cachedTestimonials;
};

const PROMO_BANNERS = [
  { gradient: "from-evn-700 to-evn-900", title: "Wedding Season Sale", subtitle: "Up to 40% off on decor rentals", cta: "Shop Now", link: "/ecommerce?category=Decor+%26+Floral" },
  { gradient: "from-emerald-700 to-emerald-900", title: "New Venue Partners", subtitle: "50+ banquet halls just added", cta: "Explore Venues", link: "/ecommerce?service=venue" },
  { gradient: "from-amber-600 to-amber-800", title: "Hire Top-Rated DJs", subtitle: "Starting at ₹5,000/event", cta: "Find Crew", link: "/ecommerce?service=crew" },
  { gradient: "from-pink-600 to-pink-800", title: "Event Essentials", subtitle: "Party supplies delivered fast", cta: "Shop Essentials", link: "/essentials" },
];

const BROWSE_CATEGORIES = [
  { label: "Sound Systems", icon: Music, color: "bg-evn-50 text-evn-600", link: "/ecommerce?category=Sound+%26+DJ" },
  { label: "Lighting", icon: Lightbulb, color: "bg-amber-50 text-amber-600", link: "/ecommerce?category=Lighting" },
  { label: "Stages", icon: Theater, color: "bg-purple-50 text-purple-600", link: "/ecommerce?category=Stages" },
  { label: "Tents", icon: Tent, color: "bg-emerald-50 text-emerald-600", link: "/ecommerce?category=Tents+%26+Structures" },
  { label: "Catering", icon: Utensils, color: "bg-orange-50 text-orange-600", link: "/ecommerce?category=Catering+Equipment" },
  { label: "Decoration", icon: Flower2, color: "bg-pink-50 text-pink-600", link: "/ecommerce?category=Decor+%26+Floral" },
];

const SERVICE_VERTICALS = [
  { name: "Insta-Rent", tagline: "2,400+ items", color: "bg-evn-50 border-evn-200 text-evn-700", icon: Package, link: "/ecommerce" },
  { name: "Venues", tagline: "340+ spaces", color: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: MapPin, link: "/ecommerce?service=venue" },
  { name: "Crew Hub", tagline: "850+ pros", color: "bg-amber-50 border-amber-200 text-amber-700", icon: Users, link: "/ecommerce?service=crew" },
  { name: "Essentials", tagline: "Party supplies", color: "bg-pink-50 border-pink-200 text-pink-700", icon: Zap, link: "/essentials" },
];

const HeroSkeleton = () => (
  <div className="bg-gray-100 rounded-2xl h-[200px] md:h-[280px] animate-pulse" />
);

const CardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-premium p-4 space-y-3">
    <Skeleton className="aspect-[4/3] w-full rounded-xl" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-5 w-1/3" />
  </div>
);

const Index = () => {
  const TestimonialsSection = getTestimonialsSection();
  const isMobile = useIsMobile();
  const { getServiceRequestPath } = useDashboardPath();
  const { data: heroBanners, isLoading: loadingBanners } = useHeroBanners();
  const { data: services, isLoading: loadingServices } = useServices();
  const { data: rentals, isLoading: loadingRentals } = useRentals();
  const { data: trustedClients, isLoading: loadingClients } = useTrustedClients();
  const { data: aboutContent } = useAboutContent();

  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showBannerFallback, setShowBannerFallback] = useState(false);

  // Touch swipe for mobile hero carousel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [showArrows, setShowArrows] = useState(true);
  const arrowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRotateRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Deals countdown
  const [countdown, setCountdown] = useState("05:32:18");
  useEffect(() => {
    const end = Date.now() + 5 * 3600 * 1000 + 32 * 60 * 1000 + 18 * 1000;
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setCountdown(`${h}:${m}:${s}`);
    };
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter data
  const homeServices = services?.filter((s) => s.show_on_home && s.is_active) || [];
  const homeRentals = rentals?.filter((r) => r.show_on_home && r.is_active) || [];
  const activeClients = trustedClients?.filter((c) => c.is_active) || [];
  const activeBanners = heroBanners?.filter((b) => b.is_active) || [];

  // Auto-hide arrows after 3s
  const resetArrowTimer = useCallback(() => {
    setShowArrows(true);
    if (arrowTimeoutRef.current) clearTimeout(arrowTimeoutRef.current);
    arrowTimeoutRef.current = setTimeout(() => setShowArrows(false), 3000);
  }, []);

  useEffect(() => {
    resetArrowTimer();
    return () => { if (arrowTimeoutRef.current) clearTimeout(arrowTimeoutRef.current); };
  }, [resetArrowTimer]);

  // Auto-rotate promo banners every 5s
  useEffect(() => {
    if (isPaused) return;
    autoRotateRef.current = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 5000);
    return () => { if (autoRotateRef.current) clearInterval(autoRotateRef.current); };
  }, [isPaused]);

  useEffect(() => {
    if (!loadingBanners) { setShowBannerFallback(false); return; }
    const timer = window.setTimeout(() => setShowBannerFallback(true), 3500);
    return () => window.clearTimeout(timer);
  }, [loadingBanners]);

  return (
    <>
    <Layout>
      <div className="bg-[#FAFAFA] min-h-screen">
        {/* ─── 3a. Hero Banner Carousel ─── */}
        <section className="container mx-auto px-4 sm:px-6 pt-4 pb-2">
          <div
            className="relative overflow-hidden rounded-2xl shadow-premium"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onMouseMove={resetArrowTimer}
            onTouchStart={(e) => { touchStartX.current = e.changedTouches[0].screenX; setIsPaused(true); }}
            onTouchEnd={(e) => {
              touchEndX.current = e.changedTouches[0].screenX;
              if (touchStartX.current !== null) {
                const diff = touchStartX.current - touchEndX.current;
                if (Math.abs(diff) > 50) {
                  setCurrentBannerIndex((prev) => diff > 0
                    ? (prev + 1) % PROMO_BANNERS.length
                    : prev === 0 ? PROMO_BANNERS.length - 1 : prev - 1);
                }
              }
              touchStartX.current = null;
              setIsPaused(false);
            }}
          >
            {/* Banner slides */}
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
            >
              {PROMO_BANNERS.map((banner, i) => (
                <div
                  key={i}
                  className={`w-full flex-shrink-0 bg-gradient-to-r ${banner.gradient} h-[200px] md:h-[280px] flex items-center px-8 md:px-16`}
                >
                  <div className="text-white max-w-lg">
                    <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                    <p className="text-white/80 text-sm md:text-lg mb-4">{banner.subtitle}</p>
                    <Link
                      to={banner.link}
                      className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors shadow-md"
                    >
                      {banner.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Nav arrows */}
            {!isMobile && (
              <>
                <button
                  onClick={() => { setCurrentBannerIndex((prev) => prev === 0 ? PROMO_BANNERS.length - 1 : prev - 1); resetArrowTimer(); }}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 ${showArrows ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => { setCurrentBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length); resetArrowTimer(); }}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 ${showArrows ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {PROMO_BANNERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBannerIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentBannerIndex ? "bg-white w-6" : "bg-white/40"}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ─── 3b. Service Vertical Pills ─── */}
        <section className="container mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SERVICE_VERTICALS.map((v) => (
              <Link
                key={v.name}
                to={v.link}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${v.color} hover:shadow-md transition-all duration-300 group`}
              >
                <v.icon className="h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{v.name}</p>
                  <p className="text-xs opacity-70">{v.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── 3c. Deals of the Day ─── */}
        {homeRentals.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Deals of the Day</h2>
                <div className="flex items-center gap-1.5 text-sm text-evn-600 font-medium bg-evn-50 px-3 py-1 rounded-full">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Ends in {countdown}</span>
                </div>
              </div>
              <Link to="/ecommerce" className="text-sm font-semibold text-evn-600 hover:text-evn-700 flex items-center gap-1">
                See All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {(loadingRentals ? [1, 2, 3, 4] : homeRentals.slice(0, 6)).map((item: any, i) => (
                loadingRentals ? <CardSkeleton key={i} /> : (
                  <Link
                    key={item.id}
                    to={`/ecommerce/${item.id}`}
                    className="flex-shrink-0 w-[220px] md:w-[240px] bg-white rounded-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 overflow-hidden group"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                      {item.is_featured && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">HOT</span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-evn-600 transition-colors">{item.title}</h3>
                      {item.price_range && (
                        <p className="text-base font-bold text-gray-900 mt-1">₹{item.price_range}</p>
                      )}
                      {item.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs text-gray-500">{item.rating}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              ))}
            </div>
          </section>
        )}

        {/* ─── 3d. Popular in City ─── */}
        {homeRentals.length > 2 && (
          <section className="container mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Popular in Hyderabad</h2>
              <Link to="/ecommerce" className="text-sm font-semibold text-evn-600 hover:text-evn-700 flex items-center gap-1">
                See All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {homeRentals.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  to={`/ecommerce/${item.id}`}
                  className="bg-white rounded-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 overflow-hidden group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-evn-600 transition-colors">{item.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">{item.short_description}</p>
                    {item.price_range && (
                      <p className="text-sm font-bold text-gray-900 mt-2">₹{item.price_range}</p>
                    )}
                    {item.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-gray-500">{item.rating}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── 3e. Browse by Category ─── */}
        <section className="container mx-auto px-4 sm:px-6 py-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {BROWSE_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to={cat.link}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white shadow-sm hover:shadow-premium hover:scale-[1.03] transition-all duration-300 group"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon className="h-7 w-7 md:h-8 md:h-8" />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-700 text-center">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── 3f. Services Section (repurposed as featured) ─── */}
        {homeServices.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Featured Services</h2>
              <Link to="/services" className="text-sm font-semibold text-evn-600 hover:text-evn-700 flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {homeServices.map((service) => (
                <Link
                  key={service.id}
                  to={`/events/${service.event_type.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex-shrink-0 w-[260px] md:w-[300px] bg-white rounded-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 overflow-hidden group"
                >
                  {service.image_url && (
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <OptimizedImage src={service.image_url} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-base text-gray-900 group-hover:text-evn-600 transition-colors line-clamp-1">{service.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{service.short_description}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-evn-600 mt-3">
                      Learn More <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Trusted Clients Marquee ─── */}
        {activeClients.length > 0 && (
          <section className="py-8 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Trusted by Leading Brands</h2>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
              <div className="flex animate-marquee w-max items-center gap-12 lg:gap-16 py-4">
                {[...activeClients, ...activeClients, ...activeClients].map((client, i) => (
                  <div key={`${client.id}-${i}`} className="flex-shrink-0 hover:opacity-80 transition-all duration-300 px-2">
                    <OptimizedImage src={client.logo_url} alt={client.name} loading="lazy" className="h-10 md:h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── 3i. Why Choose Evnting ─── */}
        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto px-4 sm:px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[
                { icon: Shield, label: "Verified Vendors", desc: "Every vendor vetted" },
                { icon: Lock, label: "Secure Payments", desc: "Razorpay protected" },
                { icon: RefreshCw, label: "Easy Returns", desc: "Hassle-free process" },
                { icon: Headphones, label: "24/7 Support", desc: "Always here to help" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-evn-50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-evn-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <Suspense fallback={
              <div className="text-center py-8">
                <Skeleton className="h-8 w-64 mx-auto mb-4" />
                <Skeleton className="h-32 w-full max-w-2xl mx-auto" />
              </div>
            }>
              <TestimonialsSection />
            </Suspense>
          </div>
        </section>

        {/* ─── CTA Banner ─── */}
        <section className="container mx-auto px-4 sm:px-6 py-8">
          <div className="bg-gradient-to-r from-evn-700 to-evn-900 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Plan Your Dream Event?</h2>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">From conceptualization to execution, we transform your vision into an extraordinary experience.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-white text-evn-700 hover:bg-white/90 font-semibold px-8 rounded-xl" asChild>
                <Link to={getServiceRequestPath('')}>
                  Start Planning <Calendar className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 rounded-xl" asChild>
                <Link to="/ecommerce">
                  Browse Marketplace <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-evn-600" />
              {selectedRental ? `Inquire About ${selectedRental.title}` : 'Event Inquiry'}
            </DialogTitle>
          </DialogHeader>
          <InquiryForm
            formType={selectedRental ? "rental" : "inquiry"}
            title={selectedRental ? `${selectedRental.title} Inquiry` : "General Inquiry"}
            rentalId={selectedRental?.id}
            rentalTitle={selectedRental?.title}
            onSuccess={() => { setInquiryDialogOpen(false); setSelectedRental(null); }}
          />
        </DialogContent>
      </Dialog>
    </Layout>
    <WhatsAppBot />
    </>
  );
};

export default Index;
