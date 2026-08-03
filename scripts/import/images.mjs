/**
 * Upload verb SVG images to Supabase Storage (idempotent).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { ROOT } from './env.mjs';

const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

export async function uploadVerbImages(supabase, verbs, report, { dryRun = false } = {}) {
  const uploaded = new Map();
  const uniquePaths = [...new Set(verbs.filter((v) => v.image_path).map((v) => v.image_path))];

  for (const publicPath of uniquePaths) {
    const rel = publicPath.replace(/^\//, '');
    const localPath = resolve(ROOT, 'public', rel);
    const storagePath = rel;

    if (!existsSync(localPath)) {
      report.skipped.push({ source_key: storagePath, message: `Local file missing: ${localPath}` });
      continue;
    }

    if (dryRun) {
      report.imported.push({ source_key: storagePath, action: 'would upload image' });
      report.summary.imagesUploaded++;
      uploaded.set(publicPath, `/storage/${storagePath}`);
      continue;
    }

    const ext = localPath.slice(localPath.lastIndexOf('.')).toLowerCase();
    const contentType = MIME[ext] ?? 'application/octet-stream';
    const body = readFileSync(localPath);

    const { data: existing } = await supabase.storage.from('media').list(storagePath.split('/').slice(0, -1).join('/') || '', {
      search: basename(storagePath),
    });

    if (existing?.some((f) => f.name === basename(storagePath))) {
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(storagePath);
      uploaded.set(publicPath, urlData.publicUrl);
      report.updated.push({ source_key: storagePath, action: 'image already in storage' });
      report.summary.imagesSkipped++;
      continue;
    }

    const { error } = await supabase.storage.from('media').upload(storagePath, body, {
      contentType,
      upsert: true,
      cacheControl: '31536000',
    });

    if (error) {
      report.skipped.push({ source_key: storagePath, message: `Upload failed: ${error.message}` });
      continue;
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(storagePath);
    uploaded.set(publicPath, urlData.publicUrl);

    await supabase.from('media').upsert(
      {
        storage_path: storagePath,
        file_name: basename(storagePath),
        mime_type: contentType,
        file_size: body.length,
        alt_text_sv: basename(storagePath, ext),
      },
      { onConflict: 'storage_path' },
    );

    report.imported.push({ source_key: storagePath, action: 'uploaded image' });
    report.summary.imagesUploaded++;
  }

  return uploaded;
}

export function applyImageUrls(verbs, urlMap) {
  return verbs.map((v) => {
    if (!v.image_path || !urlMap.has(v.image_path)) return v;
    return { ...v, image_path: urlMap.get(v.image_path) };
  });
}
