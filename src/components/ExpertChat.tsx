import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Smile, 
  MoreVertical, 
  Check, 
  CheckCheck,
  Zap,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "vendor";
  timestamp: Date;
}

interface Props {
  vendorName: string;
  vendorUsername: string;
  vendorAvatar?: string | null;
}

const ExpertChat = ({ vendorName, vendorUsername, vendorAvatar }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Bonjour ! Je suis ${vendorName}. Comment puis-je vous aider dans votre projet aujourd'hui ?`,
      sender: "vendor",
      timestamp: new Date(),
    }
  ]);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

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

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate Vendor Auto-Reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: "Merci pour votre message ! Je vous réponds dès que je suis disponible sur WhatsApp ou ici-même.",
        sender: "vendor",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
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
              className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin]"
            >
               <div className="text-center py-4">
                  <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground border-border/50">AUJOURD'HUI</Badge>
               </div>
               
               {messages.map((msg) => (
                 <motion.div
                   initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   key={msg.id}
                   className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                 >
                   <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                     msg.sender === "user" 
                       ? "bg-primary text-primary-foreground rounded-br-none shadow-md" 
                       : "bg-muted text-foreground rounded-bl-none border border-border/50"
                   }`}>
                      {msg.text}
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                         {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         {msg.sender === "user" && <CheckCheck size={10} />}
                      </div>
                   </div>
                 </motion.div>
               ))}
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
                  />
                  <Button size="icon" className="rounded-full shrink-0 h-10 w-10 btn-glow" onClick={handleSend}>
                     <Send size={18} />
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
             <div className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-background animate-bounce">1</div>
             
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
