import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import RtlLayout from '@/hooks/useRtl';

export default function AdminLayout({ lang }) {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/admin/login');
  }

  return (
    <RtlLayout lang={lang || i18n.language}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
        <aside
          style={{
            background: 'var(--navy)',
            color: '#fff',
            padding: '24px 16px',
          }}
        >
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 900 }}>
            🇸🇪 Admin
          </Link>
          <nav style={{ display: 'grid', gap: 4, marginTop: 24 }} aria-label="Admin navigation">
            {[
              ['dashboard', '/admin'],
              ['verbs', '/admin/verbs'],
              ['vocabulary', '/admin/vocabulary'],
              ['lessons', '/admin/lessons'],
              ['quiz', '/admin/quiz'],
              ['media', '/admin/media'],
            ].map(([key, path]) => (
              <Link
                key={path}
                to={path}
                style={{ color: '#d4dee8', textDecoration: 'none', padding: '10px 12px', borderRadius: 8 }}
              >
                {t(`admin.${key}`)}
              </Link>
            ))}
          </nav>
          <div style={{ marginTop: 24, display: 'flex', gap: 6 }}>
            {['sv', 'en', 'ar'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => i18n.changeLanguage(l)}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #ffffff33',
                  background: i18n.language === l ? 'var(--blue)' : 'transparent',
                  color: '#fff',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn"
            style={{ marginTop: 24, width: '100%' }}
            onClick={handleLogout}
          >
            {t('nav.logout')}
          </button>
        </aside>
        <main style={{ padding: '32px 40px', background: 'var(--paper)' }}>
          <Outlet />
        </main>
      </div>
    </RtlLayout>
  );
}
