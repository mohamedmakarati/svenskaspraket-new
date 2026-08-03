import { useEffect } from 'react';
import { SEO, getPageSeo } from '@/lib/seo';
import { canonicalUrl } from '@/lib/seoUrls';

function setMeta(name, content, property = false) {
  if (!content) return;
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(name, property = false) {
  const attr = property ? 'property' : 'name';
  document.querySelector(`meta[${attr}="${name}"]`)?.remove();
}

function setMultiMeta(name, values, property = false) {
  const attr = property ? 'property' : 'name';
  document.querySelectorAll(`meta[${attr}="${name}"]`).forEach((el) => el.remove());
  values.forEach((content) => {
    const el = document.createElement('meta');
    el.setAttribute(attr, name);
    el.setAttribute('content', content);
    document.head.appendChild(el);
  });
}

function setLink(rel, href, extra = {}) {
  if (!href) return;
  let selector = `link[rel="${rel}"]`;
  if (extra.hreflang) selector += `[hreflang="${extra.hreflang}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  if (extra.hreflang) el.setAttribute('hreflang', extra.hreflang);
}

function clearHreflang() {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
}

export default function SeoHead({
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

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = fullTitle;

    setMeta('description', description);
    setMeta('author', SEO.author);
    setMeta('theme-color', '#075db8');
    if (keywords) setMeta('keywords', keywords);
    else removeMeta('keywords');

    setLink('canonical', canonicalHref);
    setMeta(
      'robots',
      noindex
        ? 'noindex,nofollow'
        : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
    );

    setMeta('og:type', ogType, true);
    setMeta('og:locale', SEO.locale[lang] ?? SEO.locale.sv, true);
    setMeta('og:site_name', SEO.siteName, true);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:url', canonicalHref, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:image:width', String(SEO.ogImageWidth), true);
    setMeta('og:image:height', String(SEO.ogImageHeight), true);
    setMeta('og:image:alt', ogImageAlt, true);

    if (hreflang) {
      setMultiMeta('og:locale:alternate', [SEO.locale.en, SEO.locale.ar], true);
    } else {
      document.querySelectorAll('meta[property="og:locale:alternate"]').forEach((el) => el.remove());
    }

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    clearHreflang();
    if (hreflang) {
      setLink('alternate', `${SEO.siteUrl}/`, { hreflang: 'sv' });
      setLink('alternate', `${SEO.siteUrl}/en`, { hreflang: 'en' });
      setLink('alternate', `${SEO.siteUrl}/ar`, { hreflang: 'ar' });
      setLink('alternate', `${SEO.siteUrl}/`, { hreflang: 'x-default' });
    }

    document.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
    if (structuredData) {
      const scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.setAttribute('data-seo-jsonld', 'true');
      scriptEl.textContent = JSON.stringify(structuredData);
      document.head.appendChild(scriptEl);
    }
  }, [fullTitle, description, keywords, canonicalHref, lang, hreflang, noindex, ogType, ogImage, ogImageAlt, structuredData]);

  return null;
}

export function PageSeo({ pageKey, overrides = {} }) {
  const base = getPageSeo(pageKey);
  if (!base) return null;
  const seo = { ...base, ...overrides };
  return <SeoHead {...seo} />;
}
