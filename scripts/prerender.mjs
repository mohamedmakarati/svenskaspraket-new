#!/usr/bin/env node
/**
 * Build-time prerender — writes route-specific HTML with full SEO + visible content.
 * Run after `vite build`. Social crawlers receive page-specific metadata without JS.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPageSeo } from '../src/lib/seo.js';
import { PRERENDER_ROUTES } from '../src/lib/seoUrls.js';
import { PRERENDER_CONTENT } from '../src/lib/prerenderContent.js';
import { buildSeoHeadHtml, buildPrerenderBody } from '../src/lib/renderSeoHead.js';
import { loadVerbItems, loadVocabularyItems } from './seo/loadItemLists.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

function extractAssets(html) {
  const scripts = [...html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)].map((m) => m[0]);
  const styles = [...html.matchAll(/<link rel="stylesheet"[^>]*>/g)].map((m) => m[0]);
  const modulePreload = [...html.matchAll(/<link rel="modulepreload"[^>]*>/g)].map((m) => m[0]);
  return { scripts, styles, modulePreload };
}

function structuredDataOpts(pageKey) {
  switch (pageKey) {
    case 'verbsA1':
      return { verbItems: loadVerbItems('A1') };
    case 'verbsA2':
      return { verbItems: loadVerbItems('A2') };
    case 'verbsB1B2':
      return { verbItems: loadVerbItems('B1-B2') };
    case 'vocabulary':
      return { vocabItems: loadVocabularyItems(50) };
    default:
      return {};
  }
}

function outputPath(routePath) {
  if (routePath === '/') return resolve(dist, 'index.html');
  const segments = routePath.replace(/^\//, '').split('/');
  const dir = resolve(dist, ...segments);
  mkdirSync(dir, { recursive: true });
  return join(dir, 'index.html');
}

function buildHtml({ lang, dir, headHtml, bodyContent, assets }) {
  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
  <head>
    ${headHtml}
    ${assets.modulePreload.join('\n    ')}
    ${assets.styles.join('\n    ')}
  </head>
  <body>
    <div id="root">
      ${bodyContent}
    </div>
    ${assets.scripts.join('\n    ')}
  </body>
</html>
`;
}

const builtIndex = readFileSync(resolve(dist, 'index.html'), 'utf8');
const assets = extractAssets(builtIndex);
const report = [];

for (const { path, pageKey } of PRERENDER_ROUTES) {
  const content = PRERENDER_CONTENT[pageKey];
  const seo = getPageSeo(pageKey, structuredDataOpts(pageKey));
  const headHtml = buildSeoHeadHtml(seo);
  const bodyContent = buildPrerenderBody(content);
  const html = buildHtml({
    lang: content.lang,
    dir: content.dir,
    headHtml,
    bodyContent,
    assets,
  });
  const out = outputPath(path);
  writeFileSync(out, html, 'utf8');

  report.push({
    route: path,
    file: out.replace(root + '\\', '').replace(root + '/', ''),
    title: seo.title,
    description: seo.description?.slice(0, 80) + '…',
    canonical: seo.canonical,
    hreflang: seo.hreflang,
    robots: seo.noindex ? 'noindex,nofollow' : 'index,follow',
    h1: content.h1,
    hasJsonLd: Boolean(seo.structuredData),
    hasItemList: Boolean(seo.structuredData?.['@graph']?.some((n) => n['@type'] === 'ItemList')),
  });
}

writeFileSync(resolve(dist, 'prerender-report.json'), JSON.stringify(report, null, 2), 'utf8');

console.log(`Prerendered ${report.length} routes:\n`);
for (const r of report) {
  console.log(`  ${r.route}`);
  console.log(`    → ${r.file}`);
  console.log(`    title: ${r.title}`);
  console.log(`    canonical: ${r.canonical}`);
  console.log(`    h1: ${r.h1}`);
  console.log(`    ItemList: ${r.hasItemList ? 'yes' : 'no'}`);
  console.log('');
}
