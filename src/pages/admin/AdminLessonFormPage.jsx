import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { lessonFormSchema } from '@/schemas/admin';
import {
  adminGetById, adminCreate, adminUpdate, adminListQuizByLesson, adminUploadMedia,
} from '@/lib/adminApi';
import { slugify } from '@/lib/slug';
import { toAdminError } from '@/lib/adminErrors';
import { sanitizeHtml } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/context/ToastContext';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { PageHeader, FormField, LanguageTabs, SeoFields, ImagePicker } from '@/components/admin/AdminUi';
import LessonExercisesPanel from '@/components/admin/LessonExercisesPanel';

const empty = {
  slug: '', title_sv: '', title_en: '', title_ar: '', summary_sv: '', summary_en: '', summary_ar: '',
  content_sv: '', content_en: '', content_ar: '', cefr_level: 'A1', category: '', featured_image_path: '',
  sort_order: 0, status: 'draft',
  seo_title_sv: '', seo_title_en: '', seo_title_ar: '', seo_description_sv: '', seo_description_en: '', seo_description_ar: '',
};

export default function AdminLessonFormPage() {
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
    queryKey: ['admin', 'lesson', id],
    queryFn: () => adminGetById('lessons', id),
    enabled: !isNew,
  });

  const { data: quizzes } = useQuery({
    queryKey: ['admin', 'lesson-quizzes', id],
    queryFn: () => adminListQuizByLesson(id),
    enabled: !isNew,
  });

  const form = useForm({ resolver: zodResolver(lessonFormSchema), defaultValues: empty });
  const { register, handleSubmit, reset, watch, setValue, formState: { isDirty } } = form;
  useUnsavedChanges(isDirty);
  const values = watch();

  useEffect(() => { if (existing) reset(existing); }, [existing, reset]);

  const saveMut = useMutation({
    mutationFn: (payload) => (isNew ? adminCreate('lessons', payload) : adminUpdate('lessons', id, payload)),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ['admin', 'lessons'] });
      toast(t('admin.saved'), 'success');
      if (isNew) navigate(`/admin/lessons/${row.id}/edit`, { replace: true });
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  return (
    <>
      <PageHeader title={isNew ? t('admin.newLesson') : t('admin.editLesson')} actions={<Link to="/admin/lessons" className="btn secondary">{t('admin.back')}</Link>} />
      {!isNew && isLoading ? <p>{t('common.loading')}</p> : (
        <div className="admin-form-grid admin-form-grid--2">
          <form onSubmit={handleSubmit((d) => saveMut.mutate(d))} className="admin-card">
            <FormField label={t('admin.slug')} required>
              <input className="admin-input" {...register('slug')} disabled={!canEdit} onBlur={(e) => { if (!e.target.value && values.title_sv) setValue('slug', slugify(values.title_sv)); }} />
            </FormField>
            <LanguageTabs active={langTab} onChange={setLangTab}>
              {(lang) => (
                <>
                  <FormField label={`${t('admin.title')} (${lang})`} required={lang === 'sv'}>
                    <input className="admin-input" {...register(lang === 'sv' ? 'title_sv' : lang === 'en' ? 'title_en' : 'title_ar')} dir={lang === 'ar' ? 'rtl' : 'ltr'} disabled={!canEdit} />
                  </FormField>
                  <FormField label={`${t('admin.summary')} (${lang})`}>
                    <textarea className="admin-input" rows={2} {...register(lang === 'sv' ? 'summary_sv' : lang === 'en' ? 'summary_en' : 'summary_ar')} dir={lang === 'ar' ? 'rtl' : 'ltr'} disabled={!canEdit} />
                  </FormField>
                  <FormField label={`${t('admin.content')} (${lang})`}>
                    <textarea className="admin-input" rows={8} {...register(lang === 'sv' ? 'content_sv' : lang === 'en' ? 'content_en' : 'content_ar')} dir={lang === 'ar' ? 'rtl' : 'ltr'} disabled={!canEdit} />
                  </FormField>
                  <SeoFields register={register} lang={lang} />
                </>
              )}
            </LanguageTabs>
            <FormField label={t('admin.cefr')}>
              <select className="admin-input" {...register('cefr_level')} disabled={!canEdit}>
                {['A1', 'A2', 'B1', 'B2'].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </FormField>
            <FormField label={t('admin.category')}><input className="admin-input" {...register('category')} disabled={!canEdit} /></FormField>
            <FormField label={t('admin.sortOrder')}><input type="number" className="admin-input" {...register('sort_order')} disabled={!canEdit} /></FormField>
            <FormField label={t('admin.image')}>
              <ImagePicker value={watch('featured_image_path')} onChange={(v) => setValue('featured_image_path', v, { shouldDirty: true })} disabled={!canEdit}
                onUpload={async (e) => { const f = e.target.files?.[0]; if (f) { try { const m = await adminUploadMedia(f); setValue('featured_image_path', m.public_url, { shouldDirty: true }); } catch (err) { toast(toAdminError(err), 'error'); } } }} />
            </FormField>
            <FormField label={t('admin.status')}>
              <select className="admin-input" {...register('status')} disabled={!canEdit}>
                <option value="draft">{t('admin.draft')}</option>
                <option value="published">{t('admin.publish')}</option>
                <option value="archived">{t('admin.archived')}</option>
              </select>
            </FormField>
            {!isNew && quizzes?.length > 0 && (
              <section>
                <h3>{t('admin.quizzes')} ({quizzes.length})</h3>
                <ul>{quizzes.map((q) => <li key={q.id}>{q.question_sv}</li>)}</ul>
                <Link to="/admin/quizzes">{t('admin.manageQuizzes')}</Link>
              </section>
            )}
            {canEdit && (
              <div className="admin-form-actions">
                <button type="submit" className="btn">{t('admin.save')}</button>
                <button type="button" className="btn secondary" onClick={() => setPreview((p) => !p)}>{t('admin.preview')}</button>
              </div>
            )}
          </form>
          {!isNew && <LessonExercisesPanel lessonId={id} />}
          {preview && (
            <aside className="admin-card admin-preview-box">
              <h3>{t('admin.preview')}</h3>
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(values.content_sv) }} />
            </aside>
          )}
        </div>
      )}
    </>
  );
}
