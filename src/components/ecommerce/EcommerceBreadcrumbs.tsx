import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface EcommerceBreadcrumbsProps {
  activeCategory?: string;
  searchTerm?: string;
}

const EcommerceBreadcrumbs = ({ activeCategory, searchTerm }: EcommerceBreadcrumbsProps) => (
  <nav className="flex items-center gap-1.5 text-xs text-muted-foreground py-3">
    <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
      <Home className="h-3 w-3" />
      Home
    </Link>
    <ChevronRight className="h-3 w-3" />
    <Link to="/ecommerce" className="hover:text-primary transition-colors">Equipment Rental</Link>
    {activeCategory && (
      <>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{activeCategory}</span>
      </>
    )}
    {searchTerm && (
      <>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">"{searchTerm}"</span>
      </>
    )}
  </nav>
);

export default EcommerceBreadcrumbs;
