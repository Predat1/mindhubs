import { useState, useEffect } from "react";
import { Bell, Package, Info, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GlobalNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  created_at: string;
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
};

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("global_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (data) {
        setNotifications(data);
        calculateUnread(data);
      }
    };

    fetchNotifications();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("public:global_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "global_notifications" },
        (payload) => {
          const newNotif = payload.new as GlobalNotification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
          
          toast.info(newNotif.title, {
            description: newNotif.message,
            icon: <Bell className="text-primary animate-pulse" size={16} />,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const calculateUnread = (notifs: GlobalNotification[]) => {
    try {
      const lastRead = localStorage.getItem("last_notification_read_at");
      if (!lastRead) {
        setUnreadCount(notifs.length);
        return;
      }
      const lastReadDate = new Date(lastRead);
      const unread = notifs.filter(n => new Date(n.created_at) > lastReadDate).length;
      setUnreadCount(unread);
    } catch {
      setUnreadCount(notifs.length);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && notifications.length > 0) {
      setUnreadCount(0);
      localStorage.setItem("last_notification_read_at", new Date().toISOString());
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_product": return <Package size={16} className="text-blue-500" />;
      case "success": return <CheckCircle size={16} className="text-emerald-500" />;
      case "warning": return <AlertCircle size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-primary" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="relative h-10 w-10 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-all border border-white/5">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white shadow-sm ring-2 ring-background animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden shadow-2xl rounded-2xl border-border/60 z-[100]">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
          <h3 className="font-bold text-sm">Notifications</h3>
          <span className="text-xs text-muted-foreground">{notifications.length} alerte(s)</span>
        </div>
        <div className="max-h-[350px] overflow-y-auto [scrollbar-width:thin]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
              <Bell size={24} className="opacity-20" />
              <p className="text-xs">Aucune notification pour le moment.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <Link
                  key={notif.id}
                  to={notif.link || "#"}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 transition border-b border-border/50 last:border-0"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="mt-0.5 shrink-0 h-8 w-8 rounded-full bg-background flex items-center justify-center border border-border shadow-sm">
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold leading-none">{notif.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium pt-1">
                      {getRelativeTime(notif.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
