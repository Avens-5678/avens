import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider } from "@/contexts/AudioContext";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

// Lazy-loaded routes to reduce initial JS bundle
const Services = lazy(() => import("./pages/Services"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Gallery = lazy(() => import("./pages/Gallery"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const FAQ = lazy(() => import("./pages/FAQ"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Ecommerce = lazy(() => import("./pages/Ecommerce"));
const EcommerceOrders = lazy(() => import("./pages/EcommerceOrders"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Auth = lazy(() => import("./pages/Auth"));
const Register = lazy(() => import("./pages/auth/Register"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ClientDashboard = lazy(() => import("./pages/client/ClientDashboard"));
const VendorDashboard = lazy(() => import("./pages/vendor/VendorDashboard"));
const VendorAction = lazy(() => import("./pages/vendor/VendorAction"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const CorporateEvents = lazy(() => import("./pages/events/CorporateEvents"));
const EquipmentRental = lazy(() => import("./pages/events/EquipmentRental"));
const GovernmentEvents = lazy(() => import("./pages/events/GovernmentEvents"));
const DynamicEventPage = lazy(() => import("./pages/events/DynamicEventPage"));
const Team = lazy(() => import("./pages/Team"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AudioProvider>
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/gallery/:portfolioId" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/team" element={<Team />} />
              <Route path="/events/corporate" element={<CorporateEvents />} />
              <Route path="/events/equipment-rental" element={<EquipmentRental />} />
              <Route path="/events/:eventType" element={<DynamicEventPage />} />
              <Route path="/ecommerce" element={<Ecommerce />} />
              <Route path="/ecommerce/orders" element={<EcommerceOrders />} />
              <Route path="/ecommerce/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              
              {/* Auth Routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route 
                path="/client/dashboard" 
                element={
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <ProtectedRoute allowedRoles={["client"]}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              <Route 
                path="/vendor/dashboard" 
                element={
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <ProtectedRoute allowedRoles={["vendor"]}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              
              <Route path="/vendor/action" element={<VendorAction />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AudioProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
