import { SITE_URL } from './siteUrl.js';
import { canonicalUrl, siteBase } from './seoUrls.js';
import { LUND_LEVELS, LUND_COURSE_URL } from '../data/lundLevels.js';

export const SEO = {
  siteName: 'SvenskaSpråket',
  siteUrl: siteBase(),
  author: 'SvenskaSpråket',
  ogImage: `${siteBase()}/og-image.png`,
  ogImageAlt: 'Svenska Språket – lär dig svenska från A1 till C1',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  locale: { sv: 'sv_SE', en: 'en_US', ar: 'ar_AR' },
};

const org = {
  '@type': 'Organization',
  '@id': `${SEO.siteUrl}/#organization`,
  name: SEO.siteName,
  url: SEO.siteUrl,
  logo: { '@type': 'ImageObject', url: `${SEO.siteUrl}/favicon.svg` },
  description: 'En oberoende, studentdriven resurs för personer som lär sig svenska.',
  knowsLanguage: ['sv', 'en', 'ar'],
};

const website = {
  '@type': 'WebSite',
  '@id': `${SEO.siteUrl}/#website`,
  url: SEO.siteUrl,
  name: SEO.siteName,
  description: 'Gratis svensk språkträning från A1 till C1 med stöd på engelska och arabiska.',
  inLanguage: ['sv', 'en', 'ar'],
  publisher: { '@id': `${SEO.siteUrl}/#organization` },
};

export function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SEO.siteUrl}${item.url}`,
    })),
  };
}

export function itemList({ name, description, items, url }) {
  return {
    '@type': 'ItemList',
    '@id': `${SEO.siteUrl}${url}#itemlist`,
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
      ...(item.url ? { url: item.url.startsWith('http') ? item.url : `${SEO.siteUrl}${url}${item.url}` } : {}),
    })),
  };
}

export function learningResource({ url, name, description, level, types = ['lesson'] }) {
  return {
    '@type': 'LearningResource',
    '@id': `${SEO.siteUrl}${url}#resource`,
    url: `${SEO.siteUrl}${url}`,
    name,
    description,
    educationalLevel: level,
    learningResourceType: types,
    inLanguage: ['sv', 'en', 'ar'],
    isAccessibleForFree: true,
    provider: { '@id': `${SEO.siteUrl}/#organization` },
  };
}

const lundUniversityOrg = {
  '@type': 'Organization',
  name: 'Lund University',
  url: 'https://www.lu.se/',
};

function buildLundLevelSeo(level) {
  const copy = level.sv;
  const path = `/niva/${level.id}`;
  return {
    path,
    lang: 'sv',
    title: `${copy.title} | SvenskaSpråket`,
    description: `${copy.summary} Studienivå ${level.id} enligt kursstrukturen SFSH60 (Lunds universitet). Oberoende resurs — inte officiell LU-webbplats.`,
    keywords: `SFSH60, nivå ${level.id}, svenska som främmande språk, Lunds universitet`,
    ogType: 'article',
    hreflang: false,
    priority: 0.7,
    changefreq: 'monthly',
    structuredData: () => ({
      '@context': 'https://schema.org',
      '@graph': [
        learningResource({
          url: path,
          name: copy.title,
          description: copy.summary,
          level: `Lund Level ${level.id}`,
          types: ['course'],
        }),
        {
          '@type': 'Course',
          name: 'Swedish as a Foreign Language (SFSH60)',
          url: LUND_COURSE_URL,
          provider: lundUniversityOrg,
        },
        breadcrumb([
          { name: 'Hem', url: '/' },
          { name: copy.title, url: path },
        ]),
      ],
    }),
  };
}

const LUND_LEVEL_PAGE_SEO = Object.fromEntries(
  LUND_LEVELS.map((level) => [`lundLevel${level.id}`, buildLundLevelSeo(level)]),
);

