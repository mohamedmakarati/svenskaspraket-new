import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const auth = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (!auth.isConfigured) {
    return <Navigate to="/admin/login" replace state={{ error: 'no_supabase' }} />;
  }

  if (auth.loading) {
    return (
      <div className="wrap section" style={{ textAlign: 'center' }}>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (auth.sessionExpired) {
    return <Navigate to="/admin/login" replace state={{ expired: true }} />;
  }

  if (!auth.user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!auth.canAccessAdmin) {
    return (
      <div className="admin-access-denied wrap section">
        <h1>{t('admin.accessDenied')}</h1>
        <p>{t('admin.accessDeniedHint')}</p>
      </div>
    );
  }

  if (requireAdmin && !auth.isAdmin) {
    return (
      <div className="admin-access-denied wrap section">
        <h1>{t('admin.accessDenied')}</h1>
        <p>{t('admin.adminOnly')}</p>
      </div>
    );
  }

  return children;
}
