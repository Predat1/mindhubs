import { motion } from "framer-motion";
import { Bot, User, Sparkles } from "lucide-react";
import VideoResult from "./VideoResult";

export interface ChatMsg {
  id: string;
  role: "user" | "assistant" | "video" | "system";
  content: string;
  videoUrl?: string;
  videoJobId?: string;
  videoStatus?: "processing" | "completed" | "failed";
  modelId?: string;
  modelName?: string;
  reasoning?: string;
  imageUrl?: string;
  timestamp: number;
}

interface ChatMessageProps {
  msg: ChatMsg;
  onRate?: (jobId: string, rating: number) => void;
  onRegenerate?: (jobId: string) => void;
}

const ChatMessage = ({ msg, onRate, onRegenerate }: ChatMessageProps) => {
  const isUser = msg.role === "user";
  const isVideo = msg.role === "video";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser
          ? "bg-primary/20 text-primary"
          : "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-400"
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        {isVideo && msg.videoJobId ? (
          <VideoResult
            jobId={msg.videoJobId}
            videoUrl={msg.videoUrl}
            status={msg.videoStatus || "processing"}
            modelName={msg.modelName}
            reasoning={msg.reasoning}
            onRate={onRate}
            onRegenerate={onRegenerate}
          />
        ) : (
          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted/60 backdrop-blur-sm border border-white/5 text-foreground rounded-tl-sm"
          }`}>
            {msg.role === "assistant" && msg.reasoning && (
              <div className="flex items-center gap-1.5 text-xs text-violet-400 mb-2 pb-2 border-b border-white/5">
                <Sparkles className="w-3 h-3" />
                <span>{msg.reasoning}</span>
              </div>
            )}
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="Uploaded"
                className="rounded-lg mb-2 max-h-48 object-cover"
              />
            )}
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        )}

        <span className="text-[10px] text-muted-foreground mt-1 px-1">
          {new Date(msg.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
