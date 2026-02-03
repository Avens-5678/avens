import { ReactNode, lazy, Suspense } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Lazy load non-critical UI elements
const AudioControls = lazy(() => import("@/components/Audio/AudioControls"));
const WhatsAppBot = lazy(() => import("@/components/ui/whatsapp-bot"));

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Suspense fallback={null}>
        <AudioControls />
        <WhatsAppBot />
      </Suspense>
    </div>
  );
};

export default Layout;