import React, { useState, useRef } from "react";
import { Bold, Italic, List, Heading, Sparkles, Loader2, Eye, Edit3, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

    setLoading(true);
    let hint = "";

    if (mode === "generate") {
      const styleName = AI_STYLES.find(s => s.value === aiStyle)?.label || "Classique";
      hint = `Rédige une description vendeuse pour ce produit en utilisant le framework / style suivant : ${styleName}. Utilise du formatage Markdown (Gras, listes à puces) pour aérer le texte.`;
    } else if (mode === "embellish") {
      hint = `Améliore, corrige les fautes, ajoute des emojis pertinents et aère cette description existante en utilisant du formatage Markdown (Gras, listes). Ne change pas le sens profond. Voici le texte : \n\n${value}`;
    }

    try {
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
    </div>
  );
};
