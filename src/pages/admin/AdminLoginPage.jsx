import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { loginSchema } from '@/schemas/admin';
import { useAuth } from '@/hooks/useAuth';
import { safeAdminRedirect } from '@/lib/redirect';
import { PageSeo } from '@/components/SeoHead';

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const { signIn, isConfigured, canAccessAdmin, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const from = safeAdminRedirect(location.state?.from);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (!loading && user && canAccessAdmin) {
      navigate(from, { replace: true });
    }
  }, [loading, user, canAccessAdmin, from, navigate]);

  async function onSubmit(data) {
    setError('');
    try {
      await signIn(data.email, data.password);
      navigate(from, { replace: true });
    } catch (e) {
      setError(e.message || t('common.error'));
    }
  }

  return (
    <>
      <PageSeo pageKey="adminLogin" />
      <main className="admin-login-page">
        <h1>{t('admin.login')}</h1>
        {location.state?.expired && <div className="notice">{t('admin.sessionExpired')}</div>}
        {!isConfigured && <div className="notice">{t('admin.noSupabase')}</div>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="admin-field">
            <span className="admin-field__label">Email</span>
            <input type="email" autoComplete="email" className="admin-input" {...register('email')} />
            {errors.email && <span className="admin-field__error">{errors.email.message}</span>}
          </label>
          <label className="admin-field">
            <span className="admin-field__label">{t('admin.password')}</span>
            <input type="password" autoComplete="current-password" className="admin-input" {...register('password')} />
            {errors.password && <span className="admin-field__error">{errors.password.message}</span>}
          </label>
          {error && <p className="admin-field__error">{error}</p>}
          <button type="submit" className="btn" disabled={isSubmitting || !isConfigured}>
            {t('admin.login')}
          </button>
        </form>
        <p style={{ marginTop: 16 }}>
          <Link to="/admin/forgot-password">{t('admin.forgotPassword')}</Link>
        </p>
      </main>
    </>
  );
}
