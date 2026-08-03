/**
 * Build static <head> SEO tags as HTML (used by prerender script).
 */
import { SEO } from './seo.js';
import { canonicalUrl, hreflangAlternates } from './seoUrls.js';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildSeoHeadHtml({
  title,
  description,
  keywords,
  canonical,
  lang = 'sv',
  hreflang = false,
  noindex = false,
  ogType = 'website',
  ogImage = SEO.ogImage,
  ogImageAlt = SEO.ogImageAlt,
  structuredData,
}) {
  const fullTitle =
    title?.includes('Svenska Språket') || title?.includes('SvenskaSpråket')
      ? title
      : `${title} | SvenskaSpråket`;
  const canonicalHref = canonical?.startsWith('http') ? canonical : canonicalUrl(canonical || '/');
  const robots = noindex
    ? 'noindex,nofollow'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

  const lines = [
    `<meta charset="UTF-8" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
    `<meta name="theme-color" content="#075db8" />`,
    `<title>${esc(fullTitle)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="author" content="${esc(SEO.author)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${esc(canonicalHref)}" />`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`,
    `<link rel="manifest" href="/site.webmanifest" />`,
    `<meta property="og:type" content="${esc(ogType)}" />`,
    `<meta property="og:locale" content="${esc(SEO.locale[lang] ?? SEO.locale.sv)}" />`,
    `<meta property="og:site_name" content="${esc(SEO.siteName)}" />`,
    `<meta property="og:title" content="${esc(fullTitle)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(canonicalHref)}" />`,
    `<meta property="og:image" content="${esc(ogImage)}" />`,
    `<meta property="og:image:width" content="${SEO.ogImageWidth}" />`,
    `<meta property="og:image:height" content="${SEO.ogImageHeight}" />`,
    `<meta property="og:image:alt" content="${esc(ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(fullTitle)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(ogImage)}" />`,
  ];

  if (keywords) lines.push(`<meta name="keywords" content="${esc(keywords)}" />`);

  if (hreflang) {
    for (const alt of hreflangAlternates()) {
      lines.push(`<link rel="alternate" hreflang="${esc(alt.lang)}" href="${esc(alt.href)}" />`);
    }
    lines.push(`<meta property="og:locale:alternate" content="${SEO.locale.en}" />`);
    lines.push(`<meta property="og:locale:alternate" content="${SEO.locale.ar}" />`);
  }

  if (structuredData) {
    lines.push(
      `<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>`,
    );
  }

  return lines.join('\n    ');
}

export function buildPrerenderBody({ h1, intro, dir = 'ltr', lang = 'sv' }) {
  return `<div id="prerender-fallback" data-prerender="true" lang="${esc(lang)}" dir="${esc(dir)}">
      <main class="wrap section">
        <h1>${esc(h1)}</h1>
        <p class="lead">${esc(intro)}</p>
      </main>
    </div>`;
}
