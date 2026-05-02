import React, { useState, useRef } from "react";
import { Bold, Italic, List, Heading, Sparkles, Loader2, Eye, Edit3, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/hooks/useCredits";
import { useCurrentVendor } from "@/hooks/useVendors";
import { CREDIT_COSTS } from "@/constants/credits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Wallet, AlertCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RichDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  category: string;
}

const AI_STYLES = [
  { value: "classic", label: "Classique" },
  { value: "aida", label: "AIDA (Attention, Intérêt, Désir, Action)" },
  { value: "pas", label: "PAS (Problème, Agitation, Solution)" },
  { value: "storytelling", label: "Storytelling" },
  { value: "bullets", label: "Liste d'avantages courts" },
];

const parseMarkdown = (text: string) => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^### (.*$)/gim, "<h3 class='text-lg font-bold mt-4 mb-2 text-foreground'>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2 class='text-xl font-bold mt-5 mb-2 text-foreground'>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1 class='text-2xl font-bold mt-6 mb-3 text-foreground'>$1</h1>")
    .replace(/^\- (.*$)/gim, "<li class='ml-5 list-disc mb-1'>$1</li>")
    .replace(/\n\n/g, "</p><p class='mb-3'>")
    .replace(/\n/g, "<br />");
  
  // Clean up loose list items
  html = html.replace(/(<li.*<\/li>)/g, "<ul class='mb-3'>$1</ul>");
  html = html.replace(/<\/ul><ul class='mb-3'>/g, "");

  return `<p class='mb-3'>${html}</p>`;
};

export const RichDescriptionEditor: React.FC<RichDescriptionEditorProps> = ({ value, onChange, title, category }) => {
  const [aiStyle, setAiStyle] = useState("classic");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const { data: vendor } = useCurrentVendor();
  const { balance: credits, spend } = useCredits(vendor?.id);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [pendingMode, setPendingMode] = useState<"generate" | "embellish" | null>(null);

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleGenerateAI = async (mode: "generate" | "embellish") => {
    if (title.trim().length < 3) {
      toast.error("Titre requis", { description: "Saisissez d'abord le titre du produit." });
      return;
    }

    const cost = CREDIT_COSTS['description'];
    if (credits < cost) {
      setShowInsufficient(true);
      return;
    }

    setPendingMode(mode);
    setShowConfirm(true);
  };

  const confirmGenerateAI = async () => {
    if (!pendingMode) return;
    setShowConfirm(false);
    setLoading(true);
    const mode = pendingMode;
    const cost = CREDIT_COSTS['description'];

    try {
      const res = await spend({ amount: cost, description: `Génération description IA (${mode}): ${title}`, featureType: 'description' }) as any;
      if (res && !res.success) {
        toast.error("Erreur crédits: " + (res.error || 'Erreur inconnue'));
        return;
      }

      let hint = "";

      if (mode === "generate") {
        const styleName = AI_STYLES.find(s => s.value === aiStyle)?.label || "Classique";
        hint = `Rédige une description vendeuse pour ce produit en utilisant le framework / style suivant : ${styleName}. Utilise du formatage Markdown (Gras, listes à puces) pour aérer le texte.`;
      } else if (mode === "embellish") {
        hint = `Améliore, corrige les fautes, ajoute des emojis pertinents et aère cette description existante en utilisant du formatage Markdown (Gras, listes). Ne change pas le sens profond. Voici le texte : \n\n${value}`;
      }

      const { data, error } = await supabase.functions.invoke("generate-product-description", {
        body: { title, category, hint },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      onChange((data as any).description);
      toast.success(mode === "generate" ? "Description générée ✨" : "Description embellie ✨");
      setView("edit");
    } catch (e: any) {
      toast.error("Erreur IA", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* AI Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Wand2 size={16} className="text-primary hidden sm:block" />
          <Select value={aiStyle} onValueChange={setAiStyle}>
            <SelectTrigger className="h-8 text-xs w-[180px] bg-background">
              <SelectValue placeholder="Style IA" />
            </SelectTrigger>
            <SelectContent>
              {AI_STYLES.map(s => (
                <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex w-full sm:w-auto gap-2">
          {value.trim().length > 0 ? (
            <Button
              type="button"
              size="sm"
              onClick={() => handleGenerateAI("embellish")}
              disabled={loading}
              className="h-8 gap-1.5 flex-1 sm:flex-none btn-glow"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
              Embellir le texte
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => handleGenerateAI("generate")}
              disabled={loading || title.trim().length < 3}
              className="h-8 gap-1.5 flex-1 sm:flex-none btn-glow"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
              Générer la description
            </Button>
          )}
        </div>
      </div>

      {/* Editor Frame */}
      <div className="rounded-xl border border-border overflow-hidden bg-card focus-within:border-primary/50 transition-colors">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border">
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertText("**", "**")} title="Gras">
              <Bold size={14} />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertText("*", "*")} title="Italique">
              <Italic size={14} />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertText("## ", "")} title="Titre">
              <Heading size={14} />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertText("- ", "")} title="Liste">
              <List size={14} />
            </Button>
          </div>
          <div className="flex bg-background rounded-md border border-border p-0.5">
            <button
              type="button"
              onClick={() => setView("edit")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-sm transition ${view === "edit" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Edit3 size={12} /> Éditer
            </button>
            <button
              type="button"
              onClick={() => setView("preview")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-sm transition ${view === "preview" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Eye size={12} /> Aperçu Live
            </button>
          </div>
        </div>

        {/* Content Area */}
        {view === "edit" ? (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-0 focus-visible:ring-0 resize-y min-h-[200px] rounded-none bg-transparent p-4 text-sm"
            placeholder="Décrivez votre produit... Vous pouvez utiliser le markdown (**gras**, - liste) ou l'IA."
          />
        ) : (
          <div className="min-h-[200px] p-5 text-sm text-muted-foreground bg-background/50 prose prose-sm dark:prose-invert max-w-none leading-relaxed">
            {value.trim() ? (
              <div dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }} />
            ) : (
              <p className="opacity-50 italic text-center mt-10">L'aperçu apparaîtra ici...</p>
            )}
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground text-right px-1">
        💡 Astuce : Remplissez le titre puis cliquez sur "Générer" pour avoir une base de travail.
      </p>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-card border-white/10 text-white rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Zap size={32} className="text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter">Confirmation</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-center">
              La génération par IA va consommer <span className="text-white font-black">{CREDIT_COSTS['description']} crédits</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white/5 p-4 rounded-2xl space-y-3">
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Solde actuel</span>
                <span className="font-bold">{credits} crédits</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Solde après</span>
                <span className="font-bold text-primary">{credits - CREDIT_COSTS['description']} crédits</span>
             </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={confirmGenerateAI} className="w-full h-12 rounded-xl btn-glow font-black uppercase text-xs">Confirmer & Générer</Button>
            <Button variant="ghost" onClick={() => setShowConfirm(false)} className="w-full h-12 rounded-xl font-bold text-xs uppercase">Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insufficient Credits Dialog */}
      <Dialog open={showInsufficient} onOpenChange={setShowInsufficient}>
        <DialogContent className="glass-card border-destructive/20 text-white rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4 text-destructive">
              <AlertCircle size={32} />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter">Crédits insuffisants</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-center">
              Votre solde actuel ({credits} crédits) est trop bas pour utiliser l'IA.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => { setShowInsufficient(false); navigate('/dashboard/abonnement'); }} className="w-full h-12 rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase text-xs gap-2">
               <Wallet size={16} /> Recharger maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
