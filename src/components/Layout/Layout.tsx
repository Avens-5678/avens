import { ReactNode, lazy, Suspense } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBar from "./AnnouncementBar";
import { useSEODefaults } from "@/hooks/useSEODefaults";

// Lazy load non-critical UI elements
const AudioControls = lazy(() => import("@/components/Audio/AudioControls"));

interface LayoutProps {
  children: ReactNode;
  hideNavbar?: boolean;
}

const Layout = ({ children, hideNavbar }: LayoutProps) => {
  useSEODefaults();
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <AnnouncementBar />}
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      <Footer />
      <Suspense fallback={null}>
        <AudioControls />
      </Suspense>
    </div>
  );
};

export default Layout;