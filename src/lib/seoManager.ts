/**
 * Dynamic Sitemap Generator for MindHubs
 * This script can be run on build or as a cron job to keep the sitemap updated with new vendors.
 */

export const generateSitemap = async (vendors: any[]) => {
  const baseUrl = 'https://mindhubs.fun';
  
  const staticPages = [
    '',
    '/marketplace',
    '/pricing',
    '/about',
    '/contact',
    '/faq'
  ];

  const vendorPages = vendors.map(v => `/store/${v.username}`);
  
  const allPages = [...staticPages, ...vendorPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  return xml;
};

/**
 * ROBOTS.TXT
 */
export const ROBOTS_TXT = `
User-agent: *
Allow: /
Allow: /marketplace
Allow: /store/*
Disallow: /dashboard/*
Disallow: /admin/*

Sitemap: https://mindhubs.fun/sitemap.xml
`;
