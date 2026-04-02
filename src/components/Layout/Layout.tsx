import { ReactNode, lazy, Suspense } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Lazy load non-critical UI elements to avoid circular init in main bundle
const AudioControls = lazy(() => import("@/components/Audio/AudioControls"));
const AnnouncementBar = lazy(() => import("./AnnouncementBar"));

interface LayoutProps {
  children: ReactNode;
  hideNavbar?: boolean;
}

const Layout = ({ children, hideNavbar }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && (
        <Suspense fallback={null}>
          <AnnouncementBar />
        </Suspense>
      )}
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
