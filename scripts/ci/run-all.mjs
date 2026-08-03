#!/usr/bin/env node
/**
 * Run all CI checks locally (mirrors GitHub Actions).
 */
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const steps = [
  { name: 'Secret scan', cmd: 'node', args: ['scripts/ci/check-secrets.mjs'] },
  { name: 'Link & route check', cmd: 'node', args: ['scripts/ci/check-links.mjs'] },
  { name: 'i18n sync', cmd: 'node', args: ['scripts/ci/check-i18n.mjs'] },
  { name: 'SEO metadata', cmd: 'node', args: ['scripts/ci/check-seo.mjs'] },
  { name: 'Unit tests', cmd: 'npm', args: ['test'] },
  { name: 'Production build', cmd: 'npm', args: ['run', 'build'], env: {
    VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'placeholder-anon-key-for-ci-build',
    VITE_SITE_URL: 'https://svenskaspraket.com',
  }},
  { name: 'Prerender verification', cmd: 'node', args: ['scripts/ci/check-prerender.mjs'] },
];

console.log('SvenskaSpråket CI\n');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

for (const step of steps) {
  process.stdout.write(`→ ${step.name}… `);
  const cmd = step.cmd === 'npm' ? npmCmd : step.cmd;
  const result = spawnSync(cmd, step.args, {
    cwd: root,
    stdio: 'pipe',
    encoding: 'utf8',
    env: { ...process.env, ...step.env },
  });
  if (result.status !== 0) {
    console.log('FAILED\n');
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  console.log('OK');
}

console.log('\n✓ All CI checks passed');
