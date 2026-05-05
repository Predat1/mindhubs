import { useState, useRef, useEffect } from "react";
import { Search, MessageSquare, User, Store, Clock, Eye, Trash2, ShieldAlert } from "lucide-react";
import { useAllChats, useChatMessages, Chat } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const AdminMessagesTab = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: chats = [], isLoading: isLoadingChats } = useAllChats();
  const { data: messages = [], isLoading: isLoadingMessages } = useChatMessages(selectedChat?.id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredChats = chats.filter(chat => 
    chat.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "HH:mm", { locale: fr });
    } catch {
      return "";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM", { locale: fr });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Supervision des Messages</h2>
          <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">Audit des conversations Marketplace</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <ShieldAlert size={16} />
          <span className="text-[10px] font-bold uppercase">Mode Modérateur Actif</span>
        </div>
      </div>

      <div className="h-[650px] flex overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur-xl shadow-sm">
        
        {/* Sidebar: Chat List */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-border bg-muted/5">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input 
                placeholder="Rechercher vendeur ou client..." 
                className="pl-9 rounded-xl border-border bg-background/50" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {isLoadingChats ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Chargement des conversations...</div>
              ) : filteredChats.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Aucune conversation trouvée.</div>
              ) : filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedChat?.id === chat.id ? "bg-primary/10 border border-primary/20 shadow-inner" : "hover:bg-muted/30 border border-transparent"}`}
                >
                  <div className="flex -space-x-3 relative">
                    <Avatar className="h-10 w-10 border-2 border-background ring-1 ring-border">
                      <AvatarImage src={chat.customer_avatar || ""} />
                      <AvatarFallback>{chat.customer_name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-10 w-10 border-2 border-background ring-1 ring-border">
                      <AvatarImage src={chat.vendor_avatar || ""} />
                      <AvatarFallback>{chat.vendor_name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold truncate">{chat.customer_name} ↔ {chat.vendor_name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                      {chat.last_message || "Nouvelle discussion"}
                    </p>
                    <span className="text-[9px] text-muted-foreground font-bold">{formatDate(chat.updated_at)}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main: Chat View */}
        <div className="flex-1 flex flex-col bg-background/10 relative">
          
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/40 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-primary" />
                    <span className="text-sm font-black">{selectedChat.customer_name}</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Store size={14} className="text-accent" />
                    <span className="text-sm font-black">{selectedChat.vendor_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-bold gap-2">
                    <Eye size={12} /> Voir Profil
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-6">
                  {isLoadingMessages ? (
                    <div className="text-center text-sm text-muted-foreground py-10">Chargement des messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-10 italic">Discussion vide.</div>
                  ) : (
                    messages.map((msg) => {
                      const isVendor = msg.sender_id === selectedChat.vendor_id;
                      const senderName = isVendor ? selectedChat.vendor_name : selectedChat.customer_name;
                      
                      return (
                        <div key={msg.id} className={`flex ${isVendor ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] space-y-1`}>
                            <div className="flex items-center gap-2 px-1">
                               <span className={`text-[9px] font-black uppercase tracking-tighter ${isVendor ? "text-accent" : "text-primary"}`}>
                                 {senderName}
                               </span>
                            </div>
                            <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm border ${isVendor ? "bg-accent/5 border-accent/20 rounded-tr-none" : "bg-primary/5 border-primary/20 rounded-tl-none text-foreground"}`}>
                              {msg.content}
                            </div>
                            <div className={`flex items-center gap-1.5 px-1 ${isVendor ? "justify-end" : "justify-start"}`}>
                              <span className="text-[9px] text-muted-foreground font-bold">{formatTime(msg.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-center">
                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Consultation uniquement — Lecture seule pour les administrateurs</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
               <div className="h-24 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                 <MessageSquare size={48} className="text-primary/40" />
               </div>
               <h3 className="text-xl font-bold text-foreground">Supervision des Echanges</h3>
               <p className="max-w-md">Sélectionnez une conversation pour auditer les échanges entre clients et vendeurs.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminMessagesTab;
