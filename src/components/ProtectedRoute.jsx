import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isConfigured) {
    return <Navigate to="/admin/login" replace state={{ error: 'no_supabase' }} />;
  }

  if (auth.loading) {
    return (
      <div className="wrap section" style={{ textAlign: 'center' }}>
        <p>Laddar…</p>
      </div>
    );
  }

  if (!auth.user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!auth.isAdmin) {
    return (
      <div className="wrap section">
        <h1>Åtkomst nekad</h1>
        <p>Ditt konto har inte administratörsbehörighet.</p>
      </div>
    );
  }

  return children;
}
