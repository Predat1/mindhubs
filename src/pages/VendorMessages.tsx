import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import { 
  Search, 
  Send, 
  MoreVertical, 
  User, 
  Clock, 
  CheckCheck,
  Filter,
  MessageSquare,
  Package,
  ExternalLink,
  ChevronRight,
  Smile,
  Paperclip,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Chat {
  id: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  lastProductViewed?: string;
}

const DUMMY_CHATS: Chat[] = [
  { id: "1", userName: "Awa Diop", lastMessage: "Est-ce que le guide inclut des templates Notion ?", timestamp: "10:45", unread: 2, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Awa", lastProductViewed: "Pack Digital Business SN" },
  { id: "2", userName: "Jean-Marc Koffi", lastMessage: "Merci pour les conseils, ça marche super !", timestamp: "Hier", unread: 0, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean", lastProductViewed: "Formation Facebook Ads Elite" },
  { id: "3", userName: "Mariam Traoré", lastMessage: "Je n'arrive pas à télécharger le PDF.", timestamp: "Hier", unread: 1, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariam", lastProductViewed: "Checklist E-commerce CI" },
];

const VendorMessages = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(DUMMY_CHATS[0].id);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedChat = useMemo(() => DUMMY_CHATS.find(c => c.id === selectedChatId), [selectedChatId]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    toast.success("Message envoyé à " + selectedChat?.userName);
    setMessage("");
  };

  return (
    <VendorGuard>
      {(vendor) => (
        <DashboardLayout variant="vendor" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
          <div className="h-[calc(100vh-160px)] flex gap-6 animate-in fade-in duration-500">
            
            {/* Sidebar: Chats List */}
            <Card className="w-80 md:w-96 flex flex-col border-border/60 bg-card/40 backdrop-blur-xl overflow-hidden rounded-3xl shadow-xl">
               <div className="p-4 border-b border-border/50 space-y-4">
                  <div className="flex items-center justify-between">
                     <h2 className="text-xl font-black flex items-center gap-2">
                        <MessageSquare className="text-primary" size={20} /> Inbox
                     </h2>
                     <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><Filter size={16} /></Button>
                  </div>
                  <div className="relative">
                     <Input 
                       placeholder="Rechercher un client..." 
                       className="pl-9 h-10 rounded-2xl bg-muted/30 border-none"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                     />
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
                  {DUMMY_CHATS.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`w-full p-4 flex items-start gap-4 transition-all hover:bg-primary/5 border-l-4 ${
                        selectedChatId === chat.id ? "bg-primary/10 border-primary" : "border-transparent"
                      }`}
                    >
                       <div className="relative shrink-0">
                          <div className="h-12 w-12 rounded-2xl bg-muted overflow-hidden border border-border">
                             <img src={chat.avatar} alt={chat.userName} />
                          </div>
                          {chat.unread > 0 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-card">
                               {chat.unread}
                            </div>
                          )}
                       </div>
                       <div className="flex-1 text-left min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <h4 className="text-sm font-bold truncate">{chat.userName}</h4>
                             <span className="text-[10px] text-muted-foreground font-medium">{chat.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate leading-relaxed">{chat.lastMessage}</p>
                       </div>
                    </button>
                  ))}
               </div>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col border-border/60 bg-card/40 backdrop-blur-xl overflow-hidden rounded-3xl shadow-xl relative">
               {selectedChat ? (
                 <>
                   {/* Chat Header */}
                   <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-muted overflow-hidden border border-border">
                            <img src={selectedChat.avatar} alt={selectedChat.userName} />
                         </div>
                         <div>
                            <h3 className="text-sm font-bold leading-none">{selectedChat.userName}</h3>
                            <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> En ligne
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon" className="rounded-full h-9 w-9"><ExternalLink size={16} /></Button>
                         <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-destructive hover:bg-destructive/10"><Trash2 size={16} /></Button>
                         <Button variant="ghost" size="icon" className="rounded-full h-9 w-9"><MoreVertical size={16} /></Button>
                      </div>
                   </div>

                   {/* Messages Thread */}
                   <div className="flex-1 overflow-y-auto p-6 space-y-6 [scrollbar-width:thin]">
                      <div className="text-center">
                         <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-border/50">CONVERSATION DÉBUTÉE LE 24 AVRIL</Badge>
                      </div>

                      {/* User Message */}
                      <div className="flex justify-start max-w-2xl">
                         <div className="bg-muted p-4 rounded-3xl rounded-bl-none border border-border/50 space-y-2">
                            <p className="text-sm leading-relaxed">{selectedChat.lastMessage}</p>
                            <span className="text-[9px] text-muted-foreground block text-right">10:45</span>
                         </div>
                      </div>

                      {/* Vendor Message (Mock) */}
                      <div className="flex justify-end ml-auto max-w-2xl">
                         <div className="bg-primary p-4 rounded-3xl rounded-br-none text-primary-foreground space-y-2 shadow-lg shadow-primary/20">
                            <p className="text-sm leading-relaxed">Bonjour ! Oui, absolument. Le guide comprend un espace Notion complet avec tous les trackers inclus.</p>
                            <div className="flex items-center justify-end gap-1 text-[9px] text-primary-foreground/70">
                               10:48 <CheckCheck size={10} />
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Input Area */}
                   <div className="p-4 border-t border-border bg-muted/20">
                      <div className="flex items-center gap-3">
                         <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground shrink-0"><Paperclip size={18} /></Button>
                         <div className="flex-1 relative">
                            <Input 
                              placeholder="Écrivez votre réponse..." 
                              className="h-12 pl-4 pr-12 rounded-2xl bg-background border-border/60 focus-visible:ring-primary/20"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"><Smile size={18} /></Button>
                         </div>
                         <Button className="h-12 w-12 rounded-2xl shrink-0 btn-glow" onClick={handleSendMessage}>
                            <Send size={18} />
                         </Button>
                      </div>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground"><MessageSquare size={32} /></div>
                    <h3 className="text-xl font-black">Sélectionnez une conversation</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">Répondez à vos futurs clients pour booster vos taux de conversion.</p>
                 </div>
               )}

               {/* Right Overlay: Product Context (Desktop only) */}
               {selectedChat && selectedChat.lastProductViewed && (
                 <div className="absolute top-20 right-4 w-64 hidden 2xl:block space-y-4 animate-in slide-in-from-right duration-500">
                    <Card className="p-4 bg-primary/5 border-primary/20 space-y-3 shadow-lg">
                       <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1">
                          <Package size={12} /> Produit Consulté
                       </p>
                       <div className="aspect-video rounded-xl bg-muted overflow-hidden relative border border-border">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                       </div>
                       <h4 className="text-xs font-bold leading-tight line-clamp-2">{selectedChat.lastProductViewed}</h4>
                       <Button variant="outline" size="sm" className="w-full h-8 text-[10px] rounded-lg">Voir le produit</Button>
                    </Card>
                 </div>
               )}
            </Card>

          </div>
        </DashboardLayout>
      )}
    </VendorGuard>
  );
};

export default VendorMessages;
