#!/usr/bin/env node
/**
 * Generates sitemap.xml from SEO registry (no trailing slashes).
 * Writes to public/ and dist/ (if dist exists).
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSitemapEntries } from '../src/lib/seo.js';
import { hreflangAlternates } from '../src/lib/seoUrls.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const entries = getSitemapEntries();

const hreflangLinks = () =>
  hreflangAlternates()
    .map((a) => `<xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>`)
    .join('');

const urls = entries
  .map(
    (p) =>
      `<url><loc>${p.loc}</loc>${p.hreflang ? hreflangLinks() : ''}<lastmod>${p.lastmod}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
  )
  .join('\n  ');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urls}
</urlset>
`;

writeFileSync(resolve(root, 'public/sitemap.xml'), xml, 'utf8');

const distDir = resolve(root, 'dist');
if (existsSync(distDir)) {
  writeFileSync(resolve(distDir, 'sitemap.xml'), xml, 'utf8');
}

console.log(`Generated sitemap.xml — ${entries.length} URLs`);
