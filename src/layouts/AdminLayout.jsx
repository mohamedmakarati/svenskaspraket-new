import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAdminLang, default as AdminRtl } from '@/hooks/useAdminLang';
import { usePermissions } from '@/hooks/usePermissions';
import { PageSeo } from '@/components/SeoHead';

const NAV = [
  { key: 'dashboard', path: '/admin' },
  { key: 'verbs', path: '/admin/verbs' },
  { key: 'vocabulary', path: '/admin/vocabulary' },
  { key: 'lessons', path: '/admin/lessons' },
  { key: 'quizzes', path: '/admin/quizzes' },
  { key: 'media', path: '/admin/media' },
  { key: 'settings', path: '/admin/settings', adminOnly: true },
  { key: 'users', path: '/admin/users', adminOnly: true },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const { signOut, sessionExpired } = useAuth();
  const { canManageSettings, canManageUsers } = usePermissions();
  const { setAdminLang, adminLang } = useAdminLang();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  const visibleNav = NAV.filter((item) => {
    if (item.adminOnly && item.key === 'settings') return canManageSettings;
    if (item.adminOnly && item.key === 'users') return canManageUsers;
    return true;
  });

  return (
    <AdminRtl>
      <PageSeo pageKey="admin" />
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 900 }}>
            🇸🇪 {t('admin.panel')}
          </Link>
          {sessionExpired && (
            <p className="notice" style={{ marginTop: 12, fontSize: 13 }}>
              {t('admin.sessionExpired')}
            </p>
          )}
          <nav style={{ marginTop: 24 }} aria-label={t('admin.panel')}>
            {visibleNav.map(({ key, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/admin'}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {t(`admin.${key}`)}
              </NavLink>
            ))}
          </nav>
          <div className="admin-nav-lang" role="group" aria-label={t('admin.uiLanguage')}>
            {['sv', 'en', 'ar'].map((l) => (
              <button
                key={l}
                type="button"
                className={adminLang === l ? 'active' : ''}
                onClick={() => setAdminLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button type="button" className="btn" style={{ marginTop: 24, width: '100%' }} onClick={handleLogout}>
            {t('nav.logout')}
          </button>
        </aside>
        <main className="admin-main" id="admin-main">
          <Outlet />
        </main>
      </div>
    </AdminRtl>
  );
}
