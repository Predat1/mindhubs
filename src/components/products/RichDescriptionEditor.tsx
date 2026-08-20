import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle, ArrowDown, ArrowUp, Bold, CheckCircle2, ChevronDown, Edit3, Eye, HelpCircle,
  Heading2, Highlighter, ImagePlus, Italic, Layers3, Link, List, ListOrdered, Loader2,
  MessageCircle, Minus, MousePointerClick, Palette, Plus, Quote, Sparkles, Star, Trash2,
  Underline, Upload, Wand2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProductContentRenderer } from "@/components/products/ProductContentRenderer";
import {
  CalloutBlock, ProductContentBlock, ProductContentBlockType, contentToPlainText, createBlockId,
  createInitialContentBlocks, markdownToHtml, parseProductContent, serializeProductContent,
} from "@/lib/productContent";
import { MINDHUBS_COLORS } from "@/lib/design-tokens";

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

const BLOCK_OPTIONS: Array<{ type: ProductContentBlockType; label: string; icon: React.ElementType }> = [
  { type: "richText", label: "Texte riche", icon: Edit3 },
  { type: "image", label: "Image", icon: ImagePlus },
  { type: "testimonial", label: "Preuve sociale", icon: MessageCircle },
  { type: "callout", label: "Encadré", icon: Quote },
  { type: "button", label: "Bouton", icon: MousePointerClick },
  { type: "faq", label: "FAQ", icon: HelpCircle },
  { type: "divider", label: "Séparateur", icon: Minus },
  { type: "spacer", label: "Espace", icon: Layers3 },
];

const createBlock = (type: ProductContentBlockType): ProductContentBlock => {
  const id = createBlockId();
  switch (type) {
    case "richText": return { id, type, html: "<p>Commencez à raconter la transformation promise à votre client…</p>" };
    case "image": return { id, type, url: "", alt: "", caption: "" };
    case "testimonial": return { id, type, quote: "Cette ressource m'a vraiment aidé à passer à l'action.", name: "Nom du client", role: "", avatarUrl: "", rating: 5, verified: true };
    case "callout": return { id, type, title: "Une information importante", body: "Ajoutez ici un message qui rassure ou met en avant votre offre.", tone: "yellow" };
    case "button": return { id, type, label: "Je veux commencer", url: "#achat", variant: "primary" };
    case "faq": return { id, type, question: "Cette offre est-elle faite pour moi ?", answer: "Répondez ici aux objections les plus fréquentes de vos visiteurs." };
    case "divider": return { id, type };
    case "spacer": return { id, type, size: "md" };
  }
};