/** All public pages — single source of truth for SEO */
export const PAGE_SEO = {
  home: {
    path: '/',
    lang: 'sv',
    title: 'Svenska Språket – Lär dig svenska gratis A1–C1',
    description:
      'Lär dig svenska gratis från A1 till C1. Träna svenska verb, ordförråd, grammatik, flashcards och quiz med stöd på engelska och arabiska.',
    keywords: 'lära sig svenska, svenska A1, svenska C1, svenska verb, svenska grammatik, gratis',
    ogType: 'website',
    hreflang: true,
    priority: 1.0,
    changefreq: 'weekly',
    structuredData: () => ({
      '@context': 'https://schema.org',
      '@graph': [
        website,
        org,
        learningResource({
          url: '/',
          name: 'Lär dig svenska gratis A1–C1',
          description:
            'Gratis svensk språkträning från A1 till C1 med verb, ordförråd, grammatik, flashcards och quiz.',
          level: 'A1-C1',
          types: ['course', 'reference'],
        }),
        {
          '@type': 'WebPage',
          '@id': `${SEO.siteUrl}/#webpage`,
          url: `${SEO.siteUrl}/`,
          name: 'Lär dig svenska gratis A1–C1',
          isPartOf: { '@id': `${SEO.siteUrl}/#website` },
          about: { '@id': `${SEO.siteUrl}/#organization` },
          inLanguage: 'sv',
          educationalLevel: ['A1', 'A2', 'B1', 'B2', 'C1'],
        },
      ],
    }),
  },
  en: {
    path: '/en',
    lang: 'en',
    title: 'Learn Swedish Free A1–C1 | Svenska Språket',
    description:
      'Learn Swedish free from A1 to C1. Study Swedish verbs, vocabulary and grammar with interactive flashcards, quizzes and English support.',
    keywords: 'learn Swedish, Swedish A1, Swedish C1, Swedish verbs, Swedish grammar, free Swedish course',
    ogType: 'website',
    hreflang: true,
    priority: 0.9,
    changefreq: 'weekly',
    structuredData: () => ({
      '@context': 'https://schema.org',
      '@graph': [
        org,
        {
          '@type': 'WebPage',
          '@id': `${SEO.siteUrl}/en#webpage`,
          url: `${SEO.siteUrl}/en`,
          name: 'Learn Swedish Free A1–C1',
          description: 'Free Swedish learning resources with English support.',
          inLanguage: 'en',
          isPartOf: { '@id': `${SEO.siteUrl}/#website` },
        },
      ],
    }),
  },
  ar: {
    path: '/ar',
    lang: 'ar',
    title: 'تعلم اللغة السويدية مجاناً A1–C1 | Svenska Språket',
    description:
      'تعلم اللغة السويدية مجاناً من A1 إلى C1. تدرب على الأفعال والمفردات والقواعد والبطاقات والاختبارات مع شرح باللغة العربية.',
    keywords: 'تعلم السويدية, سويدية A1, سويدية C1, أفعال سويدية, قواعد سويدية, مجاني',
    ogType: 'website',
    hreflang: true,
    priority: 0.9,
    changefreq: 'weekly',
    structuredData: () => ({
      '@context': 'https://schema.org',
      '@graph': [
        org,
        {
          '@type': 'WebPage',
          '@id': `${SEO.siteUrl}/ar#webpage`,
          url: `${SEO.siteUrl}/ar`,
          name: 'تعلم اللغة السويدية مجاناً A1–C1',
          inLanguage: 'ar',
          isPartOf: { '@id': `${SEO.siteUrl}/#website` },
        },
      ],
    }),
  },
  verbsA1: {
    path: '/verbs',
    lang: 'sv',
    title: '131 svenska A1-verb med böjning | SvenskaSpråket',
    description:
      'Träna 131 vanliga svenska A1-verb med full böjning, visuella minnesbilder samt betydelser på engelska och arabiska. Sök, filtrera och testa dig själv.',
    keywords: 'svenska verb A1, svenska verb lista, böjning svenska, lära sig svenska verb',
    ogType: 'article',
    hreflang: false,
    priority: 0.9,
    changefreq: 'monthly',
    structuredData: (opts = {}) => {
      const graph = [
        learningResource({
          url: '/verbs',
          name: '131 svenska A1-verb med böjning',
          description: 'Interaktiv A1-verblista med böjning, bilder och quiz.',
          level: 'A1',
          types: ['reference', 'quiz'],
        }),
        breadcrumb([
          { name: 'Hem', url: '/' },
          { name: 'A1-verb', url: '/verbs' },
        ]),
      ];
      if (opts.verbItems?.length) {
        graph.push(
          itemList({
            name: '131 svenska A1-verb',
            description: 'Lista över A1-verb med böjning',
            url: '/verbs',
            items: opts.verbItems,
          }),
        );
      }
      return { '@context': 'https://schema.org', '@graph': graph };
    },
  },
  verbsA2: {
    path: '/verbs-a2',
    lang: 'sv',
    title: '199 svenska A2-verb med böjning | SvenskaSpråket',
    description:
      'Träna 199 svenska A2-verb med full böjning, minnesbilder och översättningar på engelska och arabiska.',
    keywords: 'svenska verb A2, svenska verb lista, verb böjning A2',
    ogType: 'article',
    hreflang: false,
    priority: 0.9,
    changefreq: 'monthly',
    structuredData: (opts = {}) => {
      const graph = [
        learningResource({
          url: '/verbs-a2',
          name: '199 svenska A2-verb med böjning',
          description: 'Interaktiv A2-verblista med böjning och quiz.',
          level: 'A2',
          types: ['reference', 'quiz'],
        }),
        breadcrumb([
          { name: 'Hem', url: '/' },
          { name: 'A2-verb', url: '/verbs-a2' },
        ]),
      ];
      if (opts.verbItems?.length) {
        graph.push(
          itemList({
            name: '199 svenska A2-verb',
            description: 'Lista över A2-verb med böjning',
            url: '/verbs-a2',
            items: opts.verbItems,
          }),
        );
      }
      return { '@context': 'https://schema.org', '@graph': graph };
    },
  },
  verbsB1B2: {
    path: '/verbs-b1b2',
    lang: 'sv',
    title: '135 oregelbundna verb B1-B2 | SvenskaSpråket',
    description:
      'Träna 135 oregelbundna svenska verb på B1-B2-nivå med full böjning, minnesbilder och engelska/arabiska översättningar.',
    keywords: 'oregelbundna svenska verb, B1 B2 verb, svenska verb avancerad',
    ogType: 'article',
    hreflang: false,
    priority: 0.9,
    changefreq: 'monthly',
    structuredData: (opts = {}) => {
      const graph = [
        learningResource({
          url: '/verbs-b1b2',
          name: '135 oregelbundna verb B1-B2',
          description: 'Avancerade oregelbundna verb med böjning och quiz.',
          level: 'B1-B2',
          types: ['reference', 'quiz'],
        }),
        breadcrumb([
          { name: 'Hem', url: '/' },
          { name: 'B1-B2 verb', url: '/verbs-b1b2' },
        ]),
      ];
      if (opts.verbItems?.length) {
        graph.push(
          itemList({
            name: '135 oregelbundna verb B1-B2',
            description: 'Lista över B1-B2 verb',
            url: '/verbs-b1b2',
            items: opts.verbItems,
          }),
        );
      }
      return { '@context': 'https://schema.org', '@graph': graph };
    },
  },
  vocabulary: {
    path: '/vocabulary',
    lang: 'sv',
    title: '805 svenska ord B1-B2 med flashcards | SvenskaSpråket',
    description:
      'Träna 805 svenska ord och uttryck på B1-B2-nivå med engelsk och arabisk översättning. Interaktiva flashcards, sökbar ordlista och quiz.',
    keywords: 'svenska ord, svenska ordförråd, flashcards svenska, svenska arabiska ord',
    ogType: 'article',
    hreflang: false,
    priority: 0.9,
    changefreq: 'monthly',
    structuredData: (opts = {}) => {
      const graph = [
        learningResource({
          url: '/vocabulary',
          name: '805 svenska ord B1-B2 med flashcards',
          description: 'Sökbar svensk-engelsk-arabisk ordlista med flashcards och quiz.',
          level: 'B1-B2',
          types: ['flashcard', 'quiz', 'reference'],
        }),
        breadcrumb([
          { name: 'Hem', url: '/' },
          { name: 'Ordförråd B1-B2', url: '/vocabulary' },
        ]),
      ];
      if (opts.vocabItems?.length) {
        graph.push(
          itemList({
            name: '805 svenska ord och uttryck',
            description: 'Ordlista svenska–engelska–arabiska',
            url: '/vocabulary',
            items: opts.vocabItems,
          }),
        );
      }
      return { '@context': 'https://schema.org', '@graph': graph };
    },
  },
  lessonsA1: {
    path: '/lessons-a1',
    lang: 'sv',
    title: 'Svenska personliga pronomen A1: jag, du, han | SvenskaSpråket',
    description:
      'Lär dig svenska personliga pronomen på A1-nivå: jag, du, han, hon, vi, de och objektformerna mig, dig, honom, henne. Quiz med engelskt och arabiskt stöd.',
    keywords: 'svenska pronomen A1, personliga pronomen svenska, svensk grammatik A1',
    ogType: 'article',
    hreflang: false,
    priority: 0.8,
    changefreq: 'monthly',
    structuredData: () => ({
      '@context': 'https://schema.org',
      '@graph': [
        learningResource({
          url: '/lessons-a1',
          name: 'Svenska personliga pronomen A1',
          description: 'Interaktiv lektion om subjekt- och objektpronomen på svenska.',
          level: 'A1',
          types: ['lesson'],
        }),
        breadcrumb([
          { name: 'Hem', url: '/' },
          { name: 'Grammatik A1', url: '/lessons-a1' },
        ]),
      ],
    }),
  },
  lessonsB1: {
    path: '/lessons',
    lang: 'sv',
    title: 'Svensk grammatik B1-B2: substantiv | SvenskaSpråket',
    description:
      'Lär dig svensk grammatik B1-B2: sammansatta substantiv, genitiv samt bestämd och obestämd form. Quiz med engelskt och arabiskt stöd.',
    keywords: 'svensk grammatik B1, svenska substantiv, genitiv svenska, bestämd form',
    ogType: 'article',
    hreflang: false,
    priority: 0.8,
    changefreq: 'monthly',
    structuredData: () => ({
      '@context': 'https://schema.org',
      '@graph': [
        learningResource({
          url: '/lessons',
          name: 'Svensk grammatik B1-B2: substantiv',
          description: 'Interaktiva lektioner om sammansatta substantiv, genitiv och bestämd/obestämd form.',
          level: 'B1-B2',
          types: ['lesson'],
        }),
        breadcrumb([
          { name: 'Hem', url: '/' },
          { name: 'Grammatik B1-B2', url: '/lessons' },
        ]),
      ],
    }),
  },
  lessonA2B1Grammar: {
    path: '/lessons-a2-b1',
    lang: 'en',
    title: 'Swedish Grammar A2–B1: Word Classes and Nouns | SvenskaSpråket',
    description:
      'Learn Swedish word classes, sentence parts, noun gender, definite/indefinite forms, and plural patterns. English-medium grammar lesson for A2–B1.',
    keywords: 'Swedish grammar A2, Swedish nouns, word classes Swedish, en ett Swedish',
    ogType: 'article',
    hreflang: false,
    priority: 0.85,
    changefreq: 'monthly',
    structuredData: () => ({
      '@context': 'https://schema.org',
      '@graph': [
        learningResource({
          url: '/lessons-a2-b1',
          name: 'Swedish Grammar: Word Classes, Sentence Parts, and Nouns',
          description: 'A2–B1 lesson on Swedish word classes, sentence parts, and noun forms.',
          level: 'A2-B1',
          types: ['lesson'],
        }),
        breadcrumb([
          { name: 'Hem', url: '/' },
          { name: 'Grammatik A2–B1', url: '/lessons-a2-b1' },
        ]),
      ],
    }),
  },
  c1: {
    path: '/c1',
    lang: 'sv',
    title: 'C1 svenska – kommer snart | Svenska Språket',
    description:
      'Avancerad svenska på C1-nivå kommer snart till Svenska Språket. Till dess kan du träna verb, ordförråd och grammatik på A1–B2.',
    keywords: 'svenska C1, avancerad svenska, C1 kurs',
    ogType: 'website',
    hreflang: false,
    noindex: true,
    priority: 0,
    changefreq: 'monthly',
    structuredData: () => ({
      '@context': 'https://schema.org',
      '@graph': [
        learningResource({
          url: '/c1',
          name: 'C1 svenska – kommer snart',
          description: 'Avancerat C1-material publiceras snart. Till dess finns verb, ordförråd och grammatik på A1–B2.',
          level: 'C1',
          types: ['course'],
        }),
        breadcrumb([
          { name: 'Hem', url: '/' },
          { name: 'C1 – kommer snart', url: '/c1' },
        ]),
      ],
    }),
  },
  lessonB2C1: {
    path: '/lessons-b2c1',
    lang: 'sv',
    title: 'Rivstart B2/C1 – Kapitel 1–3: ord och verb | SvenskaSpråket',
    description:
      'Träna 123 svenska B2–C1-ord och verb med engelsk och arabisk översättning, sökning, flashcards och quiz. Källkredit: AnnaRansheim (Quizlet).',
    keywords: 'Rivstart B2 C1, svenska ord, svenska verb, AnnaRansheim, Quizlet',
    ogType: 'article',
    hreflang: false,
    noindex: true,
    priority: 0,
    changefreq: 'monthly',
    structuredData: () => ({
      '@context': 'https://schema.org',
      '@graph': [
        learningResource({
          url: '/lessons-b2c1',
          name: 'Rivstart B2/C1 – Kapitel 1–3: ord och verb',
          description:
            '123 ord och verb från Quizlet-uppsättningar av AnnaRansheim. Oberoende studieanpassning — inte officiellt förlagsmaterial.',
          level: 'B2-C1',
          types: ['course'],
        }),
        breadcrumb([
          { name: 'Hem', url: '/' },
          { name: 'Rivstart B2/C1', url: '/lessons-b2c1' },
        ]),
      ],
    }),
  },
  ...LUND_LEVEL_PAGE_SEO,
  notFound: {
    path: '/404',
    lang: 'sv',
    title: 'Sidan hittades inte | SvenskaSpråket',
    description: 'Sidan du söker finns inte på SvenskaSpråket.',
    noindex: true,
    hreflang: false,
    priority: 0,
    changefreq: 'yearly',
    structuredData: null,
  },
  admin: {
    path: '/admin',
    lang: 'sv',
    title: 'Admin | SvenskaSpråket',
    description: 'Administrationspanel för SvenskaSpråket.',
    noindex: true,
    hreflang: false,
    priority: 0,
    changefreq: 'never',
    structuredData: null,
  },
  adminLogin: {
    path: '/admin/login',
    lang: 'sv',
    title: 'Logga in | Admin | SvenskaSpråket',
    description: 'Administratörsinloggning för SvenskaSpråket.',
    noindex: true,
    hreflang: false,
    priority: 0,
    changefreq: 'never',
    structuredData: null,
  },
  adminAuthCallback: {
    path: '/admin/auth/callback',
    lang: 'sv',
    title: 'Google-inloggning | Admin | SvenskaSpråket',
    description: 'OAuth-callback för administratörsinloggning.',
    noindex: true,
    hreflang: false,
    priority: 0,
    changefreq: 'never',
    structuredData: null,
  },
};

export function getPageSeo(key, opts = {}) {
  const page = PAGE_SEO[key];
  if (!page) return null;
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    canonical: canonicalUrl(page.path),
    lang: page.lang,
    hreflang: page.hreflang ?? false,
    noindex: page.noindex ?? false,
    ogType: page.ogType ?? 'website',
    structuredData: page.structuredData?.(opts) ?? null,
  };
}

/** Build structured data with ItemList for prerender/build */
export function getPageStructuredData(key, opts = {}) {
  const page = PAGE_SEO[key];
  return page?.structuredData?.(opts) ?? null;
}

/** URLs for sitemap generation — no trailing slashes on paths (root uses base/) */
export function getSitemapEntries() {
  return Object.values(PAGE_SEO)
    .filter((p) => !p.noindex && p.priority > 0)
    .map((p) => ({
      loc: canonicalUrl(p.path),
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: p.changefreq,
      priority: p.priority,
      hreflang: p.hreflang,
    }));
}
