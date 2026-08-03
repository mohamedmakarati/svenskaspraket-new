import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { loginSchema } from '@/schemas';
import { useAuth } from '@/hooks/useAuth';
import SeoHead from '@/components/SeoHead';

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const from = location.state?.from || '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

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
      <SeoHead title="Admin login" noindex hreflang={false} />
      <main className="wrap section" style={{ maxWidth: 420, margin: '80px auto' }}>
        <h1>{t('admin.login')}</h1>
        {!isConfigured && (
          <div className="notice" style={{ marginBottom: 20 }}>
            {t('admin.noSupabase')}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label htmlFor="email" style={{ display: 'block', marginBottom: 16 }}>
            E-post
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              style={{ display: 'block', width: '100%', padding: 12, marginTop: 6 }}
            />
            {errors.email && <span style={{ color: 'var(--bad)' }}>{errors.email.message}</span>}
          </label>
          <label htmlFor="password" style={{ display: 'block', marginBottom: 16 }}>
            Lösenord
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              style={{ display: 'block', width: '100%', padding: 12, marginTop: 6 }}
            />
            {errors.password && <span style={{ color: 'var(--bad)' }}>{errors.password.message}</span>}
          </label>
          {error && <p style={{ color: 'var(--bad)' }}>{error}</p>}
          <button type="submit" className="btn" disabled={isSubmitting || !isConfigured}>
            {t('admin.login')}
          </button>
        </form>
      </main>
    </>
  );
}
