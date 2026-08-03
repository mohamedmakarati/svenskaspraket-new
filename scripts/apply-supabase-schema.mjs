#!/usr/bin/env node
/**
 * Apply supabase/migrations/*.sql to a linked Postgres database.
 *
 * Set one of:
 *   DATABASE_URL=postgresql://postgres.[ref]:[password]@...pooler.supabase.com:6543/postgres
 *   SUPABASE_DB_PASSWORD=your-db-password  (uses project ref from VITE_SUPABASE_URL)
 *
 * Usage: node scripts/apply-supabase-schema.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { loadEnv, ROOT } from './import/env.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = resolve(ROOT, 'supabase/migrations');

function getDatabaseUrl() {
  loadEnv();
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const projectUrl = process.env.VITE_SUPABASE_URL?.trim();
  const ref = projectUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const region = process.env.SUPABASE_DB_REGION?.trim() || 'eu-central-1';

  if (password && ref) {
    return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  }

  throw new Error(
    'Set DATABASE_URL or SUPABASE_DB_PASSWORD in .env.\n' +
      'Get the database password: Supabase Dashboard → Project Settings → Database → Connection string (URI).',
  );
}

function listMigrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^(\d{14}|\d{3})_.+\.sql$/.test(f))
    .sort();
}

async function main() {
  const connectionString = getDatabaseUrl();
  const files = listMigrationFiles();
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

  console.log(`Connecting to Supabase Postgres (${files.length} migration files)…`);
  await client.connect();

  try {
    for (const file of files) {
      const sql = readFileSync(resolve(MIGRATIONS_DIR, file), 'utf8');
      process.stdout.write(`  → ${file} … `);
      await client.query(sql);
      console.log('OK');
    }

    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log(`\n✓ Schema applied — ${rows.length} public tables:`);
    console.log(`  ${rows.map((r) => r.table_name).join(', ')}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('\nSchema apply failed:', err.message);
  if (/password authentication failed/i.test(err.message)) {
    console.error('Check SUPABASE_DB_PASSWORD or DATABASE_URL in .env.');
  }
  process.exit(1);
});
