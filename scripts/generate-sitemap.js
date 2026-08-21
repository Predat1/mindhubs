import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple env parser to avoid installing dotenv
function loadEnv() {
  try {
    const envFiles = ['.env', '.env.local', '.env.production'];
    for (const file of envFiles) {
      const envPath = path.resolve(__dirname, '..', file);
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        });
      }
    }
  } catch (e) {
    console.warn('Could not load .env files manually, relying on process.env', e.message);
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const DOMAIN = 'https://mindhubs.fun';

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

async function generateSitemap() {
  console.log("Generating sitemap...");
  const urls = [
    { loc: `${DOMAIN}/`, priority: 1.0 },
    { loc: `${DOMAIN}/boutique`, priority: 0.9 },
    { loc: `${DOMAIN}/produit/formations-550-logiciels`, priority: 0.85 },
    { loc: `${DOMAIN}/a-propos`, priority: 0.8 },
    { loc: `${DOMAIN}/become-a-seller`, priority: 0.8 },
    { loc: `${DOMAIN}/contact`, priority: 0.7 },
    { loc: `${DOMAIN}/faq`, priority: 0.6 },
    { loc: `${DOMAIN}/conditions-generales`, priority: 0.3 },
    { loc: `${DOMAIN}/politique-confidentialite`, priority: 0.3 },
    { loc: `${DOMAIN}/politique-remboursement`, priority: 0.3 },
    { loc: `${DOMAIN}/politique-livraison`, priority: 0.3 },
  ];

  try {
    if (supabase) {
      console.log("Fetching dynamic routes from Supabase...");

      const { data: publications, error: publicationsError } = await supabase
        .from('product_publications')
        .select('product_id, updated_at')
        .eq('status', 'published');
      const publishedProductIds = Array.isArray(publications) && publications.length > 0
        ? new Map(publications.map((publication) => [publication.product_id, publication.updated_at]))
        : null;
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, updated_at, status')
        .eq('status', 'published');
      const { data: vendors } = await supabase.from('vendors').select('username');

      if (publicationsError) console.warn('Publications indisponibles, le sitemap utilise les produits publiés :', publicationsError.message);
      if (productsError) console.warn('Produits dynamiques indisponibles :', productsError.message);

      if (products) {
        products.forEach(p => {
          if (publishedProductIds && !publishedProductIds.has(p.id)) return;
          const lastmod = publishedProductIds?.get(p.id) || p.updated_at;
          urls.push({
            loc: `${DOMAIN}/produit/${encodeURIComponent(p.id)}`,
            priority: 0.8,
            lastmod: lastmod ? new Date(lastmod).toISOString().split('T')[0] : null
          });
        });
      }

      if (vendors) {
        vendors.forEach(v => {
          if (v.username) {
            urls.push({
              loc: `${DOMAIN}/store/${encodeURIComponent(v.username)}`,
              priority: 0.7
            });
          }
        });
      }
    } else {
      console.warn("Supabase credentials missing. Generating static sitemap only.");
    }

    const uniqueUrls = Array.from(new Map(urls.map((url) => [url.loc, url])).values());
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.resolve(__dirname, '../public/sitemap.xml'), sitemapContent);
    console.log(`Sitemap generated successfully with ${uniqueUrls.length} URLs!`);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  }
}

generateSitemap();
