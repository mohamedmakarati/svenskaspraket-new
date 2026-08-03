# SEO setup for svenskaspraket.com

The website includes page-specific titles and descriptions, canonical URLs, index directives, Open Graph and Twitter metadata, JSON-LD structured data, a sitemap, robots.txt, semantic headings, descriptive image alt text, internal links, a favicon, a web manifest, a social-sharing image, a custom 404 page, compression, and cache rules.

## After uploading to Hostinger

1. Confirm that `https://svenskaspraket.com/robots.txt` and `https://svenskaspraket.com/sitemap.xml` open publicly.
2. Add the domain property in Google Search Console using a DNS TXT record.
3. Submit `https://svenskaspraket.com/sitemap.xml` in Search Console.
4. Inspect the homepage plus every lesson and verb URL, then request indexing.
5. Add the site to Bing Webmaster Tools and submit the same sitemap.
6. Test the deployed pages with Google Rich Results Test and PageSpeed Insights.
7. Connect a privacy-friendly analytics service or Google Analytics only if traffic measurement is needed.

## Content plan

Publish focused pages over time for searches such as `svenska verb A1`, `svenska verb A2`, `oregelbundna svenska verb`, `svensk grammatik B1`, and `svenska ord med arabisk översättning`. Each new page should have original explanations, examples, exercises, a unique title and description, a canonical URL, and a sitemap entry.

## Multilingual SEO

The site now has fully localized landing pages at `/` (Swedish), `/en/` (English), and `/ar/` (Arabic). Each page has a self-referencing canonical URL and reciprocal `hreflang` links for `sv`, `en`, `ar`, and `x-default`. Keep these URLs stable and translate new landing-page content across all three versions.

In Search Console, inspect all three homepage URLs after deployment. Submit the shared sitemap once; it contains the language alternatives.
