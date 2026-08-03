import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { vocabularyFormSchema } from '@/schemas/admin';
import { adminGetById, adminCreate, adminUpdate, adminUploadMedia } from '@/lib/adminApi';
import { slugify } from '@/lib/slug';
import { toAdminError } from '@/lib/adminErrors';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/context/ToastContext';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { PageHeader, FormField, LanguageTabs, ImagePicker } from '@/components/admin/AdminUi';

const empty = {
  slug: '', word_sv: '', meaning_en: '', meaning_ar: '', example_sv: '', example_en: '', example_ar: '',
  word_class: '', cefr_level: 'B1', category: '', image_path: '', status: 'draft',
};

export default function AdminVocabularyFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEdit } = usePermissions();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [langTab, setLangTab] = useState('sv');

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin', 'vocabulary', id],
    queryFn: () => adminGetById('vocabulary', id),
    enabled: !isNew,
  });

  const form = useForm({ resolver: zodResolver(vocabularyFormSchema), defaultValues: empty });
  const { register, handleSubmit, reset, watch, setValue, formState: { isDirty } } = form;
  useUnsavedChanges(isDirty);

  useEffect(() => { if (existing) reset(existing); }, [existing, reset]);

  const saveMut = useMutation({
    mutationFn: (payload) => (isNew ? adminCreate('vocabulary', payload) : adminUpdate('vocabulary', id, payload)),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ['admin', 'vocabulary'] });
      toast(t('admin.saved'), 'success');
      if (isNew) navigate(`/admin/vocabulary/${row.id}/edit`, { replace: true });
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  return (
    <>
      <PageHeader title={isNew ? t('admin.newWord') : t('admin.editWord')} actions={<Link to="/admin/vocabulary" className="btn secondary">{t('admin.back')}</Link>} />
      {!isNew && isLoading ? <p>{t('common.loading')}</p> : (
        <form onSubmit={handleSubmit((d) => saveMut.mutate(d))} className="admin-card">
          <FormField label="Slug" required><input className="admin-input" {...register('slug')} disabled={!canEdit} /></FormField>
          <FormField label="Swedish word" required>
            <input className="admin-input" {...register('word_sv')} disabled={!canEdit} onBlur={(e) => { if (!watch('slug')) setValue('slug', slugify(e.target.value)); }} />
          </FormField>
          <LanguageTabs active={langTab} onChange={setLangTab}>
            {(lang) => (
              <>
                {lang !== 'sv' && (
                  <FormField label={lang === 'en' ? 'English' : 'Arabic'}>
                    <input className="admin-input" {...register(lang === 'en' ? 'meaning_en' : 'meaning_ar')} dir={lang === 'ar' ? 'rtl' : 'ltr'} disabled={!canEdit} />
                  </FormField>
                )}
                <FormField label={`Example (${lang})`}>
                  <textarea className="admin-input" rows={2} {...register(lang === 'sv' ? 'example_sv' : lang === 'en' ? 'example_en' : 'example_ar')} dir={lang === 'ar' ? 'rtl' : 'ltr'} disabled={!canEdit} />
                </FormField>
              </>
            )}
          </LanguageTabs>
          <FormField label="Word class"><input className="admin-input" {...register('word_class')} disabled={!canEdit} /></FormField>
          <FormField label="Category"><input className="admin-input" {...register('category')} disabled={!canEdit} /></FormField>
          <FormField label="CEFR">
            <select className="admin-input" {...register('cefr_level')} disabled={!canEdit}>
              {['A1', 'A2', 'B1', 'B2'].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </FormField>
          <FormField label={t('admin.image')}>
            <ImagePicker value={watch('image_path')} onChange={(v) => setValue('image_path', v, { shouldDirty: true })} disabled={!canEdit}
              onUpload={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const m = await adminUploadMedia(f);
                  setValue('image_path', m.public_url, { shouldDirty: true });
                } catch (err) { toast(toAdminError(err), 'error'); }
              }} />
          </FormField>
          <FormField label={t('admin.status')}>
            <select className="admin-input" {...register('status')} disabled={!canEdit}>
              <option value="draft">{t('admin.draft')}</option>
              <option value="published">{t('admin.publish')}</option>
              <option value="archived">archived</option>
            </select>
          </FormField>
          {canEdit && <div className="admin-form-actions"><button type="submit" className="btn">{t('admin.save')}</button></div>}
        </form>
      )}
    </>
  );
}
