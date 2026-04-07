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
import InquiryForm from "@/components/forms/InquiryForm";
import Layout from "@/components/layout/Layout";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Skeleton } from "@/components/ui/skeleton";

// DO NOT use React.lazy() at module level — Vite TDZ bug
let _cachedTestimonials: ReturnType<typeof lazy> | null = null;
const getTestimonialsSection = () => {
  if (!_cachedTestimonials) _cachedTestimonials = lazy(() => import("@/components/shared/TestimonialsSection"));
  return _cachedTestimonials;
};

const PROMO_BANNERS = [
  { gradient: "from-evn-700 to-evn-900", fadeColor: "#1e1b4b", title: "Wedding Season Sale", subtitle: "Up to 40% off on decor rentals", cta: "Shop Now", link: "/ecommerce?category=Decor+%26+Floral" },
  { gradient: "from-emerald-700 to-emerald-900", fadeColor: "#064e3b", title: "New Venue Partners", subtitle: "50+ banquet halls just added", cta: "Explore Venues", link: "/ecommerce?service=venue" },
  { gradient: "from-amber-600 to-amber-800", fadeColor: "#92400e", title: "Hire Top-Rated DJs", subtitle: "Starting at ₹5,000/event", cta: "Find Crew", link: "/ecommerce?service=crew" },
  { gradient: "from-pink-600 to-pink-800", fadeColor: "#9d174d", title: "Event Essentials", subtitle: "Party supplies delivered fast", cta: "Shop Essentials", link: "/essentials" },
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
  { name: "Insta-Rent", tagline: "2,400+ items", gradient: "from-indigo-500 to-evn-600", icon: Package, link: "/ecommerce" },
  { name: "Venues", tagline: "340+ spaces", gradient: "from-emerald-500 to-teal-600", icon: MapPin, link: "/ecommerce?service=venue" },
  { name: "Crew Hub", tagline: "850+ pros", gradient: "from-amber-500 to-orange-600", icon: Users, link: "/ecommerce?service=crew" },
  { name: "Essentials", tagline: "Party supplies", gradient: "from-rose-400 to-pink-500", icon: Zap, link: "/essentials" },
];

const HeroSkeleton = () => (
  <div className="bg-gray-100 rounded-xl h-[140px] md:h-[200px] animate-pulse" />
);

