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

const mockChats = [
  { 
    id: "1", 
    name: "Moussa Diop", 
    lastMsg: "Bonjour, j'aimerais avoir plus d'infos sur le kit...", 
    time: "10:45", 
    unread: 2, 
    online: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa" 
  },
  { 
    id: "2", 
    name: "Awa Ndiaye", 
    lastMsg: "Paiement envoyé ! Merci beaucoup.", 
    time: "Hier", 
    unread: 0, 
    online: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Awa" 
  },
  { 
    id: "3", 
    name: "Bakary Sangare", 
    lastMsg: "Est-ce que la formation est à vie ?", 
    time: "Hier", 
    unread: 0, 
    online: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bakary" 
  },
  { 
    id: "4", 
    name: "Fatou Traore", 
    lastMsg: "Je n'arrive pas à télécharger le PDF.", 
    time: "2 j", 
    unread: 0, 
    online: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou" 
  },
];

const mockMessages = [
  { id: "1", sender: "user", text: "Bonjour, j'aimerais avoir plus d'infos sur le kit business immobilier.", time: "10:40" },
  { id: "2", sender: "me", text: "Bonjour Moussa ! Bien sûr, c'est un kit complet avec contrats types et stratégie de prospection.", time: "10:42" },
  { id: "3", sender: "user", text: "Génial. Est-ce que les contrats sont valables au Sénégal ?", time: "10:43" },
  { id: "4", sender: "me", text: "Oui, ils ont été relus par un expert juridique local. Vous avez également une version modifiable.", time: "10:44" },
  { id: "5", sender: "user", text: "D'accord, je vais passer commande tout de suite. Merci !", time: "10:45" },
];

import type { Vendor } from "@/hooks/useVendors";

const VendorMessagesInner = ({ vendor }: { vendor: Vendor }) => {
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);
  const [msgInput, setMsgInput] = useState("");

  const handleSend = () => {
    if (!msgInput.trim()) return;
    // Mock send logic
    setMsgInput("");
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
              {mockChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChat.id === chat.id ? "bg-primary/20 border border-primary/20" : "hover:bg-white/5 border border-transparent"}`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border border-white/10">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>{chat.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold truncate">{chat.name}</span>
                      <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate font-medium">
                      {chat.lastMsg}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-[10px] font-black">
                      {chat.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main: Chat View */}
        <div className="flex-1 flex flex-col bg-background/10 relative">
          
          {/* Chat Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-background/40 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-white/5">
                <AvatarImage src={selectedChat.avatar} />
                <AvatarFallback>{selectedChat.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-bold">{selectedChat.name}</h3>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> En ligne
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
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex justify-center">
                <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aujourd'hui</span>
              </div>

              {mockMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] space-y-1`}>
                    <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.sender === "me" ? "bg-primary text-white rounded-tr-none" : "bg-card border border-white/5 rounded-tl-none"}`}>
                      {msg.text}
                    </div>
                    <div className={`flex items-center gap-1.5 px-1 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <span className="text-[9px] text-muted-foreground font-bold">{msg.time}</span>
                      {msg.sender === "me" && <CheckCheck size={12} className="text-primary" />}
                    </div>
                  </div>
                </div>
              ))}
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
                  disabled={!msgInput.trim()}
                  className="h-10 w-10 rounded-xl bg-primary text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:scale-100"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
            <p className="text-center text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
              Réponse rapide recommandée : les clients convertissent 3x plus s'ils reçoivent une réponse sous 15 min.
            </p>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

const VendorMessages = () => (
  <VendorGuard>{(vendor) => <VendorMessagesInner vendor={vendor} />}</VendorGuard>
);

export default VendorMessages;
