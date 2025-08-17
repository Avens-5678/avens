import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider } from "@/contexts/AudioContext";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import EventDetail from "./pages/EventDetail";
import Ecommerce from "./pages/Ecommerce";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import WeddingEvents from "./pages/events/WeddingEvents";
import CorporateEvents from "./pages/events/CorporateEvents";
import BirthdayParties from "./pages/events/BirthdayParties";
import EquipmentRental from "./pages/events/EquipmentRental";
import GovernmentEvents from "./pages/events/GovernmentEvents";
import Team from "./pages/Team";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AudioProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/gallery/:portfolioId" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/events/:eventType" element={<EventDetail />} />
          <Route path="/events/wedding" element={<WeddingEvents />} />
          <Route path="/events/corporate" element={<CorporateEvents />} />
          <Route path="/events/birthday" element={<BirthdayParties />} />
          <Route path="/events/equipment-rental" element={<EquipmentRental />} />
          <Route path="/events/government" element={<GovernmentEvents />} />
          <Route path="/ecommerce" element={<Ecommerce />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AudioProvider>
  </QueryClientProvider>
);

export default App;