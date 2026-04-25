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
const BASE_URL = "https://mindhubs.fun";
const DEFAULT_IMAGE = "/og-image.png";

const SEO = ({ title, description, path = "", image, jsonLd, keywords, type = "website" }: SEOProps) => {
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

    setMeta("name", "description", description);
    setMeta("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
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

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // Breadcrumbs
    const pathSegments = path.split("/").filter(Boolean);
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: BASE_URL,
        },
        ...pathSegments.map((segment, index) => ({
          "@type": "ListItem",
          position: index + 2,
          name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
          item: `${BASE_URL}/${pathSegments.slice(0, index + 1).join("/")}`,
        })),
      ],
    };

    // Organization LD
    const orgLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
      logo: `${BASE_URL}/favicon.svg`,
      description: "Plateforme N°1 de formations digitales premium en Afrique. Paiement unique, accès illimité à vie.",
      contactPoint: {
        "@type": "ContactPoint",
        email: "contact@mindhub.com",
        contactType: "customer service",
        availableLanguage: "French",
      },
    };

    const combinedLd = [jsonLd || {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: BASE_URL,
      description,
      inLanguage: "fr-FR",
    }, orgLd, breadcrumbLd];

    const ldId = "seo-json-ld";
    let ldScript = document.getElementById(ldId) as HTMLScriptElement | null;
    if (!ldScript) {
      ldScript = document.createElement("script");
      ldScript.id = ldId;
      ldScript.type = "application/ld+json";
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(combinedLd);

    return () => {
      // Keep it or remove it? Usually better to remove to avoid duplicates on route changes
      const el = document.getElementById(ldId);
      if (el) el.remove();
    };
  }, [fullTitle, description, url, ogImage, jsonLd, keywords, type, path]);

  return null;
};

export default SEO;
