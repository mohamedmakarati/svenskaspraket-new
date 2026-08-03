import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { quizQuestionSchema } from '@/schemas';
import { adminFetchAll, adminUpsert, adminDelete } from '@/lib/data';

const empty = { question_sv: '', correct_answer: '', choices: ['', '', ''], level: 'A1', status: 'draft', order_index: 0 };

export default function AdminQuizPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [choicesText, setChoicesText] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(quizQuestionSchema),
    defaultValues: empty,
  });

  async function load() {
    const { data } = await adminFetchAll('quiz_questions', { pageSize: 100 });
    setItems(data);
  }

  useEffect(() => { load().catch(console.error); }, []);

  async function onSubmit(data) {
    const choices = choicesText.split('\n').map((s) => s.trim()).filter(Boolean);
    await adminUpsert('quiz_questions', { ...data, choices, id: editing?.id });
    setEditing(null);
    reset(empty);
    setChoicesText('');
    load();
  }

  return (
    <>
      <h1>{t('admin.quiz')}</h1>
      <table className="verbs-table">
        <thead><tr><th>Fråga</th><th>Svar</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {items.map((q) => (
            <tr key={q.id}>
              <td>{q.question_sv}</td>
              <td>{q.correct_answer}</td>
              <td>{q.status}</td>
              <td>
                <button type="button" className="btn secondary" onClick={() => { setEditing(q); reset(q); setChoicesText((q.choices || []).join('\n')); }}>Redigera</button>
                <button type="button" className="btn danger" onClick={async () => { if (window.confirm(t('admin.confirmDelete'))) { await adminDelete('quiz_questions', q.id); load(); } }}>{t('admin.delete')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ marginTop: 24 }}>
        <h2>{editing ? 'Redigera fråga' : 'Ny fråga'}</h2>
        <label>question_sv<textarea {...register('question_sv')} rows={3} style={{ display: 'block', width: '100%' }} /></label>
        <label>correct_answer<input {...register('correct_answer')} style={{ display: 'block', width: '100%', padding: 10 }} /></label>
        <label>Svarsalternativ (en per rad)<textarea value={choicesText} onChange={(e) => setChoicesText(e.target.value)} rows={4} style={{ display: 'block', width: '100%' }} /></label>
        <select {...register('status')}><option value="draft">{t('admin.draft')}</option><option value="published">{t('admin.publish')}</option></select>
        {errors.question_sv && <span style={{ color: 'var(--bad)' }}>{errors.question_sv.message}</span>}
        <button type="submit" className="btn" style={{ marginTop: 12 }}>{t('admin.save')}</button>
      </form>
    </>
  );
}
