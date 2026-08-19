import { useState } from "react";
import { CheckCircle2, ChevronDown, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ProductContentBlock,
  sanitizeHtml,
  sanitizeUrl,
} from "@/lib/productContent";

interface ProductContentRendererProps {
  blocks: ProductContentBlock[];
  preview?: boolean;
}

export const ProductContentRenderer = ({ blocks, preview = false }: ProductContentRendererProps) => (
  <div className={cn("space-y-8", preview && "pointer-events-none")}>{blocks.map((block) => {
    switch (block.type) {
      case "richText":
        return (
          <div
            key={block.id}
            className="product-rich-text prose prose-base max-w-none prose-headings:font-black prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-a:text-primary prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.html) }}
          />
        );
      case "image": {
        const url = sanitizeUrl(block.url);
        if (!url) return null;
        return (
          <figure key={block.id} className="overflow-hidden rounded-3xl border border-border bg-muted/20">
            <img src={url} alt={block.alt || "Illustration du produit"} className="w-full max-h-[620px] object-cover" loading="lazy" />
            {block.caption && <figcaption className="px-5 py-3 text-center text-sm text-muted-foreground">{block.caption}</figcaption>}
          </figure>
        );
      }
      case "testimonial":
        return <Testimonial key={block.id} block={block} />;
      case "callout":
        return (
          <div key={block.id} className={cn(
            "rounded-3xl border p-6 md:p-8",
            block.tone === "yellow" && "border-primary/30 bg-primary/10",
            block.tone === "success" && "border-success/20 bg-success/10",
            block.tone === "neutral" && "border-border bg-muted/40",
          )}>
            <h3 className="mb-2 text-xl font-black text-foreground">{block.title}</h3>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{block.body}</p>
          </div>
        );
      case "button": {
        const url = sanitizeUrl(block.url, true);
        if (!url) return null;
        return (
          <div key={block.id} className="flex justify-center py-2">
            <Button asChild size="lg" className={cn("min-h-12 rounded-full px-8 font-bold", block.variant === "secondary" && "border border-border bg-background text-foreground hover:bg-muted")}>
              <a href={url} target={url.startsWith("#") ? undefined : "_blank"} rel={url.startsWith("#") ? undefined : "noopener noreferrer"}>{block.label || "En savoir plus"}</a>
            </Button>
          </div>
        );
      }
      case "faq":
        return <Faq key={block.id} question={block.question} answer={block.answer} />;
      case "divider":
        return <div key={block.id} className="h-px w-full bg-border" />;
      case "spacer":
        return <div key={block.id} className={cn(block.size === "sm" && "h-4", block.size === "md" && "h-8", block.size === "lg" && "h-16")} />;
      default:
        return null;
    }
  })}</div>
);

const Testimonial = ({ block }: { block: Extract<ProductContentBlock, { type: "testimonial" }> }) => (
  <figure className="relative rounded-2xl border border-border bg-muted p-6 md:p-8">
    <Quote className="absolute right-6 top-6 text-primary/40" size={34} />
    <div className="mb-5 flex gap-1 text-primary">
      {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={16} fill={index < block.rating ? "currentColor" : "none"} />)}
    </div>
    <blockquote className="max-w-3xl text-lg font-medium leading-relaxed text-foreground">“{block.quote}”</blockquote>
    <figcaption className="mt-6 flex items-center gap-3">
      {block.avatarUrl && sanitizeUrl(block.avatarUrl) ? (
        <img src={sanitizeUrl(block.avatarUrl)} alt="" className="h-11 w-11 rounded-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-black text-secondary">{block.name.slice(0, 1).toUpperCase() || "?"}</div>
      )}
      <div>
        <div className="flex items-center gap-2 font-bold text-foreground">
          {block.name || "Client"}
          {block.verified && <CheckCircle2 size={15} className="text-success" />}
        </div>
        {block.role && <div className="text-sm text-muted-foreground">{block.role}</div>}
      </div>
    </figcaption>
  </figure>
);

const Faq = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-foreground">
        <span>{question || "Question fréquente"}</span>
        <ChevronDown size={18} className={cn("shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="border-t border-border px-5 pb-5 pt-4 leading-relaxed text-muted-foreground">{answer}</div>}
    </div>
  );
};
