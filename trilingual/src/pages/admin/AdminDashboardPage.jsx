import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminStats } from '@/lib/data';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: 'var(--bad)' }}>{error}</p>;
  if (!stats) return <p>{t('common.loading')}</p>;

  return (
    <>
      <h1>{t('admin.dashboard')}</h1>
      <div className="grid-3" style={{ marginTop: 24 }}>
        {Object.entries(stats).map(([table, s]) => (
          <article key={table} className="card">
            <h3 style={{ textTransform: 'capitalize' }}>{t(`admin.${table}`, table)}</h3>
            <p>
              {t('admin.total')}: <strong>{s.total}</strong>
            </p>
            <p>
              {t('admin.published')}: <strong style={{ color: 'var(--ok)' }}>{s.published}</strong>
            </p>
            <p>
              {t('admin.drafts')}: <strong>{s.draft}</strong>
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
