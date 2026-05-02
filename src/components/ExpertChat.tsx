import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  CheckCheck,
  Zap,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCreateOrGetChat, useChatMessages, useSendMessage, Chat } from "@/hooks/useMessages";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  vendorId: string;
  vendorName: string;
  vendorUsername: string;
  vendorAvatar?: string | null;
}

const ExpertChat = ({ vendorId, vendorName, vendorUsername, vendorAvatar }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  const { mutateAsync: createOrGetChat } = useCreateOrGetChat();
  const { data: messages = [], isLoading: isLoadingMessages } = useChatMessages(activeChat?.id);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  useEffect(() => {
    // Si le chat est ouvert et qu'on a un utilisateur, on initialise la discussion côté base de données
    if (isOpen && user && !activeChat) {
      createOrGetChat({ vendorId, userId: user.id })
        .then((chat) => setActiveChat(chat))
        .catch((err) => {
          console.error("Impossible d'initialiser le chat :", err);
          toast.error("Erreur de connexion au chat.");
        });
    }
  }, [isOpen, user, activeChat, vendorId, createOrGetChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!message.trim()) return;
    if (!user) {
      toast.error("Veuillez vous connecter pour discuter avec l'expert.");
      return;
    }
    if (!activeChat) {
      toast.error("Connexion en cours, veuillez patienter...");
      return;
    }

    sendMessage({ chatId: activeChat.id, content: message.trim(), senderId: user.id }, {
      onSuccess: () => setMessage("")
    });
  };

  const formatTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "HH:mm", { locale: fr });
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card border border-border shadow-2xl rounded-3xl w-[350px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-accent text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
                       {vendorAvatar ? <img src={vendorAvatar} alt={vendorName} className="h-full w-full object-cover" /> : vendorName[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-primary" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold leading-none">{vendorName}</h4>
                    <p className="text-[10px] opacity-80 mt-1 flex items-center gap-1">
                       <Zap size={10} fill="currentColor" /> Répond généralement en 1h
                    </p>
                 </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-8 w-8" onClick={() => setIsOpen(false)}>
                 <X size={18} />
              </Button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin] bg-muted/10"
            >
               <div className="text-center py-4">
                  <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground border-border/50">CONVERSATION PRIVÉE</Badge>
               </div>
               
               {!user ? (
                 <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-70">
                   <MessageSquare size={32} className="text-muted-foreground" />
                   <p className="text-sm text-muted-foreground">Vous devez vous connecter pour envoyer un message à cet expert.</p>
                 </div>
               ) : isLoadingMessages ? (
                 <div className="text-center text-sm text-muted-foreground py-10">Chargement...</div>
               ) : messages.length === 0 ? (
                 <div className="text-center text-sm text-muted-foreground py-10 bg-card rounded-xl border border-border/50 p-4">
                   Dites bonjour à {vendorName} ! Les messages sont sécurisés et directs.
                 </div>
               ) : (
                 messages.map((msg) => {
                   const isMe = msg.sender_id === user?.id;
                   return (
                     <motion.div
                       initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       key={msg.id}
                       className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                     >
                       <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                         isMe 
                           ? "bg-primary text-primary-foreground rounded-br-none shadow-md" 
                           : "bg-card text-foreground rounded-bl-none border border-border/50 shadow-sm"
                       }`}>
                          {msg.content}
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                             {formatTime(msg.created_at)}
                             {isMe && <CheckCheck size={10} />}
                          </div>
                       </div>
                     </motion.div>
                   )
                 })
               )}
            </div>

            {/* Chat Footer */}
            <div className="p-4 border-t border-border bg-muted/20">
               <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Posez votre question..." 
                    className="rounded-full bg-background border-border/60 focus-visible:ring-primary/20"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={!user || isSending}
                  />
                  <Button size="icon" className="rounded-full shrink-0 h-10 w-10 btn-glow" onClick={handleSend} disabled={!user || !message.trim() || isSending}>
                     {isSending ? <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Send size={18} />}
                  </Button>
               </div>
               <p className="text-[9px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                  <Info size={10} /> Vos messages sont sécurisés par Mindhubs
               </p>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 btn-glow group relative"
          >
             <MessageSquare size={28} />
             
             {/* Tooltip */}
             <div className="absolute right-20 bg-card border border-border px-3 py-2 rounded-xl text-xs font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                Chatter avec {vendorName}
             </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpertChat;
