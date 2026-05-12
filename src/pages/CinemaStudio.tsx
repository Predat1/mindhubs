import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video, Sparkles, Send, Settings,
  Loader2, Paperclip, X, Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getModelById, type VideoModelMode } from "@/constants/videoModels";
import { useCredits } from "@/hooks/useCredits";
import { useAntiPiracy } from "@/hooks/useAntiPiracy";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ChatMessage, { type ChatMsg } from "@/components/cinema/ChatMessage";
import ModelSelector from "@/components/cinema/ModelSelector";
import PreferencesPanel from "@/components/cinema/PreferencesPanel";

// ─── Quick recipe chips ───
const QUICK_RECIPES = [
  { label: "🎤 UGC Témoignage", prompt: "Crée une vidéo UGC témoignage client authentique pour mon produit avec un hook percutant dans les 3 premières secondes et un CTA clair." },
  { label: "📱 Reel TikTok", prompt: "Crée un Reel TikTok vertical 9:16 de 15 secondes avec un hook d'1 seconde, trend-native, pour promouvoir mon produit." },
  { label: "🎥 Pub Cinématique", prompt: "Crée une publicité vidéo cinématique premium style brand film avec storytelling émotionnel pour ma marque." },
  { label: "📦 Démo Produit", prompt: "Crée une vidéo démo/showcase de mon produit digital avec une présentation dynamique de ses fonctionnalités clés." },
  { label: "⚡ Before/After", prompt: "Crée une vidéo publicitaire Before/After transformation avec split-screen montrant le problème puis la solution." },
  { label: "🚨 Promo Flash", prompt: "Crée une vidéo promo flash urgente avec compte à rebours, offre limitée, et CTA direct pour Facebook Ads." },
  { label: "🎬 Explainer", prompt: "Crée une vidéo explicative motion graphics qui présente le processus ou les étapes de mon offre de façon claire et engageante." },
  { label: "🔄 Retargeting", prompt: "Crée une vidéo de retargeting pour rappeler aux visiteurs de revenir acheter, avec objection-killer et preuve sociale." },
  { label: "📺 YouTube Pre-roll", prompt: "Crée une pub YouTube pre-roll de 6 secondes non-skippable avec un message ultra-condensé et mémorable." },
  { label: "🇫🇧 Pub Facebook 4:5", prompt: "Crée une pub Facebook Ads au format 4:5 optimisée conversion, avec hook 3 secondes et CTA fort." },
];

