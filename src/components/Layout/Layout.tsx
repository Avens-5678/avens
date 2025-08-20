import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AudioControls from "@/components/Audio/AudioControls";
import MouseGlow from "@/components/ui/mouse-glow";
import WhatsAppBot from "@/components/ui/whatsapp-bot";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AudioControls />
      <MouseGlow />
      <WhatsAppBot />
    </div>
  );
};

export default Layout;