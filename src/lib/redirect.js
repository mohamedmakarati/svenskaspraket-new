/** Prevent open redirects — only allow internal admin paths. */
export function safeAdminRedirect(path, fallback = '/admin') {
  if (!path || typeof path !== 'string') return fallback;
  if (!path.startsWith('/admin')) return fallback;
  if (path.startsWith('//') || path.includes('://')) return fallback;
  return path;
}
