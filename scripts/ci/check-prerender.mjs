#!/usr/bin/env node
/**
 * Verify prerendered HTML files contain required SEO + visible content.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRERENDER_ROUTES } from '../../src/lib/seoUrls.js';
import { getPageSeo, PAGE_SEO } from '../../src/lib/seo.js';
import { PRERENDER_CONTENT } from '../../src/lib/prerenderContent.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const dist = resolve(root, 'dist');

let failed = false;

function fail(msg) {
  console.error(`✗ ${msg}`);
  failed = true;
}

function expectedTitle(seo) {
  return seo.title?.includes('Svenska Språket') || seo.title?.includes('SvenskaSpråket')
    ? seo.title
    : `${seo.title} | SvenskaSpråket`;
}

function htmlPath(routePath) {
  if (routePath === '/') return resolve(dist, 'index.html');
  return resolve(dist, routePath.replace(/^\//, ''), 'index.html');
}

for (const { path, pageKey } of PRERENDER_ROUTES) {
  const file = htmlPath(path);
  if (!existsSync(file)) {
    fail(`Missing prerender file: ${file}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  const seo = getPageSeo(pageKey);
  const content = PRERENDER_CONTENT[pageKey];
  const page = PAGE_SEO[pageKey];
  const title = expectedTitle(seo);

  if (!html.includes(`<title>${title}</title>`)) {
    fail(`${path}: missing title "${title}"`);
  }
  if (!html.includes(`content="${seo.description.replace(/"/g, '&quot;')}"`) && !html.includes(seo.description.slice(0, 40))) {
    fail(`${path}: missing meta description`);
  }
  if (!html.includes('property="og:title"')) fail(`${path}: missing og:title`);
  if (!html.includes('property="og:description"')) fail(`${path}: missing og:description`);
  if (!html.includes('name="twitter:card"')) fail(`${path}: missing twitter:card`);
  if (!html.includes('rel="canonical"')) fail(`${path}: missing canonical`);
  if (!html.includes(`<h1>${content.h1.replace(/&/g, '&amp;')}</h1>`) && !html.includes(`<h1>${content.h1}</h1>`)) {
    fail(`${path}: missing H1 "${content.h1}"`);
  }
  if (!html.includes('application/ld+json')) fail(`${path}: missing JSON-LD`);
  if (seo.hreflang && !html.includes('hreflang="en"')) fail(`${path}: missing hreflang`);
  if (page.noindex && !html.includes('noindex,nofollow')) {
    fail(`${path}: expected noindex,nofollow`);
  }
}

if (failed) process.exit(1);
console.log(`✓ Prerender HTML verified for ${PRERENDER_ROUTES.length} routes`);
