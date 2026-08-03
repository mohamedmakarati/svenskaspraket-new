import { useEffect } from 'react';
import { SITE_URL } from '@/lib/supabase';

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

export default function SeoHead({
  title,
  description,
  canonical,
  lang = 'sv',
  hreflang = true,
  noindex = false,
  ogType = 'website',
  ogImage = `${SITE_URL}/og-image.png`,
  structuredData,
}) {
  const fullTitle = title?.includes('SvenskaSpråket') ? title : `${title} | SvenskaSpråket`;
  const canonicalUrl = canonical?.startsWith('http') ? canonical : `${SITE_URL}${canonical || '/'}`;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = fullTitle;

    setMeta('description', description);
    setLink('canonical', canonicalUrl);
    setMeta('robots', noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1');

    setMeta('og:type', ogType, true);
    setMeta('og:locale', lang === 'ar' ? 'ar_AR' : lang === 'en' ? 'en_US' : 'sv_SE', true);
    setMeta('og:site_name', 'SvenskaSpråket', true);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:image', ogImage, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    if (hreflang) {
      setLink('alternate', `${SITE_URL}/`, { hreflang: 'sv' });
      setLink('alternate', `${SITE_URL}/en`, { hreflang: 'en' });
      setLink('alternate', `${SITE_URL}/ar`, { hreflang: 'ar' });
      setLink('alternate', `${SITE_URL}/`, { hreflang: 'x-default' });
    }

    let scriptEl = document.getElementById('structured-data');
    if (structuredData) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'structured-data';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(structuredData);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [fullTitle, description, canonicalUrl, lang, hreflang, noindex, ogType, ogImage, structuredData]);

  return null;
}
