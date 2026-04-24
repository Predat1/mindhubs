import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
  keywords?: string;
  type?: "website" | "article" | "product";
}

const SITE_NAME = "MindHub";
const BASE_URL = "https://mindhubs.app";
const DEFAULT_IMAGE = "/og-image.png";

const SEO = ({ title, description, path = "", image, jsonLd, keywords, type = "website" }: SEOProps) => {
  const fullTitle = `${title} | ${SITE_NAME}– Formations Digitales Premium`;
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

    setMeta("name", "description", description);
    setMeta("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    if (keywords) setMeta("name", "keywords", keywords);
    setMeta("name", "author", "MindHub");
    setMeta("name", "publisher", "MindHub");
    setMeta("name", "theme-color", "#000000");

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

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // JSON-LD
    const ldId = "seo-json-ld";
    let ldScript = document.getElementById(ldId) as HTMLScriptElement | null;

    const defaultLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: BASE_URL,
      description,
      inLanguage: "fr-FR",
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/boutique?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };

    const orgLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "MindHub",
      url: BASE_URL,
      logo: `${BASE_URL}/favicon.svg`,
      description: "Plateforme de formations digitales premium en Afrique. Paiement unique, accès illimité à vie.",
      contactPoint: {
        "@type": "ContactPoint",
        email: "contact@mindhub.com",
        contactType: "customer service",
        availableLanguage: "French",
      },
      sameAs: [],
    };

    const ldData = jsonLd || defaultLd;
    const combinedLd = [ldData, orgLd];

    if (!ldScript) {
      ldScript = document.createElement("script");
      ldScript.id = ldId;
      ldScript.type = "application/ld+json";
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(combinedLd);

    return () => {
      const el = document.getElementById(ldId);
      if (el) el.remove();
    };
  }, [fullTitle, description, url, ogImage, jsonLd, keywords, type]);

  return null;
};

export default SEO;
