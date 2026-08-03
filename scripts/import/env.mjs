/**
 * Load environment from local .env (never committed).
 * Service role key is server-side only.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, '../..');

export function loadEnv() {
  const paths = [resolve(ROOT, '.env'), resolve(ROOT, '.env.local')];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    readFileSync(p, 'utf8')
      .split('\n')
      .forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eq = trimmed.indexOf('=');
        if (eq <= 0) return;
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim();
        if (k && !process.env[k]) process.env[k] = v;
      });
  }
}

export function getSupabaseConfig({ requireServiceRole = false } = {}) {
  loadEnv();
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || url.includes('your-project')) {
    throw new Error('Set VITE_SUPABASE_URL in local .env');
  }

  if (requireServiceRole) {
    if (!serviceKey || serviceKey.includes('your-service-role')) {
      throw new Error('Set SUPABASE_SERVICE_ROLE_KEY in local .env (never commit this file)');
    }
    return { url, key: serviceKey, mode: 'service' };
  }

  return { url, key: anonKey, mode: 'anon' };
}

/** Block accidental production import unless explicitly confirmed */
export function assertImportAllowed(options) {
  if (options.validateOnly || options.dryRun) return;

  const force = process.env.IMPORT_ALLOW_PRODUCTION === 'yes';
  const env = process.env.IMPORT_ENV || 'staging';

  if (env === 'production' && !force) {
    throw new Error(
      'Production import blocked. Set IMPORT_ENV=staging or IMPORT_ALLOW_PRODUCTION=yes in .env after explicit approval.',
    );
  }
}
