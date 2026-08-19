import { useState } from "react";
import { Bell, ShoppingBag, CreditCard, CheckCircle, Info, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useVendorNotifications, type VendorNotification } from "@/hooks/useVendorNotifications";
import { Button } from "@/components/ui/button";

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
};

export const VendorNotificationBell = ({ vendorId }: { vendorId: string }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useVendorNotifications(vendorId);
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case "sale": return <ShoppingBag size={14} className="text-success" />;
      case "payout": return <CreditCard size={14} className="text-info" />;
      case "system": return <Info size={14} className="text-warning" />;
      case "subscription": return <CheckCircle size={14} className="text-brand-magenta" />;
      default: return <Bell size={14} className="text-muted-foreground" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} non lues` : "Notifications"}
          className="relative grid size-10 place-items-center rounded-xl border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell size={20} className="text-muted-foreground" />
          {unreadCount > 0 && (
            <span aria-live="polite" aria-atomic="true" className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full border-2 border-background bg-primary text-[9px] font-black text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 glass-card border-border text-foreground rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h3 className="text-xs font-black uppercase tracking-widest">Notifications</h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()} 
              className="text-[9px] font-black uppercase text-primary hover:underline"
            >
              Tout marquer lu
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" size={20} /></div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <Bell size={32} className="mx-auto opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">Aucune notification</p>
            </div>
          ) : (
            notifications.map((n) => (
              <Link 
                key={n.id} 
                to={n.link || "#"} 
                onClick={() => {
                  markAsRead(n.id);
                  setIsOpen(false);
                }}
                className={`flex gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
              >
                <div className="mt-1 w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-muted/50 border border-border">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black leading-tight">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">{n.message}</p>
                  <p className="text-[9px] text-subtle font-black uppercase tracking-tighter">{getRelativeTime(n.created_at)}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="p-2 bg-muted/30 border-t border-border">
           <Button asChild variant="ghost" className="w-full h-8 text-[9px] font-black uppercase tracking-widest">
              <Link to="/dashboard/messages">Voir les messages</Link>
           </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
