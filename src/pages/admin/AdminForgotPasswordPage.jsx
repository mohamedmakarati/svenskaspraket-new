import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { forgotPasswordSchema } from '@/schemas/admin';
import { useAuth } from '@/hooks/useAuth';
import { PageSeo } from '@/components/SeoHead';

export default function AdminForgotPasswordPage() {
  const { t } = useTranslation();
  const { resetPasswordForEmail, isConfigured } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit({ email }) {
    setError('');
    try {
      await resetPasswordForEmail(email);
      setSent(true);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <PageSeo pageKey="admin" />
      <main className="admin-login-page">
        <h1>{t('admin.forgotPassword')}</h1>
        {sent ? (
          <p>{t('admin.resetEmailSent')}</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="admin-field">
              <span className="admin-field__label">Email</span>
              <input type="email" className="admin-input" {...register('email')} />
              {errors.email && <span className="admin-field__error">{errors.email.message}</span>}
            </label>
            {error && <p className="admin-field__error">{error}</p>}
            <button type="submit" className="btn" disabled={isSubmitting || !isConfigured}>
              {t('admin.sendResetLink')}
            </button>
          </form>
        )}
        <p style={{ marginTop: 16 }}>
          <Link to="/admin/login">{t('admin.backToLogin')}</Link>
        </p>
      </main>
    </>
  );
}
