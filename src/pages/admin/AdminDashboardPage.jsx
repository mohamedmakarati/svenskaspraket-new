import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminDashboardStats, adminRecentContent, adminContentWarnings } from '@/lib/adminApi';
import { toAdminError } from '@/lib/adminErrors';
import { PageHeader, StatusBadge } from '@/components/admin/AdminUi';

const STAT_LINKS = {
  verbs: '/admin/verbs',
  vocabulary: '/admin/vocabulary',
  lessons: '/admin/lessons',
  quiz_questions: '/admin/quizzes',
};

const EDIT_PATHS = {
  verb: (id) => `/admin/verbs/${id}/edit`,
  vocabulary: (id) => `/admin/vocabulary/${id}/edit`,
  lesson: (id) => `/admin/lessons/${id}/edit`,
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();

  const statsQ = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: adminDashboardStats,
  });
  const recentQ = useQuery({
    queryKey: ['admin', 'dashboard', 'recent'],
    queryFn: () => adminRecentContent(10),
  });
  const warningsQ = useQuery({
    queryKey: ['admin', 'dashboard', 'warnings'],
    queryFn: adminContentWarnings,
  });

  if (statsQ.error) {
    return <p className="admin-field__error">{toAdminError(statsQ.error)}</p>;
  }

  const stats = statsQ.data ?? {};

  return (
    <>
      <PageHeader title={t('admin.dashboard')} />
      {statsQ.isLoading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <div className="admin-stats-grid">
          {Object.entries(stats).map(([key, s]) => (
            <Link key={key} to={STAT_LINKS[key] ?? '/admin'} className="admin-stat-card admin-stat-card--link">
              <span>{t(`admin.${key}`, key)}</span>
              <strong>{s.total}</strong>
              <small>
                {t('admin.published')}: {s.published} · {t('admin.drafts')}: {s.draft}
              </small>
            </Link>
          ))}
        </div>
      )}

      <section className="admin-card">
        <h2>{t('admin.recentChanges')}</h2>
        {recentQ.isLoading ? (
          <p>{t('common.loading')}</p>
        ) : (
          <ul className="admin-link-list">
            {(recentQ.data ?? []).map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <StatusBadge status={item.status} />{' '}
                <Link to={EDIT_PATHS[item.type]?.(item.id) ?? '/admin'}>{item.label}</Link>{' '}
                <small>{new Date(item.updated_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="admin-warnings">
        <section className="admin-card">
          <h2>{t('admin.missingTranslations')}</h2>
          <ul className="admin-link-list">
            {(warningsQ.data?.missingTranslations ?? []).map((w) => (
              <li key={`${w.type}-${w.id}`}>
                <Link to={EDIT_PATHS[w.type]?.(w.id) ?? '/admin'}>
                  {w.type}: {w.label}
                </Link>
              </li>
            ))}
            {!warningsQ.data?.missingTranslations?.length && <li>{t('admin.none')}</li>}
          </ul>
        </section>
        <section className="admin-card">
          <h2>{t('admin.missingImages')}</h2>
          <ul className="admin-link-list">
            {(warningsQ.data?.missingImages ?? []).map((w) => (
              <li key={`${w.type}-${w.id}`}>
                <Link to={EDIT_PATHS[w.type]?.(w.id) ?? '/admin'}>
                  {w.type}: {w.label}
                </Link>
              </li>
            ))}
            {!warningsQ.data?.missingImages?.length && <li>{t('admin.none')}</li>}
          </ul>
        </section>
      </div>

      <p style={{ marginTop: 24 }}>
        <Link to="/" className="btn secondary">
          {t('admin.viewSite')}
        </Link>
      </p>
    </>
  );
}
