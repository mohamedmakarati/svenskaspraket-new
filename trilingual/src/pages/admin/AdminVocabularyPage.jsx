import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { vocabularySchema } from '@/schemas';
import { adminFetchAll, adminUpsert, adminDelete } from '@/lib/data';
import { downloadBlob, toCsv } from '@/lib/utils';

const empty = { content_sv: '', content_en: '', content_ar: '', level: 'B1-B2', status: 'draft' };

export default function AdminVocabularyPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(vocabularySchema),
    defaultValues: empty,
  });

  async function load() {
    const { data, count: total } = await adminFetchAll('vocabulary', { page, search });
    setItems(data);
    setCount(total);
  }

  useEffect(() => { load().catch(console.error); }, [page, search]);

  async function onSubmit(data) {
    await adminUpsert('vocabulary', { ...data, id: editing?.id });
    setEditing(null);
    reset(empty);
    load();
  }

  return (
    <>
      <h1>{t('admin.vocabulary')}</h1>
      <input type="search" placeholder={t('admin.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      <button type="button" className="btn secondary" onClick={() => downloadBlob(JSON.stringify(items, null, 2), 'vocabulary.json', 'application/json')}>{t('admin.exportJson')}</button>
      <button type="button" className="btn secondary" onClick={() => downloadBlob(toCsv(items, ['content_sv', 'content_en', 'content_ar', 'level', 'status']), 'vocabulary.csv', 'text/csv')}>{t('admin.exportCsv')}</button>

      <table className="verbs-table" style={{ marginTop: 16 }}>
        <thead><tr><th>Svenska</th><th>EN</th><th>AR</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {items.map((v) => (
            <tr key={v.id}>
              <td>{v.content_sv}</td>
              <td>{v.content_en}</td>
              <td className="arabic" dir="rtl">{v.content_ar}</td>
              <td>{v.status}</td>
              <td>
                <button type="button" className="btn secondary" onClick={() => { setEditing(v); reset(v); }}>Redigera</button>
                <button type="button" className="btn danger" onClick={async () => { if (window.confirm(t('admin.confirmDelete'))) { await adminDelete('vocabulary', v.id); load(); } }}>{t('admin.delete')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ marginTop: 24 }}>
        <h2>{editing ? 'Redigera' : 'Nytt ord'}</h2>
        {['content_sv', 'content_en', 'content_ar', 'level'].map((f) => (
          <label key={f} style={{ display: 'block', marginBottom: 12 }}>{f}<input {...register(f)} style={{ display: 'block', width: '100%', padding: 10 }} />{errors[f] && <span style={{ color: 'var(--bad)' }}>{errors[f].message}</span>}</label>
        ))}
        <select {...register('status')}><option value="draft">{t('admin.draft')}</option><option value="published">{t('admin.publish')}</option></select>
        <button type="submit" className="btn" style={{ marginTop: 12 }}>{t('admin.save')}</button>
      </form>
    </>
  );
}
