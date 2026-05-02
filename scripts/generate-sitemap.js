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
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const DOMAIN = 'https://mindhubs.fun';

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

async function generateSitemap() {
  console.log("Generating sitemap...");
  const urls = [
    { loc: `${DOMAIN}/`, priority: 1.0 },
    { loc: `${DOMAIN}/boutique`, priority: 0.9 },
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

      const { data: products } = await supabase.from('products').select('id, updated_at');
      const { data: vendors } = await supabase.from('vendors').select('username');

      if (products) {
        products.forEach(p => {
          urls.push({
            loc: `${DOMAIN}/produit/${p.id}`,
            priority: 0.8,
            lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : null
          });
        });
      }

      if (vendors) {
        vendors.forEach(v => {
          if (v.username) {
            urls.push({
              loc: `${DOMAIN}/store/${v.username}`,
              priority: 0.7
            });
          }
        });
      }
    } else {
      console.warn("Supabase credentials missing. Generating static sitemap only.");
    }

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.resolve(__dirname, '../public/sitemap.xml'), sitemapContent);
    console.log(`Sitemap generated successfully with ${urls.length} URLs!`);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  }
}

generateSitemap();
