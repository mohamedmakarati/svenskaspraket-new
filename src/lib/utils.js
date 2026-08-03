import DOMPurify from 'dompurify';

/** Sanitize HTML before rendering with dangerouslySetInnerHTML */
export function sanitizeHtml(dirty) {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'span', 'h2', 'h3', 'h4'],
    ALLOWED_ATTR: ['dir', 'class'],
  });
}

/** Escape plain text for safe display */
export function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

export function normalizeSearch(value) {
  return String(value)
    .toLocaleLowerCase('sv')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export const ALLOWED_IMAGE_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

export function validateUpload(file) {
  if (!file) return 'Ingen fil vald.';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Otillåten filtyp. Använd SVG, PNG, JPEG eller WebP.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'Filen är för stor. Max 2 MB.';
  }
  return null;
}

export function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toCsv(rows, columns) {
  const header = columns.join(',');
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const val = row[col] ?? '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(','),
    )
    .join('\n');
  return `${header}\n${body}`;
}
