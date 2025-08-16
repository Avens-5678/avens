import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AudioControls from "@/components/Audio/AudioControls";

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
    </div>
  );
};

export default Layout;