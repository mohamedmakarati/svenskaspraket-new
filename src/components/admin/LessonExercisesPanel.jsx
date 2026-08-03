import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { adminListExercises, adminUpsertExercise, adminDeleteExercise } from '@/lib/adminApi';
import { exerciseFormSchema } from '@/schemas/admin';
import { toAdminError } from '@/lib/adminErrors';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/context/ToastContext';
import { FormField, LanguageTabs, StatusBadge, useConfirm } from '@/components/admin/AdminUi';

const emptyExercise = {
  instruction_sv: '',
  instruction_en: '',
  instruction_ar: '',
  exercise_type: 'quiz',
  exercise_data: {},
  sort_order: 0,
  status: 'draft',
};

export default function LessonExercisesPanel({ lessonId }) {
  const { t } = useTranslation();
  const { canEdit, canDelete } = usePermissions();
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();
  const qc = useQueryClient();
  const [langTab, setLangTab] = useState('sv');
  const [editing, setEditing] = useState(null);
  const [dataJson, setDataJson] = useState('{}');

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['admin', 'exercises', lessonId],
    queryFn: () => adminListExercises(lessonId),
    enabled: Boolean(lessonId),
  });

  const form = useForm({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: { ...emptyExercise, lesson_id: lessonId },
  });
  const { register, handleSubmit, reset } = form;

  const saveMut = useMutation({
    mutationFn: (payload) => {
      let exercise_data = payload.exercise_data;
      if (typeof exercise_data === 'string') {
        exercise_data = JSON.parse(exercise_data);
      }
      return adminUpsertExercise({ ...payload, lesson_id: lessonId, exercise_data });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'exercises', lessonId] });
      toast(t('admin.saved'), 'success');
      setEditing(null);
      reset({ ...emptyExercise, lesson_id: lessonId });
      setDataJson('{}');
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: adminDeleteExercise,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'exercises', lessonId] }),
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  function onSubmit(data) {
    try {
      const parsed = JSON.parse(dataJson || '{}');
      saveMut.mutate({ ...data, exercise_data: parsed, id: editing?.id });
    } catch {
      toast(t('admin.invalidJson'), 'error');
    }
  }

  function startEdit(row) {
    setEditing(row);
    reset({ ...row, lesson_id: lessonId });
    setDataJson(JSON.stringify(row.exercise_data ?? {}, null, 2));
  }

  return (
    <section className="admin-card" style={{ marginTop: 24 }}>
      {dialog}
      <h3>{t('admin.exercises')}</h3>
      {isLoading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <ul className="admin-exercise-list">
          {(exercises ?? []).map((ex) => (
            <li key={ex.id}>
              <StatusBadge status={ex.status} /> {ex.exercise_type} · #{ex.sort_order}{' '}
              <em>{ex.instruction_sv || t('admin.noInstruction')}</em>
              {canEdit && (
                <button type="button" className="btn secondary" style={{ marginLeft: 8 }} onClick={() => startEdit(ex)}>
                  {t('admin.edit')}
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  className="btn danger"
                  style={{ marginLeft: 8 }}
                  onClick={async () => {
                    if (await confirm({ message: ex.instruction_sv || ex.exercise_type })) deleteMut.mutate(ex.id);
                  }}
                >
                  {t('admin.delete')}
                </button>
              )}
            </li>
          ))}
          {!exercises?.length && <li>{t('admin.none')}</li>}
        </ul>
      )}

      {canEdit && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 16 }}>
          <h4>{editing ? t('admin.editExercise') : t('admin.newExercise')}</h4>
          <LanguageTabs active={langTab} onChange={setLangTab}>
            {(lang) => (
              <FormField label={`${t('admin.instruction')} (${lang})`}>
                <textarea
                  className="admin-input"
                  rows={2}
                  {...register(lang === 'sv' ? 'instruction_sv' : lang === 'en' ? 'instruction_en' : 'instruction_ar')}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                />
              </FormField>
            )}
          </LanguageTabs>
          <FormField label={t('admin.exerciseType')}>
            <select className="admin-input" {...register('exercise_type')}>
              {['quiz', 'fill_blank', 'matching', 'free_text'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t('admin.exerciseData')}>
            <textarea className="admin-input" rows={4} value={dataJson} onChange={(e) => setDataJson(e.target.value)} />
          </FormField>
          <FormField label={t('admin.sortOrder')}>
            <input type="number" className="admin-input" {...register('sort_order')} />
          </FormField>
          <FormField label={t('admin.status')}>
            <select className="admin-input" {...register('status')}>
              <option value="draft">{t('admin.draft')}</option>
              <option value="published">{t('admin.publish')}</option>
              <option value="archived">{t('admin.archived')}</option>
            </select>
          </FormField>
          <div className="admin-form-actions">
            <button type="submit" className="btn">
              {t('admin.save')}
            </button>
            {editing && (
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setEditing(null);
                  reset({ ...emptyExercise, lesson_id: lessonId });
                  setDataJson('{}');
                }}
              >
                {t('admin.cancel')}
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
