#!/usr/bin/env node
/**
 * Verify React Router paths and sitemap include expected public routes.
 * Ensures SPA refresh targets are registered.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGE_SEO } from '../../src/lib/seo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const REQUIRED_SPA_ROUTES = [
  '/',
  '/en',
  '/ar',
  '/verbs',
  '/verbs-a2',
  '/verbs-b1b2',
  '/vocabulary',
  '/lessons-a1',
  '/lessons',
  '/c1',
  '/admin',
  '/admin/login',
  '/admin/auth/callback',
  '/admin/verbs',
  '/admin/vocabulary',
  '/admin/lessons',
];

const STATIC_FILES = [
  '/sitemap.xml',
  '/robots.txt',
  '/favicon.svg',
  '/og-image.png',
  '/verbs-data.json',
  '/quizlet-vocabulary.json',
];

let failed = false;

function fail(msg) {
  console.error(`✗ ${msg}`);
  failed = true;
}

const appSrc = readFileSync(resolve(root, 'src/App.jsx'), 'utf8');

for (const route of REQUIRED_SPA_ROUTES) {
  const segment = route.replace(/^\//, '').split('/').pop();
  if (route === '/') {
    if (!appSrc.includes('path="/"')) fail('Missing route: /');
  } else if (!appSrc.includes(`path="${route}"`) && !appSrc.includes(`"${segment}"`)) {
    fail(`Route may be missing from App.jsx: ${route}`);
  }
}

const seoPaths = new Set(Object.values(PAGE_SEO).map((p) => p.path));
for (const route of ['/', '/en', '/ar', '/verbs', '/vocabulary', '/lessons-a1', '/lessons']) {
  if (!seoPaths.has(route)) fail(`SEO registry missing: ${route}`);
}

const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
for (const route of ['/', '/en', '/ar', '/verbs', '/vocabulary']) {
  if (!sitemap.includes(`<loc>https://svenskaspraket.com${route === '/' ? '/' : route}</loc>`)) {
    fail(`sitemap.xml missing: ${route}`);
  }
}

for (const file of STATIC_FILES) {
  const rel = file.replace(/^\//, '');
  const path = resolve(root, 'public', rel);
  try {
    readFileSync(path);
  } catch {
    fail(`Missing static public file: ${file}`);
  }
}

const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf8');
if (!/Disallow:\s*\/admin/i.test(robots)) fail('robots.txt must disallow /admin');

if (sitemap.includes('https://svenskaspraket.com/c1')) {
  fail('sitemap.xml must not include /c1 (noindex coming-soon page)');
}

if (failed) process.exit(1);
console.log(`✓ Routes, sitemap and static files verified (${REQUIRED_SPA_ROUTES.length} SPA routes)`);
