import { useState } from "react";
import { Bell, ShoppingBag, CreditCard, MessageSquare, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useVendorNotifications, type VendorNotification } from "@/hooks/useVendorNotifications";
import { Badge } from "@/components/ui/badge";
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
      case "sale": return <ShoppingBag size={14} className="text-emerald-500" />;
      case "payout": return <CreditCard size={14} className="text-blue-500" />;
      case "system": return <Info size={14} className="text-amber-500" />;
      case "subscription": return <CheckCircle size={14} className="text-purple-500" />;
      default: return <Bell size={14} className="text-muted-foreground" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <Bell size={20} className="text-zinc-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-zinc-950">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 glass-card border-white/10 text-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="text-xs font-black uppercase tracking-widest">Notifications</h3>
          {unreadCount > 0 && (
            <button 
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
            <div className="p-12 text-center text-zinc-500 space-y-2">
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
                className={`flex gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
              >
                <div className={`mt-1 w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-white/5 border border-white/5`}>
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black leading-tight">{n.title}</p>
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">{n.message}</p>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">{getRelativeTime(n.created_at)}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="p-2 bg-white/5 border-t border-white/5">
           <Button asChild variant="ghost" className="w-full h-8 text-[9px] font-black uppercase tracking-widest">
              <Link to="/dashboard/messages">Voir les messages</Link>
           </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
