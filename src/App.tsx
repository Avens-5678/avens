import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider } from "@/contexts/AudioContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

// IMPORTANT: All React.lazy() calls MUST be inside this function, NOT at module level.
// Vite wraps dynamic import() with __vite_preload which is a const defined AFTER
// these declarations in the bundled output. Module-level lazy() causes TDZ error:
// "Cannot access '_' before initialization"
function createLazyRoutes() {
  return {
    Index: lazy(() => import("./pages/Index")),
    About: lazy(() => import("./pages/About")),
    FAQ: lazy(() => import("./pages/FAQ")),
    Ecommerce: lazy(() => import("./pages/Ecommerce")),
    EcommerceOrders: lazy(() => import("./pages/EcommerceOrders")),
    TrackOrder: lazy(() => import("./pages/TrackOrder")),
    ProductDetail: lazy(() => import("./pages/ProductDetail")),
    Cart: lazy(() => import("./pages/Cart")),
    Auth: lazy(() => import("./pages/Auth")),
    Register: lazy(() => import("./pages/auth/Register")),
    AdminDashboard: lazy(() => import("./pages/AdminDashboard")),
    ClientDashboard: lazy(() => import("./pages/client/ClientDashboard")),
    VendorDashboard: lazy(() => import("./pages/vendor/VendorDashboard")),
    EmployeeDashboard: lazy(() => import("./pages/employee/EmployeeDashboard")),
    VendorAction: lazy(() => import("./pages/vendor/VendorAction")),
    NotFound: lazy(() => import("./pages/NotFound")),
    ProtectedRoute: lazy(() => import("./components/ProtectedRoute")),
    ResetPassword: lazy(() => import("./pages/ResetPassword")),
    PrivacyPolicy: lazy(() => import("./pages/PrivacyPolicy")),
    TermsOfService: lazy(() => import("./pages/TermsOfService")),
    EventCommandCenter: lazy(() => import("./pages/client/EventCommandCenter")),
    TrackDelivery: lazy(() => import("./pages/TrackDelivery")),
    QuoteAcceptance: lazy(() => import("./pages/QuoteAcceptance")),
    EventPlanner: lazy(() => import("./pages/EventPlanner")),
  };
}

const queryClient = new QueryClient();

const App = () => {
  const R = createLazyRoutes();

  return (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <AudioProvider>
          <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/home" element={<R.Index />} />
              {/* Redirects for removed pages */}
              <Route path="/services" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/portfolio" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/gallery/*" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/blog" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/blog/*" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/team" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/events/*" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/about" element={<R.About />} />
              <Route path="/faq" element={<R.FAQ />} />
              <Route path="/ecommerce" element={<R.Ecommerce />} />
              <Route path="/ecommerce/orders" element={<R.EcommerceOrders />} />
              <Route path="/ecommerce/track" element={<R.TrackOrder />} />
              <Route path="/ecommerce/:id" element={<R.ProductDetail />} />
              <Route path="/cart" element={<R.Cart />} />
              <Route path="/event-planner" element={<R.EventPlanner />} />
              <Route path="/privacy-policy" element={<R.PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<R.TermsOfService />} />
              <Route path="/quote/:token" element={<R.QuoteAcceptance />} />

              {/* Auth Routes */}
              <Route path="/auth" element={<R.Auth />} />
              <Route path="/auth/register" element={<R.Register />} />
              <Route path="/reset-password" element={<R.ResetPassword />} />

              {/* Protected Routes */}
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <R.ProtectedRoute allowedRoles={["admin"]}>
                      <R.AdminDashboard />
                    </R.ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/client/dashboard"
                element={
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <R.ProtectedRoute allowedRoles={["client"]}>
                      <R.ClientDashboard />
                    </R.ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/my-event/:bundleOrderId"
                element={
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <R.ProtectedRoute allowedRoles={["client"]}>
                      <R.EventCommandCenter />
                    </R.ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/track-delivery/:deliveryOrderId"
                element={
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <R.ProtectedRoute allowedRoles={["client"]}>
                      <R.TrackDelivery />
                    </R.ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/vendor/dashboard"
                element={
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <R.ProtectedRoute allowedRoles={["vendor"]}>
                      <R.VendorDashboard />
                    </R.ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/employee/dashboard"
                element={
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <R.ProtectedRoute allowedRoles={["employee"]}>
                      <R.EmployeeDashboard />
                    </R.ProtectedRoute>
                  </Suspense>
                }
              />

              <Route path="/vendor/action" element={<R.VendorAction />} />
              <Route path="*" element={<R.NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </AudioProvider>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ThemeProvider>
  );
};

export default App;
