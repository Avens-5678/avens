import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, X, User, ShoppingCart, Menu, Home, Briefcase, Image, Info, BookOpen, HelpCircle, Users, Package, ChevronRight, Clock, TrendingUp, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useUserRole } from "@/hooks/useUserRole";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface RentalItem {
  id: string;
  title: string;
  service_type: string;
  categories?: string[] | null;
  image_url?: string | null;
  short_description?: string | null;
}

interface EcommerceHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedSearchCategory: string;
  onSearchCategoryChange: (value: string) => void;
  allItems?: RentalItem[];
}

const RECENT_SEARCHES_KEY = "evnting_recent_searches";
const MAX_RECENT = 5;

const PLACEHOLDER_TEXTS = [
  "Search for LED walls, trusses, stages...",
  "Find banquet halls & venues near you...",
  "Hire event managers & decorators...",
  "Search sound systems & lighting...",
  "Explore tents, chairs & tables...",
  "Find photographers & videographers...",
];

const TRENDING_SEARCHES = [
  "LED Wall",
  "Truss System",
  "DJ Sound System",
  "Stage Platform",
  "Wedding Venue",
  "Flower Decorator",
  "AC Tent",
  "Projector",
];

const menuLinks = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/portfolio", label: "Portfolio", icon: Image },
  { href: "/ecommerce", label: "Rental", icon: Package },
  { href: "/about", label: "About", icon: Info },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/team", label: "Team", icon: Users },
];

