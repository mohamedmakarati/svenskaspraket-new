import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { verbFormSchema } from '@/schemas/admin';
import { adminGetById, adminCreate, adminUpdate, adminUploadMedia } from '@/lib/adminApi';
import { slugify } from '@/lib/slug';
import { toAdminError } from '@/lib/adminErrors';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/context/ToastContext';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import {
  PageHeader,
  FormField,
  LanguageTabs,
  SeoFields,
  ImagePicker,
} from '@/components/admin/AdminUi';
import { sanitizeHtml } from '@/lib/utils';

const empty = {
  slug: '',
  infinitive: '',
  imperative: '',
  present: '',
  preterite: '',
  supine: '',
  verb_group: '',
  cefr_level: 'A1',
  meaning_en: '',
  meaning_ar: '',
  example_sv: '',
  example_en: '',
  example_ar: '',
  image_path: '',
  status: 'draft',
  seo_title_sv: '',
  seo_title_en: '',
  seo_title_ar: '',
  seo_description_sv: '',
  seo_description_en: '',
  seo_description_ar: '',
};

export default function AdminVerbFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEdit } = usePermissions();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [langTab, setLangTab] = useState('sv');
  const [preview, setPreview] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin', 'verb', id],
    queryFn: () => adminGetById('verbs', id),
    enabled: !isNew,
  });

  const form = useForm({ resolver: zodResolver(verbFormSchema), defaultValues: empty });
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = form;
  useUnsavedChanges(isDirty);

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const saveMut = useMutation({
    mutationFn: (payload) => (isNew ? adminCreate('verbs', payload) : adminUpdate('verbs', id, payload)),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ['admin', 'verbs'] });
      toast(t('admin.saved'), 'success');
      if (isNew) navigate(`/admin/verbs/${row.id}/edit`, { replace: true });
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !canEdit) return;
    try {
      const media = await adminUploadMedia(file);
      setValue('image_path', media.public_url, { shouldDirty: true });
      toast(t('admin.uploaded'), 'success');
    } catch (err) {
      toast(toAdminError(err), 'error');
    }
  }

  function onInfinitiveBlur(e) {
    const val = e.target.value;
    if (!watch('slug') && val) setValue('slug', slugify(val));
  }

  const onSubmit = (data) => saveMut.mutate(data);
  const values = watch();

  if (!isNew && isLoading) return <p>{t('common.loading')}</p>;

  return (
    <>
      <PageHeader
        title={isNew ? t('admin.newVerb') : t('admin.editVerb')}
        actions={<Link to="/admin/verbs" className="btn secondary">{t('admin.back')}</Link>}
      />
      <div className="admin-form-grid admin-form-grid--2">
        <form onSubmit={handleSubmit(onSubmit)} className="admin-card">
          <FormField label="Slug" error={errors.slug?.message} required>
            <input className="admin-input" {...register('slug')} disabled={!canEdit} />
          </FormField>
          <FormField label="Infinitive" error={errors.infinitive?.message} required>
            <input className="admin-input" {...register('infinitive')} onBlur={onInfinitiveBlur} disabled={!canEdit} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['imperative', 'present', 'preterite', 'supine', 'verb_group'].map((f) => (
              <FormField key={f} label={f}>
                <input className="admin-input" {...register(f)} disabled={!canEdit} />
              </FormField>
            ))}
          </div>
          <FormField label="CEFR">
            <select className="admin-input" {...register('cefr_level')} disabled={!canEdit}>
              {['A1', 'A2', 'B1', 'B2'].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </FormField>
          <LanguageTabs active={langTab} onChange={setLangTab}>
            {(lang) => (
              <>
                {lang !== 'sv' && (
                  <FormField label={lang === 'en' ? 'English meaning' : 'Arabic meaning'}>
                    <input
                      className="admin-input"
                      {...register(lang === 'en' ? 'meaning_en' : 'meaning_ar')}
                      dir={lang === 'ar' ? 'rtl' : 'ltr'}
                      disabled={!canEdit}
                    />
                  </FormField>
                )}
                <FormField label={`Example (${lang})`}>
                  <textarea
                    className="admin-input"
                    rows={2}
                    {...register(lang === 'sv' ? 'example_sv' : lang === 'en' ? 'example_en' : 'example_ar')}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    disabled={!canEdit}
                  />
                </FormField>
                <SeoFields register={register} lang={lang} />
              </>
            )}
          </LanguageTabs>
          <FormField label={t('admin.image')}>
            <ImagePicker value={watch('image_path')} onChange={(v) => setValue('image_path', v, { shouldDirty: true })} onUpload={onUpload} disabled={!canEdit} />
          </FormField>
          <FormField label={t('admin.status')}>
            <select className="admin-input" {...register('status')} disabled={!canEdit}>
              <option value="draft">{t('admin.draft')}</option>
              <option value="published">{t('admin.publish')}</option>
              <option value="archived">archived</option>
            </select>
          </FormField>
          <div className="admin-form-actions">
            {canEdit && (
              <>
                <button type="submit" className="btn" disabled={saveMut.isPending}>
                  {t('admin.save')}
                </button>
                <button type="button" className="btn secondary" onClick={() => setPreview((p) => !p)}>
                  {t('admin.preview')}
                </button>
              </>
            )}
          </div>
        </form>
        {preview && (
          <aside className="admin-card admin-preview-box">
            <h3>{t('admin.preview')}</h3>
            <p><strong>{sanitizeHtml(values.infinitive)}</strong></p>
            <p>{values.meaning_en}</p>
            <p dir="rtl">{values.meaning_ar}</p>
            {values.image_path && <img src={values.image_path} alt="" style={{ maxWidth: '100%' }} />}
          </aside>
        )}
      </div>
    </>
  );
}
