import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { resetPasswordSchema } from '@/schemas/admin';
import { useAuth } from '@/hooks/useAuth';
import { PageSeo } from '@/components/SeoHead';

export default function AdminResetPasswordPage() {
  const { t } = useTranslation();
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit({ password }) {
    setError('');
    try {
      await updatePassword(password);
      navigate('/admin/login', { replace: true, state: { reset: true } });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <PageSeo pageKey="admin" />
      <main className="admin-login-page">
        <h1>{t('admin.resetPassword')}</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="admin-field">
            <span className="admin-field__label">{t('admin.newPassword')}</span>
            <input type="password" autoComplete="new-password" className="admin-input" {...register('password')} />
            {errors.password && <span className="admin-field__error">{errors.password.message}</span>}
          </label>
          <label className="admin-field">
            <span className="admin-field__label">{t('admin.confirmPassword')}</span>
            <input type="password" autoComplete="new-password" className="admin-input" {...register('confirm')} />
            {errors.confirm && <span className="admin-field__error">{errors.confirm.message}</span>}
          </label>
          {error && <p className="admin-field__error">{error}</p>}
          <button type="submit" className="btn" disabled={isSubmitting}>
            {t('admin.savePassword')}
          </button>
        </form>
        <p style={{ marginTop: 16 }}>
          <Link to="/admin/login">{t('admin.backToLogin')}</Link>
        </p>
      </main>
    </>
  );
}
