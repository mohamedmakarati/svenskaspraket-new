import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { lessonSchema } from '@/schemas';
import { adminFetchAll, adminUpsert, adminDelete } from '@/lib/data';

const empty = { slug: '', title_sv: '', title_en: '', title_ar: '', description_sv: '', level: 'A1', lesson_number: 1, body_sv: '', status: 'draft' };

export default function AdminLessonsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: empty,
  });

  async function load() {
    const { data } = await adminFetchAll('lessons', { pageSize: 100 });
    setItems(data);
  }

  useEffect(() => { load().catch(console.error); }, []);

  async function onSubmit(data) {
    await adminUpsert('lessons', { ...data, id: editing?.id });
    setEditing(null);
    reset(empty);
    load();
  }

  const watched = watch();

  return (
    <>
      <h1>{t('admin.lessons')}</h1>
      <table className="verbs-table">
        <thead><tr><th>Titel</th><th>Nivå</th><th>Slug</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.id}>
              <td>{l.title_sv}</td>
              <td>{l.level}</td>
              <td>{l.slug}</td>
              <td>{l.status}</td>
              <td>
                <button type="button" className="btn secondary" onClick={() => { setEditing(l); reset(l); setPreview(l); }}>{t('admin.preview')}</button>
                <button type="button" className="btn secondary" onClick={() => { setEditing(l); reset(l); }}>Redigera</button>
                <button type="button" className="btn danger" onClick={async () => { if (window.confirm(t('admin.confirmDelete'))) { await adminDelete('lessons', l.id); load(); } }}>{t('admin.delete')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ marginTop: 24 }}>
        <h2>{editing ? 'Redigera lektion' : 'Ny lektion'}</h2>
        {['slug', 'title_sv', 'title_en', 'title_ar', 'description_sv', 'level', 'lesson_number', 'body_sv'].map((f) => (
          <label key={f} style={{ display: 'block', marginBottom: 12 }}>
            {f}
            {f === 'body_sv' ? (
              <textarea {...register(f)} rows={6} style={{ display: 'block', width: '100%', padding: 10 }} />
            ) : (
              <input {...register(f)} style={{ display: 'block', width: '100%', padding: 10 }} />
            )}
            {errors[f] && <span style={{ color: 'var(--bad)' }}>{errors[f].message}</span>}
          </label>
        ))}
        <select {...register('status')}><option value="draft">{t('admin.draft')}</option><option value="published">{t('admin.publish')}</option></select>
        <button type="submit" className="btn" style={{ marginTop: 12 }}>{t('admin.save')}</button>
      </form>

      {preview && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3>{t('admin.preview')}: {watched.title_sv || preview.title_sv}</h3>
          <p>{watched.description_sv || preview.description_sv}</p>
        </div>
      )}
    </>
  );
}
