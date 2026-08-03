/** Canonical site URL — safe to import from Node CI scripts and Vite. */
function readEnv(key) {
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
    return import.meta.env[key];
  }
  return process.env[key];
}

export const SITE_URL = readEnv('VITE_SITE_URL') || 'https://svenskaspraket.com';