const CardSkeleton = () => (
  <div className="bg-white rounded-lg p-2.5 space-y-2">
    <Skeleton className="aspect-[4/3] w-full rounded-md" />
    <Skeleton className="h-3 w-3/4" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-4 w-1/3" />
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

  // Global scroll-reveal observer
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    root.querySelectorAll(".animate-on-scroll, .stagger-children").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });

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
      <div ref={pageRef} className="bg-[#F5F5F5] min-h-screen">
        {/* ─── 3a. Hero Banner Carousel ─── */}
        <section className="relative">
          <div
            className="relative overflow-hidden"
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
                  className={`w-full flex-shrink-0 bg-gradient-to-r ${banner.gradient} h-[160px] md:h-[200px] flex items-center px-6 md:px-12`}
                >
                  <div className="text-white max-w-md">
                    <h2 className="text-lg md:text-2xl font-bold mb-1">{banner.title}</h2>
                    <p className="text-white/80 text-xs md:text-sm mb-3">{banner.subtitle}</p>
                    <Link
                      to={banner.link}
                      className="inline-flex items-center gap-1.5 bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white/90 transition-colors"
                    >
                      {banner.cta} <ArrowRight className="h-3.5 w-3.5" />
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
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 ${showArrows ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setCurrentBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length); resetArrowTimer(); }}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 ${showArrows ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {PROMO_BANNERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBannerIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentBannerIndex ? "bg-white w-5" : "bg-white/40"}`}
                />
              ))}
            </div>

            {/* Bottom gradient fade — matches current banner color */}
            <div
              className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10 transition-all duration-700"
              style={{ background: `linear-gradient(to bottom, transparent 0%, ${PROMO_BANNERS[currentBannerIndex].fadeColor} 100%)` }}
            />
          </div>
        </section>

        {/* ─── 3b. Service Vertical Pills — overlaps carousel ─── */}
        <section className="container mx-auto px-3 sm:px-4 py-2.5 animate-on-scroll -mt-5 relative z-10">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide stagger-children">
            {SERVICE_VERTICALS.map((v) => (
              <Link
                key={v.name}
                to={v.link}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${v.gradient} text-white hover:shadow-md hover:scale-[1.02] transition-all flex-shrink-0`}
              >
                <v.icon className="h-4 w-4 flex-shrink-0 text-white/90" />
                <div>
                  <p className="font-semibold text-[12px] leading-tight">{v.name}</p>
                  <p className="text-[10px] text-white/70">{v.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── 3c. Deals of the Day ─── */}
        {homeRentals.length > 0 && (
          <section className="container mx-auto px-3 sm:px-4 py-3 animate-on-scroll">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-bold text-gray-900">Deals of the Day</h2>
                <div className="flex items-center gap-1 text-[11px] text-evn-600 font-medium bg-evn-50 px-2 py-0.5 rounded">
                  <Clock className="h-3 w-3" />
                  <span>{countdown}</span>
                </div>
              </div>
              <Link to="/ecommerce" className="text-[11px] font-semibold text-evn-600 hover:text-evn-700 flex items-center gap-0.5">
                See All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
              {(loadingRentals ? [1, 2, 3, 4] : homeRentals.slice(0, 6)).map((item: any, i) => (
                loadingRentals ? <CardSkeleton key={i} /> : (
                  <Link
                    key={item.id}
                    to={`/ecommerce/${item.id}`}
                    className="flex-shrink-0 w-[160px] md:w-[185px] bg-white rounded-lg hover-lift overflow-hidden group"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                      {item.is_featured && (
                        <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">DEAL</span>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="font-medium text-[12px] text-gray-900 line-clamp-2 leading-tight group-hover:text-evn-600 transition-colors">{item.title}</h3>
                      {item.price_range && (
                        <p className="text-[13px] font-bold text-gray-900 mt-0.5">₹{item.price_range}</p>
                      )}
                      {item.rating > 0 && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] text-gray-500">{item.rating}</span>
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
          <section className="container mx-auto px-3 sm:px-4 py-3 animate-on-scroll">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm md:text-base font-bold text-gray-900">Popular in Hyderabad</h2>
              <Link to="/ecommerce" className="text-[11px] font-semibold text-evn-600 hover:text-evn-700 flex items-center gap-0.5">
                See All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {homeRentals.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  to={`/ecommerce/${item.id}`}
                  className="bg-white rounded-lg hover-lift overflow-hidden group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="h-7 w-7 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="font-medium text-[12px] text-gray-900 line-clamp-2 leading-tight group-hover:text-evn-600 transition-colors">{item.title}</h3>
                    <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{item.short_description}</p>
                    {item.price_range && (
                      <p className="text-[13px] font-bold text-gray-900 mt-1">₹{item.price_range}</p>
                    )}
                    {item.rating > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-gray-500">{item.rating}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── 3e. Browse by Category ─── */}
        <section className="container mx-auto px-3 sm:px-4 py-3 animate-on-scroll">
          <h2 className="text-sm md:text-base font-bold text-gray-900 mb-2.5">Browse by Category</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 md:grid md:grid-cols-6 md:gap-2.5">
            {BROWSE_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to={cat.link}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[72px] md:w-auto py-2 hover:opacity-80 transition-opacity group"
              >
                <div className={`w-12 h-12 rounded-full ${cat.color} flex items-center justify-center`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] md:text-[11px] font-medium text-gray-600 text-center leading-tight">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── 3f. Services Section (repurposed as featured) ─── */}
        {homeServices.length > 0 && (
          <section className="container mx-auto px-3 sm:px-4 py-3 animate-on-scroll">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm md:text-base font-bold text-gray-900">Featured Services</h2>
              <Link to="/services" className="text-[11px] font-semibold text-evn-600 hover:text-evn-700 flex items-center gap-0.5">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
              {homeServices.map((service) => (
                <Link
                  key={service.id}
                  to={`/events/${service.event_type.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex-shrink-0 w-[200px] md:w-[220px] bg-white rounded-lg hover-lift overflow-hidden group"
                >
                  {service.image_url && (
                    <div className="aspect-video overflow-hidden bg-gray-50">
                      <OptimizedImage src={service.image_url} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <div className="p-2">
                    <h3 className="font-medium text-[12px] text-gray-900 group-hover:text-evn-600 transition-colors line-clamp-1">{service.title}</h3>
                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{service.short_description}</p>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-evn-600 mt-1.5">
                      Learn More <ArrowRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Trusted Clients Marquee ─── */}
        {activeClients.length > 0 && (
          <section className="py-4 overflow-hidden">
            <div className="container mx-auto px-3 sm:px-4 mb-2">
              <h2 className="text-sm md:text-base font-bold text-gray-900">Trusted by Leading Brands</h2>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#F5F5F5] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#F5F5F5] to-transparent z-10 pointer-events-none" />
              <div className="flex animate-marquee w-max items-center gap-8 lg:gap-12 py-2">
                {[...activeClients, ...activeClients, ...activeClients].map((client, i) => (
                  <div key={`${client.id}-${i}`} className="flex-shrink-0 hover:opacity-80 transition-all duration-300 px-1">
                    <OptimizedImage src={client.logo_url} alt={client.name} loading="lazy" className="h-7 md:h-9 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── 3i. Why Choose Evnting — inline strip ─── */}
        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto px-3 sm:px-4 py-3">
            <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
              {[
                { icon: Shield, label: "Verified Vendors" },
                { icon: Lock, label: "Secure Payments" },
                { icon: RefreshCw, label: "Easy Returns" },
                { icon: Headphones, label: "24/7 Support" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 flex-shrink-0">
                  <item.icon className="h-3.5 w-3.5 text-evn-600" />
                  <span className="text-[11px] font-medium text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="py-5 bg-white">
          <div className="container mx-auto px-3 sm:px-4">
            <Suspense fallback={
              <div className="text-center py-4">
                <Skeleton className="h-6 w-48 mx-auto mb-3" />
                <Skeleton className="h-24 w-full max-w-2xl mx-auto" />
              </div>
            }>
              <TestimonialsSection />
            </Suspense>
          </div>
        </section>

        {/* ─── CTA Banner ─── */}
        <section className="container mx-auto px-3 sm:px-4 py-4 animate-on-scroll">
          <div className="bg-gradient-to-r from-evn-700 to-evn-900 rounded-xl p-5 md:p-8 text-center text-white">
            <h2 className="text-base md:text-xl font-bold mb-1.5">Ready to Plan Your Dream Event?</h2>
            <p className="text-white/70 text-xs md:text-sm mb-4 max-w-lg mx-auto">From conceptualization to execution, we transform your vision into an extraordinary experience.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button size="sm" className="bg-white text-evn-700 hover:bg-white/90 font-semibold px-5 h-9 rounded-lg text-xs" asChild>
                <Link to={getServiceRequestPath('')}>
                  Start Planning <Calendar className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-5 h-9 rounded-lg text-xs" asChild>
                <Link to="/ecommerce">
                  Browse Marketplace <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
