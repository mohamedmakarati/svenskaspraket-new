/** Map Supabase/API errors to safe user-facing messages (no tokens or internals). */
export function toAdminError(error) {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code ?? '';
  const msg = String(error.message ?? '');

  if (code === 'PGRST301' || msg.includes('JWT')) {
    return 'Your session has expired. Please sign in again.';
  }
  if (code === '42501' || msg.includes('permission') || msg.includes('policy')) {
    return 'You do not have permission to perform this action.';
  }
  if (code === '23505' || msg.includes('duplicate')) {
    return 'This record already exists (duplicate slug or word).';
  }
  if (code === '23503') {
    return 'Cannot complete action: related records exist.';
  }
  if (msg.includes('Invalid login')) {
    return 'Invalid email or password.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }
  return 'Something went wrong. Please try again.';
}
