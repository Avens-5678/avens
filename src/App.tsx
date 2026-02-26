import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider } from "@/contexts/AudioContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";
import EventDetail from "./pages/EventDetail";
import Ecommerce from "./pages/Ecommerce";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorAction from "./pages/vendor/VendorAction";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import CorporateEvents from "./pages/events/CorporateEvents";
import EquipmentRental from "./pages/events/EquipmentRental";
import GovernmentEvents from "./pages/events/GovernmentEvents";
import DynamicEventPage from "./pages/events/DynamicEventPage";
import Team from "./pages/Team";
import BlogPost from "./pages/BlogPost";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AudioProvider>
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
            <Route path="/cart" element={<Cart />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route 
              path="/client/dashboard" 
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendor/dashboard" 
              element={
                <ProtectedRoute allowedRoles={["vendor"]}>
                  <VendorDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/vendor/action" element={<VendorAction />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AudioProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;