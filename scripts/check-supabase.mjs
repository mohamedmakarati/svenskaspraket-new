#!/usr/bin/env node
/** Quick health check for Supabase ↔ admin panel wiring. */
import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseConfig } from './import/env.mjs';

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const ref = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

console.log('Project ref:', ref ?? 'not set');
console.log('Frontend URL configured:', Boolean(url && !url.includes('your-project')));
console.log('Anon key configured:', Boolean(process.env.VITE_SUPABASE_ANON_KEY));
console.log('Service role configured:', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));

if (!url || url.includes('your-project')) {
  console.error('\n✗ Set VITE_SUPABASE_URL in .env');
  process.exit(1);
}

const { key } = getSupabaseConfig();
const anon = createClient(url, key);
const tables = ['profiles', 'verbs', 'vocabulary', 'lessons', 'quiz_questions', 'media'];

for (const table of tables) {
  const { error } = await anon.from(table).select('id').limit(1);
  const status = error?.message?.includes('Could not find the table') ? 'MISSING' : error ? 'ERROR' : 'OK';
  console.log(`  ${table}: ${status}${error && status !== 'MISSING' ? ` (${error.message})` : ''}`);
}

const { key: serviceKey } = getSupabaseConfig({ requireServiceRole: true });
const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const { error: authErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
console.log('Auth admin API:', authErr ? authErr.message : 'OK');

console.log('\nNext: npm run setup:supabase (needs SUPABASE_DB_PASSWORD in .env)');
