import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { uploadMedia } from '@/lib/data';
import { validateUpload } from '@/lib/utils';

export default function AdminMediaPage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function load() {
    const { data, error: err } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    if (err) throw err;
    setFiles(data ?? []);
  }

  useEffect(() => { load().catch((e) => setError(e.message)); }, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    const validation = validateUpload(file);
    if (validation) { setError(validation); return; }
    setUploading(true);
    setError('');
    try {
      await uploadMedia(file);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <>
      <h1>{t('admin.media')}</h1>
      <label className="btn" style={{ display: 'inline-block', cursor: 'pointer' }}>
        {uploading ? t('common.loading') : 'Ladda upp bild'}
        <input type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp" onChange={handleUpload} style={{ display: 'none' }} />
      </label>
      {error && <p style={{ color: 'var(--bad)' }}>{error}</p>}
      <div className="grid-3" style={{ marginTop: 24 }}>
        {files.map((f) => (
          <article key={f.id} className="card">
            <strong>{f.filename}</strong>
            <p>{f.mime_type} · {(f.size_bytes / 1024).toFixed(1)} KB</p>
            <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{f.storage_path}</code>
          </article>
        ))}
      </div>
    </>
  );
}
