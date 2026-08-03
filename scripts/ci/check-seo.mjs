#!/usr/bin/env node
/**
 * Validate SEO registry: titles, canonicals, hreflang, JSON-LD, admin noindex.
 */
import { PAGE_SEO, getPageSeo } from '../../src/lib/seo.js';
import { hreflangAlternates, validateReciprocalHreflang } from '../../src/lib/seoUrls.js';

const PUBLIC_ROUTES = ['/', '/en', '/ar', '/verbs', '/verbs-a2', '/verbs-b1b2', '/vocabulary', '/lessons-a1', '/lessons'];
const ADMIN_NOINDEX = ['admin', 'adminLogin', 'adminAuthCallback', 'notFound', 'c1', 'lessonB2C1'];

let failed = false;

function fail(msg) {
  console.error(`✗ ${msg}`);
  failed = true;
}

for (const [key, page] of Object.entries(PAGE_SEO)) {
  if (!page.title?.trim()) fail(`${key}: missing title`);
  if (!page.description?.trim()) fail(`${key}: missing description`);
  if (!page.path?.startsWith('/')) fail(`${key}: invalid path ${page.path}`);

  const seo = getPageSeo(key);
  if (!seo.canonical) fail(`${key}: missing canonical`);
  if (seo.canonical.endsWith('/') && page.path !== '/') {
    fail(`${key}: canonical has trailing slash: ${seo.canonical}`);
  }

  if (ADMIN_NOINDEX.includes(key) && !page.noindex) {
    fail(`${key}: admin/notFound must have noindex`);
  }

  if (page.structuredData) {
    try {
      const ld = page.structuredData({});
      JSON.stringify(ld);
      if (!ld['@context']) fail(`${key}: JSON-LD missing @context`);
      const graph = ld['@graph'] ?? [];
      const educational = [
        'verbsA1',
        'verbsA2',
        'verbsB1B2',
        'vocabulary',
        'lessonsA1',
        'lessonsB1',
        'c1',
        'lessonB2C1',
        'lundLevel1',
        'lundLevel2',
        'lundLevel3',
        'lundLevel4',
        'lundLevel5',
        'lundLevel6',
        'lundLevel7',
        'lundLevel8',
      ];
      if (educational.includes(key) && !graph.some((n) => n['@type'] === 'BreadcrumbList')) {
        fail(`${key}: missing BreadcrumbList`);
      }
      if (educational.includes(key) && !graph.some((n) => n['@type'] === 'LearningResource')) {
        fail(`${key}: missing LearningResource`);
      }
    } catch (e) {
      fail(`${key}: invalid JSON-LD — ${e.message}`);
    }
  }
}

const hreflangPages = { '/': hreflangAlternates(), '/en': hreflangAlternates(), '/ar': hreflangAlternates() };
const hrefErrors = validateReciprocalHreflang(hreflangPages);
hrefErrors.forEach(fail);

for (const route of PUBLIC_ROUTES) {
  const found = Object.values(PAGE_SEO).some((p) => p.path === route && !p.noindex);
  if (!found) fail(`Public route ${route} missing from PAGE_SEO or is noindex`);
}

if (failed) process.exit(1);
console.log(`✓ SEO metadata valid (${Object.keys(PAGE_SEO).length} pages, hreflang reciprocal OK)`);
