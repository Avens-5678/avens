import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  hideNavbar?: boolean;
}

// IMPORTANT: Do NOT use React.lazy() or dynamic import() here.
// Layout is in its own Vite chunk and React.lazy causes __vite_preload
// to be imported from the index chunk before it's initialized,
// crashing with "Cannot access '_' before initialization".
// These components are small — eager import is fine.

const Layout = ({ children, hideNavbar }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
