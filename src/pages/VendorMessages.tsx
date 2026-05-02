import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { 
  Search, MessageSquare, Send, MoreVertical, Phone, Info, 
  CheckCheck, Clock, User, Filter, Paperclip, Smile, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { useVendorChats, useChatMessages, useSendMessage, Chat } from "@/hooks/useMessages";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { Vendor } from "@/hooks/useVendors";

const VendorMessagesInner = ({ vendor }: { vendor: Vendor }) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: chats = [], isLoading: isLoadingChats } = useVendorChats(vendor.id);
  const { data: messages = [], isLoading: isLoadingMessages } = useChatMessages(selectedChat?.id);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!msgInput.trim() || !selectedChat) return;
    sendMessage({ chatId: selectedChat.id, content: msgInput.trim(), senderId: vendor.user_id }, {
      onSuccess: () => setMsgInput("")
    });
  };

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
    <DashboardLayout variant="vendor" title="Messages" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
      <SEO title="Messages — Inbox Expert" description="Gérez vos leads et répondez à vos clients." path="/dashboard/messages" />

      <div className="h-[calc(100vh-160px)] flex overflow-hidden rounded-2xl border border-white/5 bg-card/50 backdrop-blur-xl shadow-2xl">
        
        {/* Sidebar: Chat List */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-white/5 bg-background/20">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight">Inbox Expert</h2>
              <Button variant="ghost" size="icon" className="rounded-xl"><Filter size={18} /></Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input placeholder="Rechercher une conversation..." className="pl-9 rounded-xl border-white/5 bg-background/40" />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {isLoadingChats ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Chargement des conversations...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Aucune conversation pour le moment.</div>
              ) : chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChat?.id === chat.id ? "bg-primary/20 border border-primary/20" : "hover:bg-white/5 border border-transparent"}`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border border-white/10">
                      <AvatarImage src={chat.customer_avatar || ""} />
                      <AvatarFallback>{chat.customer_name?.slice(0, 2) || "CL"}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold truncate">{chat.customer_name}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(chat.updated_at)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate font-medium">
                      {chat.last_message || "Nouvelle discussion"}
                    </p>
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
              <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-background/40 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-white/5">
                    <AvatarImage src={selectedChat.customer_avatar || ""} />
                    <AvatarFallback>{selectedChat.customer_name?.slice(0, 2) || "CL"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold">{selectedChat.customer_name}</h3>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
                      En ligne
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="rounded-xl"><Phone size={18} /></Button>
                  <Button variant="ghost" size="icon" className="rounded-xl"><Info size={18} /></Button>
                  <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical size={18} /></Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
                <div className="space-y-6">
                  {isLoadingMessages ? (
                    <div className="text-center text-sm text-muted-foreground py-10">Chargement des messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-10">Aucun message pour le moment. Envoyez un message pour démarrer la discussion !</div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === vendor.user_id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] space-y-1`}>
                            <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm ${isMe ? "bg-primary text-white rounded-tr-none" : "bg-card border border-white/5 rounded-tl-none"}`}>
                              {msg.content}
                            </div>
                            <div className={`flex items-center gap-1.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                              <span className="text-[9px] text-muted-foreground font-bold">{formatTime(msg.created_at)}</span>
                              {isMe && <CheckCheck size={12} className="text-primary" />}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 bg-background/40 border-t border-white/5 backdrop-blur-md">
                <div className="max-w-4xl mx-auto flex items-end gap-3 bg-card border border-white/5 rounded-2xl p-2 focus-within:border-primary/50 transition-all">
                  <div className="flex items-center gap-1 pb-1 px-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"><Paperclip size={18} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"><ImageIcon size={18} /></Button>
                  </div>
                  <textarea
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Écrivez votre message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 resize-none min-h-[40px] max-h-[120px] custom-scrollbar outline-none"
                  />
                  <div className="flex items-center gap-1 pb-1 px-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"><Smile size={18} /></Button>
                    <Button 
                      onClick={handleSend}
                      disabled={!msgInput.trim() || isSending}
                      className="h-10 w-10 rounded-xl bg-primary text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
                    >
                      {isSending ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
               <div className="h-24 w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                 <MessageSquare size={48} className="text-white/20" />
               </div>
               <h3 className="text-xl font-bold text-white">Vos Messages</h3>
               <p className="max-w-md">Sélectionnez une conversation sur la gauche pour commencer à discuter avec vos clients ou autres vendeurs.</p>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

const VendorMessages = () => (
  <VendorGuard>{(vendor) => <VendorMessagesInner vendor={vendor} />}</VendorGuard>
);

export default VendorMessages;
