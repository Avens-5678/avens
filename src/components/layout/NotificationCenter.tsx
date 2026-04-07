import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell, Package, IndianRupee, Truck, MessageSquare,
  Star, Gift, Tag, AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS: Record<string, { icon: any; color: string }> = {
  order_update: { icon: Package, color: "text-blue-500" },
  payment: { icon: IndianRupee, color: "text-emerald-500" },
  delivery: { icon: Truck, color: "text-indigo-500" },
  chat: { icon: MessageSquare, color: "text-primary" },
  review: { icon: Star, color: "text-amber-500" },
  promotion: { icon: Tag, color: "text-pink-500" },
  system: { icon: Bell, color: "text-muted-foreground" },
  bundle_update: { icon: Gift, color: "text-teal-500" },
  low_stock: { icon: AlertTriangle, color: "text-red-500" },
  task_due: { icon: Clock, color: "text-orange-500" },
};

const NotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (!user) return null;

  const handleClick = (n: { id: string; data: any; is_read: boolean }) => {
    if (!n.is_read) markAsRead(n.id);
    const link = n.data?.link;
    if (link) navigate(link);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/8 rounded-xl">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-0.5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0 rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-[10px] text-primary hover:underline">Mark all read</button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="h-6 w-6 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => {
                const typeInfo = TYPE_ICONS[n.type] || TYPE_ICONS.system;
                const Icon = typeInfo.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${!n.is_read ? "bg-primary/[0.03]" : ""}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${!n.is_read ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`h-3.5 w-3.5 ${!n.is_read ? typeInfo.color : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-medium truncate ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                          {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
