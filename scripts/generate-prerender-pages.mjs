import fs from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("dist");
const sourcePath = path.join(dist, "index.html");
const domain = "https://mindhubs.fun";

const pages = [
  {
    path: "/boutique",
    title: "Marketplace MindHubs — Formations, logiciels et produits digitaux",
    description: "Explorez les formations, logiciels, ebooks et ressources numériques proposés sur la marketplace MindHubs.",
  },
  {
    path: "/become-a-seller",
    title: "Devenir vendeur sur MindHubs",
    description: "Créez votre boutique, publiez vos produits et développez votre activité avec MindHubs.",
  },
  {
    path: "/a-propos",
    title: "À propos de MindHubs",
    description: "Découvrez MindHubs, la marketplace de produits et formations digitales pour l'Afrique francophone.",
  },
  {
    path: "/contact",
    title: "Contactez MindHubs",
    description: "Contactez l'équipe MindHubs pour vos achats, votre boutique ou vos produits digitaux.",
  },
  {
    path: "/faq",
    title: "FAQ MindHubs — Questions fréquentes",
    description: "Trouvez les réponses aux questions fréquentes sur les achats, les vendeurs et les formations MindHubs.",
  },
  {
    path: "/produit/formations-550-logiciels",
    title: "+550 Formations et Logiciels — MindHubs",
    description: "Découvrez le pack de plus de 550 formations et logiciels pour apprendre, travailler et développer vos activités.",
  },
];

const escapeAttribute = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

const withMetadata = (html, page) => {
  const url = `${domain}${page.path}`;
  let output = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttribute(page.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeAttribute(page.description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeAttribute(page.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeAttribute(page.description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeAttribute(page.title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escapeAttribute(page.description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  return output;
};

try {
  const html = await fs.readFile(sourcePath, "utf8");
  for (const page of pages) {
    const routePath = path.join(dist, page.path.replace(/^\//, ""), "index.html");
    await fs.mkdir(path.dirname(routePath), { recursive: true });
    await fs.writeFile(routePath, withMetadata(html, page));
  }
  console.log(`Generated ${pages.length} prerendered public routes.`);
} catch (error) {
  console.error("Could not generate prerendered pages:", error);
  process.exitCode = 1;
}
