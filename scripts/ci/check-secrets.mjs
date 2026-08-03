#!/usr/bin/env node
/**
 * Scan tracked source files for accidentally committed secrets.
 * Exit 1 if suspicious patterns are found.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const FORBIDDEN_FILES = ['.env', '.env.local', '.env.production', '.env.staging'];

const PATTERNS = [
  { name: 'Supabase service role JWT', re: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ },
  { name: 'Hardcoded service role assignment', re: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"]?eyJ/i },
  { name: 'Private API key prefix', re: /(?:sk_live|sk_test|rk_live)_[A-Za-z0-9]+/ },
  { name: 'AWS access key', re: /AKIA[0-9A-Z]{16}/ },
];

function gitFiles() {
  try {
    const out = execSync('git ls-files', { cwd: root, encoding: 'utf8' });
    return out.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

let failed = false;

for (const f of FORBIDDEN_FILES) {
  if (existsSync(resolve(root, f))) {
    console.error(`✗ Forbidden file present: ${f}`);
    failed = true;
  }
}

const allowlist = new Set(['.env.example', 'scripts/ci/check-secrets.mjs']);

for (const file of gitFiles()) {
  if (allowlist.has(file)) continue;
  if (file.startsWith('.env')) {
    console.error(`✗ Env file tracked by git: ${file}`);
    failed = true;
    continue;
  }
  if (!/\.(js|jsx|ts|tsx|mjs|json|md|yml|yaml|html|css|sql|env\.example)$/.test(file)) continue;

  const full = resolve(root, file);
  if (!existsSync(full)) continue;
  const content = readFileSync(full, 'utf8');

  for (const { name, re } of PATTERNS) {
    if (re.test(content) && !file.endsWith('.example') && !file.includes('check-secrets')) {
      console.error(`✗ Possible ${name} in ${file}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error('\nSecret scan failed. Remove secrets before committing.');
  process.exit(1);
}

console.log('✓ No committed secrets detected');
