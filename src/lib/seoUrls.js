import { SITE_URL } from './siteUrl.js';

/** Normalize site base — no trailing slash */
export function siteBase() {
  return SITE_URL.replace(/\/+$/, '');
}

/** Canonical URL for a path — no trailing slash except root represented as base or base+/ */
export function canonicalUrl(path = '/') {
  const base = siteBase();
  if (!path || path === '/') return `${base}/`;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`.replace(/\/+$/, '');
}

/** hreflang alternates for language homepages (reciprocal set) */
export function hreflangAlternates() {
  const base = siteBase();
  return [
    { lang: 'sv', href: `${base}/` },
    { lang: 'en', href: `${base}/en` },
    { lang: 'ar', href: `${base}/ar` },
    { lang: 'x-default', href: `${base}/` },
  ];
}

/** Validate reciprocal hreflang — each page lists all langs including itself */
export function validateReciprocalHreflang(alternatesByPage) {
  const errors = [];
  const pages = Object.keys(alternatesByPage);
  const allLangs = new Set(['sv', 'en', 'ar', 'x-default']);

  for (const page of pages) {
    const alts = alternatesByPage[page];
    const langs = new Set(alts.map((a) => a.lang));
    for (const lang of allLangs) {
      if (!langs.has(lang)) errors.push(`${page} missing hreflang ${lang}`);
    }
    for (const alt of alts) {
      const targetPages = Object.entries(alternatesByPage).filter(([, list]) =>
        list.some((a) => a.lang === alt.lang && a.href === alt.href),
      );
      if (targetPages.length === 0) errors.push(`${page}: href ${alt.href} not referenced`);
    }
  }
  return errors;
}

import { LUND_LEVELS } from '../data/lundLevels.js';

export const PRERENDER_ROUTES = [
  { path: '/', pageKey: 'home' },
  { path: '/en', pageKey: 'en' },
  { path: '/ar', pageKey: 'ar' },
  { path: '/verbs', pageKey: 'verbsA1' },
  { path: '/verbs-a2', pageKey: 'verbsA2' },
  { path: '/verbs-b1b2', pageKey: 'verbsB1B2' },
  { path: '/vocabulary', pageKey: 'vocabulary' },
  { path: '/lessons-a1', pageKey: 'lessonsA1' },
  { path: '/lessons', pageKey: 'lessonsB1' },
  { path: '/c1', pageKey: 'c1' },
  ...LUND_LEVELS.map((level) => ({
    path: `/niva/${level.id}`,
    pageKey: `lundLevel${level.id}`,
  })),
];
