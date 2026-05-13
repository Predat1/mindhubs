import { useEffect } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  keywords?: string;
  type?: "website" | "article" | "product" | "profile";
  noindex?: boolean;
  faq?: FAQItem[];
}

const SITE_NAME = "MindHub";
const BASE_URL = "https://mindhubs.fun";
const DEFAULT_IMAGE = "/og-image.png";

const SEGMENT_LABELS: Record<string, string> = {
  boutique: "Boutique",
  "a-propos": "À propos",
  contact: "Contact",
  faq: "FAQ",
  pricing: "Tarifs",
  experts: "Experts",
  "become-a-seller": "Devenir Vendeur",
  "conditions-generales": "CGV",
  "politique-confidentialite": "Confidentialité",
  "politique-remboursement": "Remboursement",
  "politique-livraison": "Livraison",
  "protection-acheteur": "Protection Acheteur",
  produit: "Produit",
};

const SEO = ({ title, description, path = "", image, jsonLd, keywords, type = "website", noindex = false, faq }: SEOProps) => {
  const fullTitle = `${title} | ${SITE_NAME} – Formations Digitales Premium Afrique`;
  const url = `${BASE_URL}${path}`;
  const ogImage = image ? (image.startsWith("http") ? image : `${BASE_URL}${image}`) : `${BASE_URL}${DEFAULT_IMAGE}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel: string, href: string, extra?: Record<string, string>) => {
      const selector = extra
        ? `link[rel="${rel}"]${Object.entries(extra).map(([k, v]) => `[${k}="${v}"]`).join("")}`
        : `link[rel="${rel}"]`;
      let el = document.querySelector(selector) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        if (extra) Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // Core meta
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    if (keywords) setMeta("name", "keywords", keywords);
    setMeta("name", "author", "MindHub");
    setMeta("name", "publisher", "MindHub");
    setMeta("name", "theme-color", "#000000");
    setMeta("name", "apple-mobile-web-app-title", SITE_NAME);

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:image:alt", title);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "fr_FR");

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);
    setMeta("name", "twitter:image:alt", title);

    // Canonical + hreflang
    setLink("canonical", url);
    setLink("alternate", url, { hreflang: "fr" });
    setLink("alternate", url, { hreflang: "x-default" });

    // Breadcrumbs
    const pathSegments = path.split("/").filter(Boolean);
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: BASE_URL },
        ...pathSegments.map((segment, index) => ({
          "@type": "ListItem",
          position: index + 2,
          name: SEGMENT_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
          item: `${BASE_URL}/${pathSegments.slice(0, index + 1).join("/")}`,
        })),
      ],
    };

    // Build structured data array
    const ldItems: Record<string, unknown>[] = [];

    // Custom page-level JSON-LD
    if (Array.isArray(jsonLd)) {
      ldItems.push(...jsonLd);
    } else if (jsonLd) {
      ldItems.push(jsonLd);
    }

    // Breadcrumbs (always)
    ldItems.push(breadcrumbLd);

    // FAQ Schema (if provided)
    if (faq && faq.length > 0) {
      ldItems.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map(item => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      });
    }

    // Inject JSON-LD
    const ldId = "seo-json-ld";
    let ldScript = document.getElementById(ldId) as HTMLScriptElement | null;
    if (!ldScript) {
      ldScript = document.createElement("script");
      ldScript.id = ldId;
      ldScript.type = "application/ld+json";
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(ldItems);

    return () => {
      const el = document.getElementById(ldId);
      if (el) el.remove();
    };
  }, [fullTitle, description, url, ogImage, jsonLd, keywords, type, path, noindex, faq]);

  return null;
};

export default SEO;
