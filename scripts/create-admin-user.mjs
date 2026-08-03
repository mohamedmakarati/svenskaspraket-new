#!/usr/bin/env node
/**
 * Create or update an admin user (local only — uses service role from .env).
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='your-password' node scripts/create-admin-user.mjs
 *
 * Never commit passwords. Do not run in CI.
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseConfig } from './import/env.mjs';

loadEnv();

const email = process.env.ADMIN_EMAIL?.trim();
const password = process.env.ADMIN_PASSWORD;
const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || email?.split('@')[0] || 'Admin';

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
  console.error('Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret node scripts/create-admin-user.mjs');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const { url, key } = getSupabaseConfig({ requireServiceRole: true });
const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase()) ?? null;
}

async function ensureAdminProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin', display_name: displayName })
    .eq('id', userId)
    .select('id, display_name, role, preferred_language')
    .single();

  if (error) throw error;
  return data;
}

async function main() {
  let user = await findUserByEmail(email);

  if (user) {
    console.log(`User already exists (${user.id}). Updating password and admin role…`);
    const { data: updated, error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (error) throw error;
    user = updated.user;
  } else {
    console.log('Creating new user…');
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName, preferred_language: 'sv' },
    });
    if (error) throw error;
    user = data.user;
  }

  // Profile row is created by DB trigger; brief wait if needed
  let profile = null;
  for (let i = 0; i < 5; i++) {
    try {
      profile = await ensureAdminProfile(user.id);
      break;
    } catch (e) {
      if (i === 4) throw e;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log('✓ Admin user ready');
  console.log(`  Email: ${email}`);
  console.log(`  Role:  ${profile.role}`);
  console.log(`  Login: /admin/login`);
}

main().catch((err) => {
  const msg = err.message || String(err);
  console.error('Failed:', msg);
  if (msg.includes('profiles')) {
    console.error('\nThe profiles table is missing. Apply Supabase migrations first:');
    console.error('  supabase/migrations/001 … 007 in the Supabase SQL Editor (see supabase/README.md)');
  }
  process.exit(1);
});