const CinemaStudioInner = ({ vendor }: { vendor: any }) => {
  useAntiPiracy();
  const { balance: credits } = useCredits(vendor?.id);

  // Chat state
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bienvenue dans Cinema Studio AI ! 🎬\n\nDécrivez la vidéo publicitaire que vous souhaitez créer. Je suis expert en tous les formats : UGC, pub cinématique, démo produit, retargeting, et bien plus.\n\nVous pouvez aussi utiliser les suggestions rapides ci-dessous, ou attacher une image pour la transformer en vidéo.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("auto");
  const [videoMode, setVideoMode] = useState<VideoModelMode>("text-to-video");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showPrefs, setShowPrefs] = useState(false);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingRef.current).forEach(clearInterval);
    };
  }, []);

  // ─── Image attachment ───
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Fichier image requis."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
      setVideoMode("image-to-video");
    };
    reader.readAsDataURL(file);
  };

  // ─── Poll video job ───
  const pollJob = useCallback(async (jobId: string, msgId: string) => {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || ""}/functions/v1/generate-video?action=status&job_id=${jobId}`,
        { headers: { Authorization: `Bearer ${session?.access_token || ""}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "" } }
      );
      if (!resp.ok) return;
      const job = await resp.json();

      if (job.status === "completed" && job.result_url) {
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, videoUrl: job.result_url, videoStatus: "completed" } : m
        ));
        setIsGenerating(false);
        clearInterval(pollingRef.current[jobId]);
        delete pollingRef.current[jobId];
      } else if (job.status === "failed") {
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, videoStatus: "failed" } : m
        ));
        setIsGenerating(false);
        clearInterval(pollingRef.current[jobId]);
        delete pollingRef.current[jobId];
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, []);

  // ─── Generate video via fal.ai ───
  const generateVideo = useCallback(async (toolCall: any) => {
    const model = getModelById(toolCall.model_id);
    if (!model) { toast.error("Modèle introuvable."); return; }
    if (credits < model.creditCost) { toast.error("Crédits insuffisants."); return; }

    const videoMsgId = `video-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: videoMsgId,
      role: "video",
      content: "",
      videoStatus: "processing",
      videoJobId: videoMsgId,
      modelId: toolCall.model_id,
      modelName: model.name,
      reasoning: toolCall.reasoning,
      timestamp: Date.now(),
    }]);
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: {
          modelId: toolCall.model_id,
          falEndpoint: model.falEndpoint,
          prompt: toolCall.refined_prompt,
          duration: toolCall.duration,
          aspectRatio: toolCall.aspect_ratio,
          imageUrl: attachedImage || undefined,
          vendorId: vendor?.id,
        },
      });

      if (error || data?.error) throw new Error(data?.error || error?.message || "Erreur");

      const jobId = data.jobId;
      // Update message with real job ID
      setMessages(prev => prev.map(m =>
        m.id === videoMsgId ? { ...m, videoJobId: jobId } : m
      ));

      // Start polling
      pollingRef.current[jobId] = setInterval(() => pollJob(jobId, videoMsgId), 5000);

      setAttachedImage(null);
    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === videoMsgId ? { ...m, videoStatus: "failed" } : m
      ));
      setIsGenerating(false);
      toast.error(err.message || "Erreur de génération.");
    }
  }, [credits, vendor, attachedImage, pollJob]);

  // ─── Send chat message ───
  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg && !attachedImage) return;

    const userMsg: ChatMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: msg,
      imageUrl: attachedImage || undefined,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Build chat history for API
    const chatHistory = messages
      .filter(m => m.role === "user" || m.role === "assistant")
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }));
    chatHistory.push({ role: "user", content: msg });

    try {
      const { data, error } = await supabase.functions.invoke("cinema-chat", {
        body: {
          messages: chatHistory,
          vendorId: vendor?.id,
          selectedModel: selectedModel,
        },
      });

      setIsTyping(false);

      if (error || data?.error) throw new Error(data?.error || error?.message || "Erreur IA");

      // Add AI response
      if (data.message) {
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.message,
          reasoning: data.toolCall?.reasoning,
          timestamp: Date.now(),
        }]);
      }

      // If AI wants to generate video
      if (data.toolCall?.model_id && data.toolCall?.refined_prompt) {
        await generateVideo(data.toolCall);
      }

    } catch (err: any) {
      setIsTyping(false);
      toast.error(err.message || "Erreur de communication avec l'IA.");
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Désolé, une erreur est survenue. Veuillez réessayer.",
        timestamp: Date.now(),
      }]);
    }
  };

  // ─── Rate video ───
  const handleRate = async (jobId: string, rating: number) => {
    await supabase.from("video_jobs").update({ rating }).eq("id", jobId);
    toast.success("Merci pour votre avis !");
  };

  // ─── Regenerate ───
  const handleRegenerate = (jobId: string) => {
    handleSend("Régénère cette vidéo avec un style différent et un prompt amélioré.");
  };

  return (
    <DashboardLayout variant="vendor" title="Cinema Studio AI" shopName={vendor.shop_name}>
      <SEO title="Cinema Studio AI | MindHubs" description="Créez des publicités vidéo IA de qualité cinématique par chat conversationnel." />

      <div className="mx-auto max-w-3xl flex flex-col h-[calc(100vh-120px)]">

        {/* Header */}
        <div className="flex items-center justify-between px-2 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight">Cinema Studio AI</h1>
              <p className="text-[10px] text-muted-foreground">15 modèles vidéo · Tous formats publicitaires</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-xs font-bold border-white/10">
              <Coins className="w-3 h-3 text-primary" /> {credits} pts
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-lg"
              onClick={() => setShowPrefs(!showPrefs)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
          <AnimatePresence>
            {messages.map(msg => (
              <ChatMessage
                key={msg.id}
                msg={msg}
                onRate={handleRate}
                onRegenerate={handleRegenerate}
              />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2"
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-muted-foreground">L'IA réfléchit...</span>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Recipes (show only when chat is short) */}
        {messages.length <= 2 && (
          <div className="px-3 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_RECIPES.map(r => (
                <button
                  key={r.label}
                  onClick={() => handleSend(r.prompt)}
                  className="px-3 py-1.5 rounded-full bg-muted/40 border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 text-xs font-medium transition-all"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image attachment preview */}
        {attachedImage && (
          <div className="px-3 pb-1">
            <div className="relative inline-block">
              <img src={attachedImage} alt="Attached" className="h-16 rounded-lg border border-white/10" />
              <button
                onClick={() => { setAttachedImage(null); setVideoMode("text-to-video"); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="border-t border-white/5 px-3 py-3">
          <div className="flex items-end gap-2">
            {/* Image upload */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Model selector */}
            <ModelSelector
              selectedModel={selectedModel}
              mode={videoMode}
              onSelect={setSelectedModel}
              onModeChange={setVideoMode}
            />

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Décrivez votre vidéo publicitaire..."
                rows={1}
                className="w-full resize-none rounded-xl bg-muted/40 border border-white/10 focus:border-violet-500/30 px-4 py-2.5 text-sm outline-none transition-colors min-h-[40px] max-h-[120px]"
                style={{ height: "auto", overflow: "hidden" }}
                onInput={e => {
                  const el = e.target as HTMLTextAreaElement;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 120) + "px";
                }}
              />
            </div>

            {/* Send */}
            <Button
              size="icon"
              disabled={(!input.trim() && !attachedImage) || isTyping}
              onClick={() => handleSend()}
              className="h-9 w-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex-shrink-0"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Preferences Panel (slide-over) */}
      <PreferencesPanel
        vendorId={vendor?.id}
        open={showPrefs}
        onClose={() => setShowPrefs(false)}
      />
    </DashboardLayout>
  );
};

const CinemaStudio = () => (
  <VendorGuard>{(vendor) => <CinemaStudioInner vendor={vendor} />}</VendorGuard>
);

export default CinemaStudio;
