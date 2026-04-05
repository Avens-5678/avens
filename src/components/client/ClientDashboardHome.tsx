import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CalendarDays, Package, Star, IndianRupee, Search, ClipboardList, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  onTabChange: (tab: string) => void;
}

const ClientDashboardHome = ({ onTabChange }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState({ active: 0, spent: 0, upcoming: 0, reviews: 0 });
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      const today = new Date().toISOString().split("T")[0];

      const [profileRes, activeRes, spentRes, upcomingRes, reviewsRes, bookingsRes] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url").eq("user_id", user.id).maybeSingle(),
        supabase.from("rental_orders").select("id", { count: "exact", head: true }).eq("client_id", user.id).in("status", ["confirmed", "active"]),
        supabase.from("rental_orders").select("vendor_quote_amount").eq("client_id", user.id).eq("status", "completed"),
        supabase.from("rental_orders").select("id", { count: "exact", head: true }).eq("client_id", user.id).gte("event_date", today),
        supabase.from("rental_reviews").select("id", { count: "exact", head: true }).eq("reviewer_email", user.email || ""),
        supabase.from("rental_orders").select("id, title, equipment_category, event_date, status, created_at").eq("client_id", user.id).gte("event_date", today).order("event_date", { ascending: true }).limit(3),
      ]);

      setProfile(profileRes.data);
      const totalSpent = (spentRes.data || []).reduce((s: number, r: any) => s + (r.vendor_quote_amount || 0), 0);
      setMetrics({
        active: activeRes.count || 0,
        spent: totalSpent,
        upcoming: upcomingRes.count || 0,
        reviews: reviewsRes.count || 0,
      });
      setUpcomingBookings(bookingsRes.data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
      setLoading(false);
    }
    };
    load();
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const metricCards = [
    { label: "Active bookings", value: metrics.active, Icon: Package, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
    { label: "Total spent", value: `\u20B9${metrics.spent.toLocaleString("en-IN")}`, Icon: IndianRupee, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { label: "Upcoming events", value: metrics.upcoming, Icon: CalendarDays, color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
    { label: "Reviews given", value: metrics.reviews, Icon: Star, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  ];

  const quickActions = [
    { label: "Browse vendors", Icon: Search, onClick: () => navigate("/ecommerce") },
    { label: "My bookings", Icon: ClipboardList, onClick: () => onTabChange("events") },
    { label: "Get help", Icon: MessageCircle, onClick: () => window.open("https://wa.me/919849085678", "_blank") },
  ];

  const statusColor = (s: string) => {
    if (["confirmed", "active"].includes(s)) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s === "pending") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
        <div className="h-48 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-destructive mb-2">Failed to load dashboard</p>
        <button onClick={() => window.location.reload()} className="text-xs text-primary hover:text-primary/80">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
          ) : (
            firstName.charAt(0).toUpperCase()
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-card border border-border/60 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-2.5`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-card border border-border/60 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-foreground">Upcoming bookings</h3>
          <button onClick={() => onTabChange("events")} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            View all &rarr;
          </button>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">No upcoming bookings</p>
            <p className="text-xs text-muted-foreground mt-1">Plan your next event on Evnting</p>
            <button
              onClick={() => navigate("/ecommerce")}
              className="mt-4 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Browse vendors &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {booking.title || booking.equipment_category || "Booking"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {booking.event_date
                      ? new Date(booking.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "Date TBD"}
                  </p>
                </div>
                <Badge className={`text-[10px] capitalize ${statusColor(booking.status)}`}>
                  {booking.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map(({ label, Icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-col items-center gap-2 p-4 bg-card border border-border/60 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <Icon className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium text-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClientDashboardHome;
