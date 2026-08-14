export const PRODUCT_CONTENT_PREFIX = "__MINDHUBS_PRODUCT_CONTENT_V1__";

export type ProductContentBlockType =
  | "richText"
  | "image"
  | "testimonial"
  | "callout"
  | "button"
  | "faq"
  | "divider"
  | "spacer";

export interface ProductContentBlockBase {
  id: string;
  type: ProductContentBlockType;
}

export interface RichTextBlock extends ProductContentBlockBase {
  type: "richText";
  html: string;
}

export interface ImageBlock extends ProductContentBlockBase {
  type: "image";
  url: string;
  alt: string;
  caption?: string;
}

export interface TestimonialBlock extends ProductContentBlockBase {
  type: "testimonial";
  quote: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  rating: number;
  verified: boolean;
}

export interface CalloutBlock extends ProductContentBlockBase {
  type: "callout";
  title: string;
  body: string;
  tone: "yellow" | "neutral" | "success";
}

export interface ButtonBlock extends ProductContentBlockBase {
  type: "button";
  label: string;
  url: string;
  variant: "primary" | "secondary";
}

export interface FaqBlock extends ProductContentBlockBase {
  type: "faq";
  question: string;
  answer: string;
}

export interface DividerBlock extends ProductContentBlockBase {
  type: "divider";
}

export interface SpacerBlock extends ProductContentBlockBase {
  type: "spacer";
  size: "sm" | "md" | "lg";
}

export type ProductContentBlock =
  | RichTextBlock
  | ImageBlock
  | TestimonialBlock
  | CalloutBlock
  | ButtonBlock
  | FaqBlock
  | DividerBlock
  | SpacerBlock;

export const createBlockId = () =>
  `content-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const markdownToHtml = (text: string) => {
  if (!text.trim()) return "";

  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return text
    .split(/\n\n+/)
    .map((paragraph) => {
      const lines = paragraph.split("\n");
      const listLines = lines.filter((line) => /^\s*[-*]\s+/.test(line));
      if (listLines.length === lines.length && listLines.length > 0) {
        return `<ul>${listLines
          .map((line) => `<li>${inlineMarkdown(escape(line.replace(/^\s*[-*]\s+/, "")))}</li>`)
          .join("")}</ul>`;
      }

      return lines
        .map((line) => {
          const heading = line.match(/^\s*(#{1,3})\s+(.+)$/);
          if (heading) {
            const level = Math.min(heading[1].length + 1, 4);
            return `<h${level}>${inlineMarkdown(escape(heading[2]))}</h${level}>`;
          }
          return inlineMarkdown(escape(line));
        })
        .join("<br />");
    })
    .map((block) => (block.startsWith("<h") || block.startsWith("<ul") ? block : `<p>${block}</p>`))
    .join("");
};

const inlineMarkdown = (value: string) =>
  value
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");

export const createInitialContentBlocks = (description = ""): ProductContentBlock[] => [
  {
    id: createBlockId(),
    type: "richText",
    html: markdownToHtml(description),
  },
];

export const serializeProductContent = (blocks: ProductContentBlock[]) =>
  `${PRODUCT_CONTENT_PREFIX}${JSON.stringify(blocks)}`;

export const parseProductContent = (description?: string | null): ProductContentBlock[] | null => {
  if (!description?.startsWith(PRODUCT_CONTENT_PREFIX)) return null;

  try {
    const parsed = JSON.parse(description.slice(PRODUCT_CONTENT_PREFIX.length));
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((block): block is ProductContentBlock => Boolean(block?.id && block?.type));
  } catch {
    return null;
  }
};

export const contentToPlainText = (blocks: ProductContentBlock[]) =>
  blocks
    .map((block) => {
      if (block.type === "richText") return block.html.replace(/<[^>]+>/g, " ");
      if (block.type === "testimonial") return `${block.quote} ${block.name}`;
      if (block.type === "callout") return `${block.title} ${block.body}`;
      if (block.type === "faq") return `${block.question} ${block.answer}`;
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

export const sanitizeUrl = (value: string, allowHash = false) => {
  const url = value.trim();
  if (!url) return "";
  if (allowHash && url.startsWith("#")) return url;
  if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) return url;
  if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) return url;
  return "";
};

export const sanitizeHtml = (html: string) => {
  if (typeof DOMParser === "undefined") return "";

  const document = new DOMParser().parseFromString(html, "text/html");
  const allowedTags = new Set([
    "P", "BR", "STRONG", "B", "EM", "I", "U", "MARK", "SPAN", "H2", "H3", "H4",
    "UL", "OL", "LI", "BLOCKQUOTE", "A",
  ]);
  const allowedStyle = new Set(["color", "background-color", "text-align", "font-size"]);

  const visit = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) {
        visit(child);
        return;
      }

      const element = child as HTMLElement;
      if (!allowedTags.has(element.tagName)) {
        if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "FORM"].includes(element.tagName)) {
          element.remove();
        } else {
          const replacement = [...element.childNodes];
          element.replaceWith(...replacement);
          replacement.forEach(visit);
        }
        return;
      }

      [...element.attributes].forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        if (name.startsWith("on") || (name !== "style" && name !== "href")) {
          element.removeAttribute(attribute.name);
        }
      });

      if (element.hasAttribute("style")) {
        const styles = [...element.style]
          .filter((property) => allowedStyle.has(property))
          .map((property) => {
            const value = element.style.getPropertyValue(property);
            const safeValue = /^(#[0-9a-f]{3,8}|[a-z]+|rgb\([^)]*\)|rgba\([^)]*\)|[0-9.]+(px|em|rem|%)|left|center|right)$/i.test(value.trim())
              ? value
              : "";
            return safeValue ? `${property}:${safeValue}` : "";
          })
          .filter(Boolean)
          .join(";");
        if (styles) element.setAttribute("style", styles);
        else element.removeAttribute("style");
      }

      if (element.tagName === "A") {
        const safeHref = sanitizeUrl(element.getAttribute("href") || "", true);
        if (safeHref) {
          element.setAttribute("href", safeHref);
          element.setAttribute("target", "_blank");
          element.setAttribute("rel", "noopener noreferrer");
        } else {
          element.replaceWith(...[...element.childNodes]);
        }
      }

      visit(element);
    });
  };

  visit(document.body);
  return document.body.innerHTML;
};