const EcommerceHeader = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedSearchCategory,
  onSearchCategoryChange,
  allItems = [],
}: EcommerceHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useUserRole();
  const { items } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotating placeholder text
  useEffect(() => {
    if (searchTerm) return; // Don't rotate when user is typing
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
        setIsAnimating(false);
      }, 200);
    }, 3000);
    return () => clearInterval(interval);
  }, [searchTerm]);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Compute suggestions grouped by category
  const suggestions = useMemo(() => {
    if (!searchTerm.trim() || allItems.length === 0) return [];
    const term = searchTerm.toLowerCase();
    return allItems
      .filter((item) =>
        item.title.toLowerCase().includes(term) ||
        (item.categories || []).some((c) => c.toLowerCase().includes(term)) ||
        (item.short_description || "").toLowerCase().includes(term) ||
        item.service_type.toLowerCase().includes(term)
      )
      .slice(0, 8);
  }, [searchTerm, allItems]);

  const groupedSuggestions = useMemo(() => {
    const groups: Record<string, RentalItem[]> = {};
    suggestions.forEach((item) => {
      const cat = item.categories?.[0] || item.service_type || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [suggestions]);

  const flatSuggestions = useMemo(() => {
    const flat: { type: "item"; item: RentalItem }[] = [];
    Object.values(groupedSuggestions).forEach((items) => {
      items.forEach((item) => flat.push({ type: "item", item }));
    });
    return flat;
  }, [groupedSuggestions]);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((s) => s !== term)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSelect = useCallback((item: RentalItem) => {
    onSearchChange(item.title);
    saveRecentSearch(item.title);
    setShowDropdown(false);
    navigate(`/ecommerce/${item.id}`);
  }, [onSearchChange, saveRecentSearch, navigate]);

  const buildMarketplaceUrl = useCallback((term: string, category: string) => {
    const params = new URLSearchParams();
    if (term.trim()) params.set("search", term.trim());
    if (category) params.set("category", category);
    const query = params.toString();
    return query ? `/ecommerce?${query}` : "/ecommerce";
  }, []);

  const handleRecentClick = useCallback((term: string) => {
    onSearchChange(term);
    saveRecentSearch(term);
    setShowDropdown(false);
    navigate(buildMarketplaceUrl(term, selectedSearchCategory));
  }, [onSearchChange, saveRecentSearch, navigate, buildMarketplaceUrl, selectedSearchCategory]);

  const handleTrendingClick = useCallback((term: string) => {
    onSearchChange(term);
    saveRecentSearch(term);
    setShowDropdown(false);
    navigate(buildMarketplaceUrl(term, selectedSearchCategory));
  }, [onSearchChange, saveRecentSearch, navigate, buildMarketplaceUrl, selectedSearchCategory]);

  const handleSubmit = useCallback(() => {
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm.trim());
    }
    setShowDropdown(false);
    navigate(buildMarketplaceUrl(searchTerm, selectedSearchCategory));
  }, [searchTerm, saveRecentSearch, navigate, buildMarketplaceUrl, selectedSearchCategory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const total = flatSuggestions.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && flatSuggestions[selectedIndex]) {
        handleSelect(flatSuggestions[selectedIndex].item);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  }, [flatSuggestions, selectedIndex, handleSelect, handleSubmit]);

  const getDashboardPath = () => {
    switch (role) {
      case "admin": return "/admin";
      case "client": return "/client/dashboard";
      case "vendor": return "/vendor/dashboard";
      case "employee": return "/employee/dashboard";
      default: return "/auth";
    }
  };

  const showRecentView = showDropdown && !searchTerm.trim() && (recentSearches.length > 0 || TRENDING_SEARCHES.length > 0);
  const showSuggestionsView = showDropdown && searchTerm.trim().length > 0 && flatSuggestions.length > 0;

  return (
    <div className="bg-foreground text-primary-foreground sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Mobile: two rows */}
        <div className="sm:hidden">
          {/* Row 1: Hamburger + Logo + Cart/Account */}
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <button className="flex items-center justify-center hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded p-1.5 transition-all" aria-label="Menu">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 bg-foreground border-r border-white/10">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="p-5 border-b border-white/10">
                    <span className="text-primary-foreground text-xl font-brand font-bold italic tracking-tight uppercase">
                      Evnting<span className="text-secondary">.com</span>
                    </span>
                  </div>
                  <nav className="flex flex-col py-2">
                    {menuLinks.map(({ href, label, icon: Icon }) => (
                      <Link key={href} to={href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-5 py-3 text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/5 transition-all">
                        <span className="flex items-center gap-3"><Icon className="h-4 w-4" />{label}</span>
                        <ChevronRight className="h-4 w-4 opacity-30" />
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
                <span className="text-lg font-brand font-bold italic tracking-tight uppercase text-primary-foreground">
                  Evnting<span className="text-secondary">.com</span>
                </span>
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => navigate(getDashboardPath())} className="p-2 hover:bg-white/10 rounded transition-colors" aria-label="Account">
                <User className="h-5 w-5" />
              </button>
              <button onClick={() => navigate("/cart")} className="p-2 hover:bg-white/10 rounded transition-colors relative" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-secondary text-secondary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{items.length}</span>
                )}
              </button>
            </div>
          </div>
          {/* Row 2: Full-width search bar */}
          <div className="pb-2.5 relative" ref={dropdownRef}>
            <div className="flex w-full rounded-lg overflow-hidden bg-primary-foreground">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
                  value={searchTerm}
                  onChange={(e) => { onSearchChange(e.target.value); setShowDropdown(true); setSelectedIndex(-1); }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-4 py-2.5 text-foreground text-sm outline-none bg-transparent placeholder:text-muted-foreground transition-opacity ${isAnimating ? "placeholder:opacity-0" : "placeholder:opacity-100"}`}
                />
                {searchTerm && (
                  <button onClick={() => { onSearchChange(""); setShowDropdown(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button onClick={handleSubmit} className="bg-secondary hover:bg-secondary/90 px-4 flex items-center justify-center transition-colors">
                <Search className="h-5 w-5 text-secondary-foreground" />
              </button>
            </div>

            {/* Mobile dropdown */}
            {(showRecentView || showSuggestionsView) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl z-[60] max-h-[400px] overflow-y-auto">
                {showRecentView && (
                  <div className="p-3">
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-secondary" /> Trending Searches</p>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING_SEARCHES.map((term) => (
                          <button key={term} onClick={() => handleTrendingClick(term)} className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-primary/10 hover:text-primary rounded-full border border-border/50 transition-colors">{term}</button>
                        ))}
                      </div>
                    </div>
                    {recentSearches.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Recent Searches</p>
                        {recentSearches.map((term, i) => (
                          <button key={i} onClick={() => handleRecentClick(term)} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />{term}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {showSuggestionsView && (
                  <div className="py-2">
                    {(() => {
                      let idx = -1;
                      return Object.entries(groupedSuggestions).map(([category, items]) => (
                        <div key={category}>
                          <p className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="h-3 w-3" />in {category}</p>
                          {items.map((item) => {
                            idx++;
                            const currentIdx = idx;
                            return (
                              <button key={item.id} onClick={() => handleSelect(item)} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${currentIdx === selectedIndex ? "bg-secondary/10 text-foreground" : "text-foreground hover:bg-muted"}`}>
                                {item.image_url ? <img src={item.image_url} alt="" className="h-8 w-8 rounded object-cover flex-shrink-0" /> : <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0"><Search className="h-3.5 w-3.5 text-muted-foreground" /></div>}
                                <span className="truncate">{item.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop: single row */}
        <div className="hidden sm:flex items-center gap-4 h-16">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button className="flex items-center justify-center hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded p-1.5 transition-all" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              {/* Sheet content reused from mobile, but only one Sheet instance is open at a time */}
            </Sheet>
            <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
              <span className="text-xl font-brand font-bold italic tracking-tight uppercase text-primary-foreground">
                Evnting<span className="text-secondary">.com</span>
              </span>
            </button>
          </div>

          {/* Desktop search */}
          <div className="flex-1 flex items-center min-w-0 relative" ref={dropdownRef}>
            <div className="flex w-full rounded-lg overflow-hidden bg-primary-foreground">
              <select
                value={selectedSearchCategory}
                onChange={(e) => onSearchCategoryChange(e.target.value)}
                className="bg-muted text-foreground text-xs font-medium px-3 py-2 border-r border-border outline-none cursor-pointer hover:bg-muted/80 max-w-[140px]"
              >
                <option value="">All</option>
                {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
                  value={searchTerm}
                  onChange={(e) => { onSearchChange(e.target.value); setShowDropdown(true); setSelectedIndex(-1); }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-4 py-2.5 text-foreground text-sm outline-none bg-transparent placeholder:text-muted-foreground transition-opacity ${isAnimating ? "placeholder:opacity-0" : "placeholder:opacity-100"}`}
                />
                {searchTerm && (
                  <button onClick={() => { onSearchChange(""); setShowDropdown(false); }} className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button onClick={handleSubmit} className="bg-secondary hover:bg-secondary/90 px-4 flex items-center justify-center transition-colors">
                <Search className="h-5 w-5 text-secondary-foreground" />
              </button>
            </div>

            {/* Desktop dropdown */}
            {(showRecentView || showSuggestionsView) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl z-[60] max-h-[400px] overflow-y-auto">
                {showRecentView && (
                  <div className="p-3">
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-secondary" /> Trending Searches</p>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING_SEARCHES.map((term) => (
                          <button key={term} onClick={() => handleTrendingClick(term)} className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-primary/10 hover:text-primary rounded-full border border-border/50 transition-colors">{term}</button>
                        ))}
                      </div>
                    </div>
                    {recentSearches.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Recent Searches</p>
                        {recentSearches.map((term, i) => (
                          <button key={i} onClick={() => handleRecentClick(term)} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />{term}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {showSuggestionsView && (
                  <div className="py-2">
                    {(() => {
                      let idx = -1;
                      return Object.entries(groupedSuggestions).map(([category, items]) => (
                        <div key={category}>
                          <p className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="h-3 w-3" />in {category}</p>
                          {items.map((item) => {
                            idx++;
                            const currentIdx = idx;
                            return (
                              <button key={item.id} onClick={() => handleSelect(item)} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${currentIdx === selectedIndex ? "bg-secondary/10 text-foreground" : "text-foreground hover:bg-muted"}`}>
                                {item.image_url ? <img src={item.image_url} alt="" className="h-8 w-8 rounded object-cover flex-shrink-0" /> : <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0"><Search className="h-3.5 w-3.5 text-muted-foreground" /></div>}
                                <span className="truncate">{item.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop right actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => navigate(getDashboardPath())} className="flex items-center gap-1.5 text-xs hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded px-2 py-1.5 transition-all">
              <User className="h-5 w-5" />
              <div className="text-left hidden lg:block">
                <span className="block text-[10px] text-primary-foreground/60 leading-none">{user ? "Hello" : "Hello, Sign in"}</span>
                <span className="block font-semibold text-primary-foreground leading-tight">Account</span>
              </div>
            </button>
            <button onClick={() => navigate("/ecommerce/orders")} className="flex items-center gap-1.5 text-xs hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded px-2 py-1.5 transition-all">
              <div className="text-left">
                <span className="block text-[10px] text-primary-foreground/60 leading-none">Your</span>
                <span className="block font-semibold text-primary-foreground leading-tight">Orders</span>
              </div>
            </button>
            <button onClick={() => navigate("/cart")} className="flex items-center gap-1 hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded px-2 py-1.5 transition-all relative">
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{items.length}</span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcommerceHeader;
