#!/usr/bin/env node
/**
 * One-shot Supabase setup for the admin panel:
 * 1. Verify frontend env (VITE_SUPABASE_*)
 * 2. Check / apply database schema
 * 3. Create or promote admin user
 *
 * Prerequisites in .env:
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_DB_PASSWORD  (or DATABASE_URL) — for schema apply
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret npm run setup:supabase
 */
import { createClient } from '@supabase/supabase-js';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, getSupabaseConfig, ROOT } from './import/env.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function tableExists(supabase, name) {
  const { error } = await supabase.from(name).select('*').limit(1);
  if (!error) return true;
  if (error.message?.includes('Could not find the table')) return false;
  throw error;
}

async function main() {
  loadEnv();

  const url = process.env.VITE_SUPABASE_URL;
  const ref = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  console.log('Supabase project:', ref || '(unknown)');

  if (!process.env.VITE_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in .env');
  }

  const { url: sbUrl, key } = getSupabaseConfig({ requireServiceRole: true });
  const supabase = createClient(sbUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const hasProfiles = await tableExists(supabase, 'profiles');
  const hasVerbs = await tableExists(supabase, 'verbs');

  if (!hasProfiles || !hasVerbs) {
    console.log('\nDatabase schema missing — applying migrations…');
    const script = resolve(__dirname, 'apply-supabase-schema.mjs');
    const result = spawnSync(process.execPath, [script], { stdio: 'inherit', env: process.env });
    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  } else {
    console.log('✓ Database schema already present');
  }

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (email && password) {
    console.log('\nCreating / updating admin user…');
    const adminScript = resolve(__dirname, 'create-admin-user.mjs');
    const result = spawnSync(process.execPath, [adminScript], { stdio: 'inherit', env: process.env });
    if (result.status !== 0) process.exit(result.status ?? 1);
  } else {
    console.log('\nSkip admin user (set ADMIN_EMAIL and ADMIN_PASSWORD to create one).');
    console.log('Or promote an existing user in SQL Editor:');
    console.log("  UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');");
  }

  console.log('\n✓ Admin panel connection ready');
  console.log('  Local:  npm run dev  →  http://localhost:5173/admin/login');
  console.log('  Production: set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in Hostinger build env');
}

main().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
