import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider } from "@/contexts/AudioContext";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import Index from "./pages/Index";

// Lazy-loaded routes to reduce initial JS bundle
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
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
const EmployeeDashboard = lazy(() => import("./pages/employee/EmployeeDashboard"));
const VendorAction = lazy(() => import("./pages/vendor/VendorAction"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const QuoteAcceptance = lazy(() => import("./pages/QuoteAcceptance"));

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
              <Route path="/" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/home" element={<Index />} />
              {/* Redirects for removed pages */}
              <Route path="/services" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/portfolio" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/gallery/*" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/blog" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/blog/*" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/team" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/events/*" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/ecommerce" element={<Ecommerce />} />
              <Route path="/ecommerce/orders" element={<EcommerceOrders />} />
              <Route path="/ecommerce/track" element={<TrackOrder />} />
              <Route path="/ecommerce/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/quote/:token" element={<QuoteAcceptance />} />
              
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
              <Route 
                path="/employee/dashboard" 
                element={
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <ProtectedRoute allowedRoles={["employee"]}>
                      <EmployeeDashboard />
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
