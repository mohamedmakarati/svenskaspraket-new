import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminListSettings, adminUpsertSetting } from '@/lib/adminApi';
import { toAdminError } from '@/lib/adminErrors';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/admin/AdminUi';

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const { canManageSettings } = usePermissions();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [siteName, setSiteName] = useState('');
  const [defaultLang, setDefaultLang] = useState('sv');
  const [siteDescription, setSiteDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: adminListSettings,
    enabled: canManageSettings,
  });

  useEffect(() => {
    if (!data) return;
    const name = data.find((s) => s.setting_key === 'site_name');
    const lang = data.find((s) => s.setting_key === 'default_language');
    const desc = data.find((s) => s.setting_key === 'site_description');
    if (name?.setting_value?.value) setSiteName(String(name.setting_value.value));
    if (lang?.setting_value?.value) setDefaultLang(String(lang.setting_value.value));
    if (desc?.setting_value?.value) setSiteDescription(String(desc.setting_value.value));
  }, [data]);

  const saveMut = useMutation({
    mutationFn: async () => {
      await adminUpsertSetting('site_name', { value: siteName });
      await adminUpsertSetting('default_language', { value: defaultLang });
      await adminUpsertSetting('site_description', { value: siteDescription });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast(t('admin.saved'), 'success');
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  if (!canManageSettings) {
    return <p className="admin-field__error">{t('admin.adminOnly')}</p>;
  }

  return (
    <>
      <PageHeader title={t('admin.settings')} />
      {isLoading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <form
          className="admin-card"
          onSubmit={(e) => {
            e.preventDefault();
            saveMut.mutate();
          }}
          style={{ maxWidth: 480 }}
        >
          <label className="admin-field">
            <span className="admin-field__label">{t('admin.siteName')}</span>
            <input className="admin-input" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">{t('admin.defaultLanguage')}</span>
            <select className="admin-input" value={defaultLang} onChange={(e) => setDefaultLang(e.target.value)}>
              <option value="sv">Svenska</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">{t('admin.siteDescription')}</span>
            <textarea className="admin-input" rows={3} value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} />
          </label>
          <button type="submit" className="btn" disabled={saveMut.isPending}>
            {t('admin.save')}
          </button>
        </form>
      )}
    </>
  );
}
