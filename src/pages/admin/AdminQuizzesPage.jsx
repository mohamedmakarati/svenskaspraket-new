import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { adminList, adminCreate, adminUpdate, adminDelete } from '@/lib/adminApi';
import { quizFormSchema } from '@/schemas/admin';
import { toAdminError } from '@/lib/adminErrors';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/context/ToastContext';
import {
  PageHeader,
  AdminTable,
  Pagination,
  StatusBadge,
  FormField,
  LanguageTabs,
  FiltersBar,
  useConfirm,
} from '@/components/admin/AdminUi';
import EntityPicker from '@/components/admin/EntityPicker';

const empty = {
  question_sv: '',
  question_en: '',
  question_ar: '',
  lesson_id: null,
  vocabulary_id: null,
  verb_id: null,
  answer_data: { type: 'multiple_choice', choices: ['', '', ''], correct: '' },
  explanation_sv: '',
  explanation_en: '',
  explanation_ar: '',
  difficulty: 'medium',
  status: 'draft',
};

export default function AdminQuizzesPage() {
  const { t } = useTranslation();
  const { canEdit, canDelete } = usePermissions();
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [langTab, setLangTab] = useState('sv');
  const [editing, setEditing] = useState(null);
  const [choicesText, setChoicesText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'quizzes', page, search, statusFilter],
    queryFn: () =>
      adminList('quiz_questions', {
        page,
        search,
        filters: statusFilter ? { status: statusFilter } : {},
      }),
  });

  const form = useForm({ resolver: zodResolver(quizFormSchema), defaultValues: empty });
  const { register, handleSubmit, reset, setValue, watch } = form;

  const saveMut = useMutation({
    mutationFn: (payload) =>
      editing?.id ? adminUpdate('quiz_questions', editing.id, payload) : adminCreate('quiz_questions', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
      toast(t('admin.saved'), 'success');
      setEditing(null);
      reset(empty);
      setChoicesText('');
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminDelete('quiz_questions', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'quizzes'] }),
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  function onSubmit(data) {
    const choices = choicesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (choices.length < 2) {
      toast(t('admin.choicesMin'), 'error');
      return;
    }
    saveMut.mutate({
      ...data,
      answer_data: {
        type: 'multiple_choice',
        choices,
        correct: data.answer_data?.correct || choices[0],
      },
    });
  }

  function loadRow(row) {
    setEditing(row);
    reset({
      ...empty,
      ...row,
      lesson_id: row.lesson_id ?? null,
      vocabulary_id: row.vocabulary_id ?? null,
      verb_id: row.verb_id ?? null,
      difficulty: row.difficulty ?? 'medium',
    });
    setChoicesText((row.answer_data?.choices ?? []).join('\n'));
  }

  const parentLabel = (row) => {
    if (row.lesson_id) return `${t('admin.lessons')} · ${row.lesson_id.slice(0, 8)}…`;
    if (row.vocabulary_id) return `${t('admin.vocabulary')} · ${row.vocabulary_id.slice(0, 8)}…`;
    if (row.verb_id) return `${t('admin.verbs')} · ${row.verb_id.slice(0, 8)}…`;
    return '—';
  };

  return (
    <>
      {dialog}
      <PageHeader title={t('admin.quizzes')} />
      <FiltersBar search={search} onSearch={setSearch} searchPlaceholder={t('admin.search')}>
        <select className="admin-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label={t('admin.status')}>
          <option value="">{t('admin.allStatuses')}</option>
          <option value="draft">{t('admin.draft')}</option>
          <option value="published">{t('admin.publish')}</option>
          <option value="archived">{t('admin.archived')}</option>
        </select>
      </FiltersBar>
      {isLoading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <>
          <AdminTable
            columns={[
              { key: 'question_sv', label: t('admin.question') },
              { key: 'parent', label: t('admin.linkedTo'), render: parentLabel },
              { key: 'difficulty', label: t('admin.difficulty') },
              { key: 'status', label: t('admin.status'), render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={data?.data ?? []}
            actions={(row) => (
              <>
                {canEdit && (
                  <button type="button" className="btn secondary" onClick={() => loadRow(row)}>
                    {t('admin.edit')}
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    className="btn danger"
                    onClick={async () => {
                      if (await confirm({ message: row.question_sv })) deleteMut.mutate(row.id);
                    }}
                  >
                    {t('admin.delete')}
                  </button>
                )}
              </>
            )}
          />
          <Pagination page={page} count={data?.count ?? 0} pageSize={20} onPageChange={setPage} />
        </>
      )}
      {canEdit && (
        <form onSubmit={handleSubmit(onSubmit)} className="admin-card" style={{ marginTop: 24 }}>
          <h2>{editing ? t('admin.edit') : t('admin.newQuiz')}</h2>
          <LanguageTabs active={langTab} onChange={setLangTab}>
            {(lang) => (
              <>
                <FormField label={`${t('admin.question')} (${lang})`} required={lang === 'sv'}>
                  <input
                    className="admin-input"
                    {...register(lang === 'sv' ? 'question_sv' : lang === 'en' ? 'question_en' : 'question_ar')}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  />
                </FormField>
                <FormField label={`${t('admin.explanation')} (${lang})`}>
                  <textarea
                    className="admin-input"
                    rows={2}
                    {...register(lang === 'sv' ? 'explanation_sv' : lang === 'en' ? 'explanation_en' : 'explanation_ar')}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  />
                </FormField>
              </>
            )}
          </LanguageTabs>
          <FormField label={t('admin.choices')}>
            <textarea className="admin-input" rows={4} value={choicesText} onChange={(e) => setChoicesText(e.target.value)} />
          </FormField>
          <FormField label={t('admin.correctAnswer')}>
            <input className="admin-input" {...register('answer_data.correct')} />
          </FormField>
          <EntityPicker
            table="lessons"
            label={t('admin.linkLesson')}
            value={watch('lesson_id')}
            onChange={(v) => setValue('lesson_id', v, { shouldDirty: true })}
          />
          <EntityPicker
            table="vocabulary"
            label={t('admin.linkVocabulary')}
            value={watch('vocabulary_id')}
            onChange={(v) => setValue('vocabulary_id', v, { shouldDirty: true })}
          />
          <EntityPicker
            table="verbs"
            label={t('admin.linkVerb')}
            value={watch('verb_id')}
            onChange={(v) => setValue('verb_id', v, { shouldDirty: true })}
          />
          <FormField label={t('admin.difficulty')}>
            <select className="admin-input" {...register('difficulty')}>
              <option value="easy">{t('admin.easy')}</option>
              <option value="medium">{t('admin.medium')}</option>
              <option value="hard">{t('admin.hard')}</option>
            </select>
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
                  reset(empty);
                  setChoicesText('');
                }}
              >
                {t('admin.cancel')}
              </button>
            )}
          </div>
        </form>
      )}
    </>
  );
}
