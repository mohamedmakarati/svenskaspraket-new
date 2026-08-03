#!/usr/bin/env node
/**
 * Verify sv / en / ar translation keys are in sync (admin i18n).
 */
import i18n from '../../src/i18n/index.js';

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

const resources = i18n.options.resources;
const langs = ['sv', 'en', 'ar'];
const keySets = Object.fromEntries(
  langs.map((lang) => [lang, new Set(flattenKeys(resources[lang].translation))]),
);

const svKeys = keySets.sv;
let failed = false;

for (const lang of ['en', 'ar']) {
  for (const key of svKeys) {
    if (!keySets[lang].has(key)) {
      console.error(`✗ Missing ${lang} key: ${key}`);
      failed = true;
    }
  }
  for (const key of keySets[lang]) {
    if (!svKeys.has(key)) {
      console.error(`✗ Extra ${lang} key (not in sv): ${key}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`✓ i18n keys in sync across ${langs.join(', ')} (${svKeys.size} keys each)`);
