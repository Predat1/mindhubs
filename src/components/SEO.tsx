import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "MindHub";
const BASE_URL = "https://snap-clone-wonder.lovable.app";
const DEFAULT_IMAGE = "/og-image.png";

const SEO = ({ title, description, path = "", image, jsonLd }: SEOProps) => {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = `${BASE_URL}${path}`;
  const ogImage = image || DEFAULT_IMAGE;

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
    setMeta("name", "robots", "index, follow");
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "fr_FR");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // JSON-LD structured data
    const ldId = "seo-json-ld";
    let ldScript = document.getElementById(ldId) as HTMLScriptElement | null;
    const ldData = jsonLd || {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: BASE_URL,
      description,
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/boutique?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
    if (!ldScript) {
      ldScript = document.createElement("script");
      ldScript.id = ldId;
      ldScript.type = "application/ld+json";
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(ldData);

    return () => {
      const el = document.getElementById(ldId);
      if (el) el.remove();
    };
  }, [fullTitle, description, url, ogImage, jsonLd]);

  return null;
};

export default SEO;