export const RichDescriptionEditor: React.FC<RichDescriptionEditorProps> = ({ value, onChange, title, category }) => {
  const [blocks, setBlocks] = useState<ProductContentBlock[]>(() => parseProductContent(value) || createInitialContentBlocks(value));
  const [aiStyle, setAiStyle] = useState("classic");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [showBlocks, setShowBlocks] = useState(false);
  const lastExternalValue = useRef(value);

  useEffect(() => {
    if (value === lastExternalValue.current) return;
    setBlocks(parseProductContent(value) || createInitialContentBlocks(value));
    lastExternalValue.current = value;
  }, [value]);

  const plainText = useMemo(() => contentToPlainText(blocks), [blocks]);

  const updateBlocks = (next: ProductContentBlock[]) => {
    setBlocks(next);
    const serialized = serializeProductContent(next);
    lastExternalValue.current = serialized;
    onChange(serialized);
  };

  const updateBlock = (id: string, patch: Partial<ProductContentBlock>) => {
    updateBlocks(blocks.map((block) => block.id === id ? { ...block, ...patch } as ProductContentBlock : block));
  };

  const removeBlock = (id: string) => updateBlocks(blocks.filter((block) => block.id !== id));
  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    updateBlocks(next);
  };

  const addBlock = (type: ProductContentBlockType) => {
    updateBlocks([...blocks, createBlock(type)]);
    setShowBlocks(false);
  };

  const uploadImage = async (blockId: string, file: File, field: "url" | "avatarUrl" = "url") => {
    if (!file.type.startsWith("image/")) {
      toast.error("Format invalide", { description: "Sélectionnez une image JPG, PNG ou WebP." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop lourde", { description: "La taille maximale est de 5 Mo." });
      return;
    }

    try {
      const { data: auth } = await supabase.auth.getUser();
      const path = `${auth.user?.id || "anon"}/products/content/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "-")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      updateBlock(blockId, field === "avatarUrl" ? { avatarUrl: data.publicUrl } : { url: data.publicUrl });
      toast.success(field === "avatarUrl" ? "Photo du témoignage ajoutée" : "Image ajoutée au contenu");
    } catch (error) {
      toast.error("Erreur d'upload", { description: (error as Error).message });
    }
  };

  const handleGenerateAI = async (mode: "generate" | "embellish") => {
    if (title.trim().length < 3) {
      toast.error("Titre requis", { description: "Saisissez d'abord le titre du produit." });
      return;
    }
    setLoading(true);
    try {
      const styleName = AI_STYLES.find((style) => style.value === aiStyle)?.label || "Classique";
      const hint = mode === "generate"
        ? `Rédige une description vendeuse pour ce produit avec le style ${styleName}. Utilise du Markdown (gras et listes).`
        : `Améliore, corrige et aère cette description avec du Markdown sans changer son sens :\n\n${plainText}`;
      const { data, error } = await supabase.functions.invoke("generate-product-description", { body: { title, category, hint } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const generated = (data as any).description || "";
      const firstText = blocks.find((block): block is Extract<ProductContentBlock, { type: "richText" }> => block.type === "richText");
      const next = firstText
        ? blocks.map((block) => block.id === firstText.id ? { ...block, html: markdownToHtml(generated) } : block)
        : [{ id: createBlockId(), type: "richText" as const, html: markdownToHtml(generated) }, ...blocks];
      updateBlocks(next);
      toast.success(mode === "generate" ? "Description générée ✨" : "Description embellie ✨");
      setView("preview");
    } catch (error) {
      toast.error("Erreur IA", { description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-foreground"><Sparkles size={16} className="text-primary" /> Page de vente enrichie</div>
            <p className="mt-1 text-xs text-muted-foreground">Ajoutez des sections, images, preuves sociales et appels à l’action sans coder.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={aiStyle} onValueChange={setAiStyle}><SelectTrigger className="h-9 w-[180px] bg-background text-xs"><SelectValue placeholder="Style IA" /></SelectTrigger><SelectContent>{AI_STYLES.map((style) => <SelectItem key={style.value} value={style.value} className="text-xs">{style.label}</SelectItem>)}</SelectContent></Select>
            <Button type="button" size="sm" onClick={() => handleGenerateAI(plainText ? "embellish" : "generate")} disabled={loading || title.trim().length < 3} className="gap-1.5 btn-glow">
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}{plainText ? "Embellir avec l'IA" : "Générer avec l'IA"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-border bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground"><Layers3 size={15} className="text-primary" /> {blocks.length} bloc{blocks.length > 1 ? "s" : ""}</div>
        <div className="flex rounded-lg border border-border bg-background p-0.5">
          <button type="button" onClick={() => setView("edit")} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${view === "edit" ? "bg-muted text-foreground" : "text-muted-foreground"}`}><Edit3 size={13} /> Éditer</button>
          <button type="button" onClick={() => setView("preview")} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${view === "preview" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><Eye size={13} /> Aperçu live</button>
        </div>
      </div>

      {view === "edit" ? (
        <div className="space-y-3 rounded-b-2xl border-x border-b border-border bg-card p-3 md:p-4">
          {blocks.map((block, index) => (
            <BlockEditor key={block.id} block={block} index={index} total={blocks.length} onChange={updateBlock} onMove={moveBlock} onRemove={removeBlock} onUpload={uploadImage} />
          ))}
          <div className="relative pt-1">
            <Button type="button" variant="outline" onClick={() => setShowBlocks((value) => !value)} className="w-full gap-2 rounded-xl border-dashed"><Plus size={16} /> Ajouter un bloc</Button>
            {showBlocks && <div className="absolute bottom-full left-0 z-20 mb-2 grid w-full grid-cols-2 gap-2 rounded-2xl border border-border bg-background p-3 shadow-xl sm:grid-cols-4">{BLOCK_OPTIONS.map((option) => { const Icon = option.icon; return <button type="button" key={option.type} onClick={() => addBlock(option.type)} className="flex flex-col items-center gap-2 rounded-xl p-3 text-center text-xs font-semibold text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"><Icon size={18} className="text-primary" />{option.label}</button>; })}</div>}
          </div>
        </div>
      ) : (
        <div className="rounded-b-2xl border-x border-b border-border bg-background p-5 md:p-8"><ProductContentRenderer blocks={blocks} preview /></div>
      )}

      <p className="px-1 text-[11px] text-muted-foreground">💡 Le contenu est enregistré dans votre produit. Vous pouvez le réordonner et le prévisualiser avant publication.</p>

    </div>
  );
};

interface BlockEditorProps {
  block: ProductContentBlock;
  index: number;
  total: number;
  onChange: (id: string, patch: Partial<ProductContentBlock>) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onUpload: (id: string, file: File, field?: "url" | "avatarUrl") => void;
}

const BlockEditor = ({ block, index, total, onChange, onMove, onRemove, onUpload }: BlockEditorProps) => {
  const label = BLOCK_OPTIONS.find((option) => option.type === block.type)?.label || "Bloc";
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2"><div className="flex items-center gap-2 text-xs font-bold"><span className="rounded-md bg-primary/15 px-2 py-1 text-primary">{index + 1}</span>{label}</div><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => onMove(index, -1)}><ArrowUp size={14} /></Button><Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === total - 1} onClick={() => onMove(index, 1)}><ArrowDown size={14} /></Button><Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onRemove(block.id)}><Trash2 size={14} /></Button></div></div>
      <div className="p-3 md:p-4">
        {block.type === "richText" && <RichTextBlock block={block} onChange={onChange} />}
        {block.type === "image" && <ImageBlockEditor block={block} onChange={onChange} onUpload={onUpload} />}
        {block.type === "testimonial" && <TestimonialEditor block={block} onChange={onChange} onUpload={onUpload} />}
        {block.type === "callout" && <CalloutEditor block={block} onChange={onChange} />}
        {block.type === "button" && <ButtonEditor block={block} onChange={onChange} />}
        {block.type === "faq" && <FaqEditor block={block} onChange={onChange} />}
        {block.type === "divider" && <p className="py-3 text-center text-sm text-muted-foreground">Une séparation légère sera affichée entre vos sections.</p>}
        {block.type === "spacer" && <div className="flex items-center gap-3"><span className="text-sm font-medium">Hauteur de l'espace</span><Select value={block.size} onValueChange={(size: "sm" | "md" | "lg") => onChange(block.id, { size })}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sm">Petite</SelectItem><SelectItem value="md">Moyenne</SelectItem><SelectItem value="lg">Grande</SelectItem></SelectContent></Select></div>}
      </div>
    </section>
  );
};

const RichTextBlock = ({ block, onChange }: { block: Extract<ProductContentBlock, { type: "richText" }>; onChange: BlockEditorProps["onChange"] }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtml = useRef<string | null>(null);
  const [color, setColor] = useState(MINDHUBS_COLORS.text);
  useEffect(() => {
    if (!editorRef.current || lastHtml.current === block.html || document.activeElement === editorRef.current) return;
    editorRef.current.innerHTML = block.html;
    lastHtml.current = block.html;
  }, [block.html]);
  const exec = (command: string, value?: string) => { editorRef.current?.focus(); document.execCommand(command, false, value); if (editorRef.current) onChange(block.id, { html: editorRef.current.innerHTML }); };
  const setLink = () => { const url = window.prompt("Lien URL"); if (url) exec("createLink", url); };
  return <div className="overflow-hidden rounded-xl border border-border"><div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 p-2"><ToolbarButton label="Gras" onClick={() => exec("bold")}><Bold size={15} /></ToolbarButton><ToolbarButton label="Italique" onClick={() => exec("italic")}><Italic size={15} /></ToolbarButton><ToolbarButton label="Souligné" onClick={() => exec("underline")}><Underline size={15} /></ToolbarButton><ToolbarButton label="Surligner" onClick={() => exec("hiliteColor", "#B8F4FF")}><Highlighter size={15} /></ToolbarButton><div className="mx-1 h-5 w-px bg-border" /><Select onValueChange={(value) => exec("formatBlock", value)}><SelectTrigger className="h-8 w-28 text-xs"><Heading2 size={14} className="mr-1" /><SelectValue placeholder="Format" /></SelectTrigger><SelectContent><SelectItem value="p">Paragraphe</SelectItem><SelectItem value="h2">Grand titre</SelectItem><SelectItem value="h3">Titre</SelectItem><SelectItem value="blockquote">Citation</SelectItem></SelectContent></Select><ToolbarButton label="Liste à puces" onClick={() => exec("insertUnorderedList")}><List size={15} /></ToolbarButton><ToolbarButton label="Liste numérotée" onClick={() => exec("insertOrderedList")}><ListOrdered size={15} /></ToolbarButton><ToolbarButton label="Lien" onClick={setLink}><Link size={15} /></ToolbarButton><label title="Couleur du texte" className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><Palette size={15} /><input type="color" value={color} onChange={(event) => { setColor(event.target.value); exec("foreColor", event.target.value); }} className="absolute inset-0 cursor-pointer opacity-0" /></label></div><div ref={editorRef} contentEditable suppressContentEditableWarning onInput={(event) => { lastHtml.current = event.currentTarget.innerHTML; onChange(block.id, { html: event.currentTarget.innerHTML }); }} className="min-h-[150px] p-4 text-sm leading-relaxed outline-none [&_h2]:mb-3 [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-black [&_h3]:mb-2 [&_h3]:mt-2 [&_h3]:text-xl [&_h3]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3" /></div>;
};

const ToolbarButton = ({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) => <button type="button" title={label} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">{children}</button>;

const ImageBlockEditor = ({ block, onChange, onUpload }: { block: Extract<ProductContentBlock, { type: "image" }>; onChange: BlockEditorProps["onChange"]; onUpload: BlockEditorProps["onUpload"] }) => <div className="grid gap-3 md:grid-cols-[1fr_220px]"><div className="space-y-3"><Input value={block.url} onChange={(event) => onChange(block.id, { url: event.target.value })} placeholder="URL de l'image ou importez un fichier" /><div className="flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"><Upload size={14} /> Importer une image<input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(block.id, file); event.currentTarget.value = ""; }} /></label>{block.url && <Button type="button" variant="ghost" size="sm" onClick={() => onChange(block.id, { url: "" })} className="gap-1 text-xs"><X size={13} /> Retirer</Button>}</div><Input value={block.alt} onChange={(event) => onChange(block.id, { alt: event.target.value })} placeholder="Texte alternatif (important pour l'accessibilité)" /><Input value={block.caption || ""} onChange={(event) => onChange(block.id, { caption: event.target.value })} placeholder="Légende facultative" /></div>{block.url ? <img src={block.url} alt="Aperçu" className="h-36 w-full rounded-xl border border-border object-cover" /> : <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground"><ImagePlus size={18} className="mr-2" /> Aperçu</div>}</div>;

const TestimonialEditor = ({ block, onChange, onUpload }: { block: Extract<ProductContentBlock, { type: "testimonial" }>; onChange: BlockEditorProps["onChange"]; onUpload: BlockEditorProps["onUpload"] }) => <div className="grid gap-3 md:grid-cols-2"><Textarea value={block.quote} onChange={(event) => onChange(block.id, { quote: event.target.value })} placeholder="Témoignage client" className="md:col-span-2" /><Input value={block.name} onChange={(event) => onChange(block.id, { name: event.target.value })} placeholder="Nom du client" /><Input value={block.role || ""} onChange={(event) => onChange(block.id, { role: event.target.value })} placeholder="Fonction ou entreprise" /><Input value={block.avatarUrl || ""} onChange={(event) => onChange(block.id, { avatarUrl: event.target.value })} placeholder="URL de la photo" /><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted"><Upload size={14} /> Importer la photo<input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(block.id, file, "avatarUrl"); event.currentTarget.value = ""; }} /></label><div className="flex items-center gap-3 rounded-lg border border-border px-3"><Star size={15} className="text-primary" fill="currentColor" /><span className="text-sm">Note</span><Select value={String(block.rating)} onValueChange={(rating) => onChange(block.id, { rating: Number(rating) })}><SelectTrigger className="ml-auto w-20 border-0"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5].map((rating) => <SelectItem key={rating} value={String(rating)}>{rating}/5</SelectItem>)}</SelectContent></Select></div><label className="flex items-center gap-2 text-xs font-medium"><input type="checkbox" checked={block.verified} onChange={(event) => onChange(block.id, { verified: event.target.checked })} /> Achat vérifié</label></div>;

const CalloutEditor = ({ block, onChange }: { block: CalloutBlock; onChange: BlockEditorProps["onChange"] }) => <div className="grid gap-3 md:grid-cols-2"><Input value={block.title} onChange={(event) => onChange(block.id, { title: event.target.value })} placeholder="Titre de l'encadré" /><Select value={block.tone} onValueChange={(tone: CalloutBlock["tone"]) => onChange(block.id, { tone })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yellow">Accent cyan</SelectItem><SelectItem value="neutral">Neutre</SelectItem><SelectItem value="success">Réassurance</SelectItem></SelectContent></Select><Textarea value={block.body} onChange={(event) => onChange(block.id, { body: event.target.value })} placeholder="Contenu de l'encadré" className="md:col-span-2" /></div>;

const ButtonEditor = ({ block, onChange }: { block: Extract<ProductContentBlock, { type: "button" }>; onChange: BlockEditorProps["onChange"] }) => <div className="grid gap-3 md:grid-cols-3"><Input value={block.label} onChange={(event) => onChange(block.id, { label: event.target.value })} placeholder="Texte du bouton" /><Input value={block.url} onChange={(event) => onChange(block.id, { url: event.target.value })} placeholder="https://… ou #achat" /><Select value={block.variant} onValueChange={(variant: "primary" | "secondary") => onChange(block.id, { variant })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="primary">Principal</SelectItem><SelectItem value="secondary">Secondaire</SelectItem></SelectContent></Select></div>;

const FaqEditor = ({ block, onChange }: { block: Extract<ProductContentBlock, { type: "faq" }>; onChange: BlockEditorProps["onChange"] }) => <div className="space-y-3"><Input value={block.question} onChange={(event) => onChange(block.id, { question: event.target.value })} placeholder="Question" /><Textarea value={block.answer} onChange={(event) => onChange(block.id, { answer: event.target.value })} placeholder="Réponse" /></div>;
