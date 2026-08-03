import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { safeAdminRedirect } from '@/lib/redirect';
import { PageSeo } from '@/components/SeoHead';

export default function AdminAuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { canAccessAdmin, loading, user } = useAuth();
  const [error, setError] = useState('');

  const next = safeAdminRedirect(searchParams.get('next'));

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setError(t('admin.noSupabase'));
      return;
    }

    let cancelled = false;

    async function finishAuth() {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const code = searchParams.get('code');
      const oauthError = searchParams.get('error_description') || hashParams.get('error_description');

      if (oauthError) {
        if (!cancelled) setError(oauthError);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError && !cancelled) {
          setError(exchangeError.message);
          return;
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError && !cancelled) {
        setError(sessionError.message);
      } else if (!data.session && !cancelled) {
        setError(t('admin.googleSignInFailed'));
      }
    }

    finishAuth();

    return () => {
      cancelled = true;
    };
  }, [searchParams, t]);

  useEffect(() => {
    if (loading || error) return;
    if (!user) return;

    if (canAccessAdmin) {
      navigate(next, { replace: true });
      return;
    }

    navigate('/admin/login', {
      replace: true,
      state: { googlePending: true, email: user.email },
    });
  }, [loading, user, canAccessAdmin, error, navigate, next]);

  return (
    <>
      <PageSeo pageKey="adminAuthCallback" />
      <main className="admin-login-page">
        <h1>{t('admin.authCallbackTitle')}</h1>
        {error ? (
          <>
            <p className="admin-field__error">{error}</p>
            <button type="button" className="btn secondary" onClick={() => navigate('/admin/login', { replace: true })}>
              {t('admin.backToLogin')}
            </button>
          </>
        ) : (
          <p>{t('admin.authCallbackLoading')}</p>
        )}
      </main>
    </>
  );
}
