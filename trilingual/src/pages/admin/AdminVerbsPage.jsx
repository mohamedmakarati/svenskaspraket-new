import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { verbSchema } from '@/schemas';
import { adminFetchAll, adminUpsert, adminDelete } from '@/lib/data';
import { downloadBlob, toCsv } from '@/lib/utils';

const emptyVerb = {
  level: 'A1',
  verb_group: '',
  imperative: '',
  infinitive: '',
  present: '',
  preterite: '',
  supine: '',
  content_en: '',
  content_ar: '',
  image_path: '',
  status: 'draft',
};

export default function AdminVerbsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(verbSchema),
    defaultValues: emptyVerb,
  });

  async function load() {
    const { data, count: total } = await adminFetchAll('verbs', {
      page,
      search,
      filters: levelFilter ? { level: levelFilter } : {},
    });
    setItems(data);
    setCount(total);
  }

  useEffect(() => {
    load().catch((e) => setMessage(e.message));
  }, [page, search, levelFilter]);

  async function onSubmit(data) {
    try {
      await adminUpsert('verbs', { ...data, id: editing?.id });
      setMessage('Sparat!');
      setEditing(null);
      reset(emptyVerb);
      load();
    } catch (e) {
      setMessage(e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    await adminDelete('verbs', id);
    load();
  }

  function exportJson() {
    downloadBlob(JSON.stringify(items, null, 2), 'verbs.json', 'application/json');
  }

  function exportCsv() {
    const cols = ['infinitive', 'level', 'present', 'preterite', 'content_en', 'content_ar', 'status'];
    downloadBlob(toCsv(items, cols), 'verbs.csv', 'text/csv');
  }

  return (
    <>
      <h1>{t('admin.verbs')}</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' }}>
        <input
          type="search"
          placeholder={t('admin.search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
          <option value="">Alla nivåer</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1-B2">B1-B2</option>
        </select>
        <button type="button" className="btn secondary" onClick={exportJson}>{t('admin.exportJson')}</button>
        <button type="button" className="btn secondary" onClick={exportCsv}>{t('admin.exportCsv')}</button>
        <button type="button" className="btn" onClick={() => { setEditing(null); reset(emptyVerb); }}>
          + Nytt verb
        </button>
      </div>

      {message && <p>{message}</p>}

      <div className="verbs-table-wrap">
        <table className="verbs-table">
          <thead>
            <tr>
              <th>Infinitiv</th>
              <th>Nivå</th>
              <th>Status</th>
              <th>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id}>
                <td>{v.infinitive}</td>
                <td>{v.level}</td>
                <td>{v.status}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn secondary" onClick={() => { setEditing(v); reset(v); setPreview(v); }}>
                    {t('admin.preview')}
                  </button>
                  <button type="button" className="btn secondary" onClick={() => { setEditing(v); reset(v); }}>
                    Redigera
                  </button>
                  <button type="button" className="btn danger" onClick={() => handleDelete(v.id)}>
                    {t('admin.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>←</button>
        <span>Sida {page} ({count} totalt)</span>
        <button type="button" disabled={page * 20 >= count} onClick={() => setPage((p) => p + 1)}>→</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ marginTop: 32 }}>
        <h2>{editing ? 'Redigera verb' : 'Nytt verb'}</h2>
        <div className="grid-2">
          {['level', 'infinitive', 'imperative', 'present', 'preterite', 'supine', 'verb_group', 'content_en', 'content_ar', 'image_path', 'status'].map((field) => (
            <label key={field} style={{ display: 'block' }}>
              {field}
              {field === 'status' ? (
                <select {...register('status')} style={{ display: 'block', width: '100%', padding: 10 }}>
                  <option value="draft">{t('admin.draft')}</option>
                  <option value="published">{t('admin.publish')}</option>
                </select>
              ) : field === 'level' ? (
                <select {...register('level')} style={{ display: 'block', width: '100%', padding: 10 }}>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1-B2">B1-B2</option>
                </select>
              ) : (
                <input {...register(field)} style={{ display: 'block', width: '100%', padding: 10 }} />
              )}
              {errors[field] && <span style={{ color: 'var(--bad)' }}>{errors[field].message}</span>}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="submit" className="btn">{t('admin.save')}</button>
          <button type="button" className="btn secondary" onClick={() => reset(emptyVerb)}>{t('admin.cancel')}</button>
        </div>
      </form>

      {preview && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3>{t('admin.preview')}</h3>
          <p><strong>{preview.infinitive}</strong> — {preview.content_en} / {preview.content_ar}</p>
        </div>
      )}
    </>
  );
}
