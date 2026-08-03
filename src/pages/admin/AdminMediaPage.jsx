import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminListMedia,
  adminUploadMedia,
  adminDeleteMedia,
  adminUpdateMedia,
  getMediaPublicUrl,
} from '@/lib/adminApi';
import { toAdminError } from '@/lib/adminErrors';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/context/ToastContext';
import { PageHeader, FormField, LanguageTabs, useConfirm } from '@/components/admin/AdminUi';

export default function AdminMediaPage() {
  const { t } = useTranslation();
  const { canEdit, canDelete } = usePermissions();
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [langTab, setLangTab] = useState('sv');
  const [alt, setAlt] = useState({ sv: '', en: '', ar: '' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'media'],
    queryFn: adminListMedia,
  });

  const uploadMut = useMutation({
    mutationFn: (file) => adminUploadMedia(file, { sv: file.name, en: file.name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'media'] });
      toast(t('admin.uploaded'), 'success');
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, updates }) => adminUpdateMedia(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'media'] });
      toast(t('admin.saved'), 'success');
      setEditing(null);
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminDeleteMedia(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'media'] });
      toast(t('admin.deleted'), 'success');
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  function openEdit(file) {
    setEditing(file);
    setAlt({
      sv: file.alt_text_sv ?? '',
      en: file.alt_text_en ?? '',
      ar: file.alt_text_ar ?? '',
    });
  }

  return (
    <>
      {dialog}
      <PageHeader title={t('admin.media')} />
      {canEdit && (
        <label className="btn" style={{ cursor: 'pointer', display: 'inline-block' }}>
          {t('admin.upload')}
          <input
            type="file"
            hidden
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadMut.mutate(f);
              e.target.value = '';
            }}
          />
        </label>
      )}
      {error && <p className="admin-field__error">{toAdminError(error)}</p>}
      {isLoading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <div className="admin-media-grid">
          {(data ?? []).map((f) => (
            <article key={f.id} className="admin-card">
              <img src={getMediaPublicUrl(f.storage_path)} alt={f.alt_text_sv ?? f.file_name} className="admin-media-thumb" />
              <strong>{f.file_name}</strong>
              <p>
                {f.mime_type} · {(f.file_size / 1024).toFixed(1)} KB
              </p>
              <code className="admin-media-path">{f.storage_path}</code>
              {f.alt_text_sv && <small>{f.alt_text_sv}</small>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {canEdit && (
                  <button type="button" className="btn secondary" onClick={() => openEdit(f)}>
                    {t('admin.editAltText')}
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    className="btn danger"
                    onClick={async () => {
                      if (await confirm({ message: f.file_name })) deleteMut.mutate(f.id);
                    }}
                  >
                    {t('admin.delete')}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <form
            className="admin-modal"
            onSubmit={(e) => {
              e.preventDefault();
              updateMut.mutate({
                id: editing.id,
                updates: {
                  alt_text_sv: alt.sv || null,
                  alt_text_en: alt.en || null,
                  alt_text_ar: alt.ar || null,
                },
              });
            }}
          >
            <h2>{t('admin.editAltText')}</h2>
            <LanguageTabs active={langTab} onChange={setLangTab}>
              {(lang) => (
                <FormField label={`${t('admin.altText')} (${lang})`}>
                  <input
                    className="admin-input"
                    value={alt[lang]}
                    onChange={(e) => setAlt((a) => ({ ...a, [lang]: e.target.value }))}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  />
                </FormField>
              )}
            </LanguageTabs>
            <div className="admin-modal-actions">
              <button type="button" className="btn secondary" onClick={() => setEditing(null)}>
                {t('admin.cancel')}
              </button>
              <button type="submit" className="btn">
                {t('admin.save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
