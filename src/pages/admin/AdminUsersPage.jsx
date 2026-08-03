import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminListUsers, adminUpdateProfile } from '@/lib/adminApi';
import { toAdminError } from '@/lib/adminErrors';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/context/ToastContext';
import { PageHeader, AdminTable, FormField } from '@/components/admin/AdminUi';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { canManageUsers } = usePermissions();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ display_name: '', preferred_language: 'sv', role: 'viewer' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminListUsers,
    enabled: canManageUsers,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...updates }) => adminUpdateProfile(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast(t('admin.saved'), 'success');
      setEditing(null);
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  if (!canManageUsers) return <p className="admin-field__error">{t('admin.adminOnly')}</p>;

  function openEdit(row) {
    setEditing(row);
    setForm({
      display_name: row.display_name ?? '',
      preferred_language: row.preferred_language ?? 'sv',
      role: row.role ?? 'viewer',
    });
  }

  return (
    <>
      <PageHeader title={t('admin.users')} />
      <p className="admin-hint">{t('admin.inviteHint')}</p>
      {error && <p className="admin-field__error">{toAdminError(error)}</p>}
      {isLoading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <AdminTable
          columns={[
            { key: 'display_name', label: t('admin.name') },
            { key: 'role', label: t('admin.role'), render: (r) => t(`admin.role${r.role.charAt(0).toUpperCase()}${r.role.slice(1)}`, r.role) },
            { key: 'preferred_language', label: t('admin.language') },
          ]}
          rows={data ?? []}
          actions={(row) => (
            <button type="button" className="btn secondary" onClick={() => openEdit(row)}>
              {t('admin.edit')}
            </button>
          )}
        />
      )}

      {editing && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <form
            className="admin-modal"
            onSubmit={(e) => {
              e.preventDefault();
              updateMut.mutate({ id: editing.id, ...form });
            }}
          >
            <h2>{t('admin.editUser')}</h2>
            <FormField label={t('admin.name')}>
              <input className="admin-input" value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} />
            </FormField>
            <FormField label={t('admin.language')}>
              <select className="admin-input" value={form.preferred_language} onChange={(e) => setForm((f) => ({ ...f, preferred_language: e.target.value }))}>
                <option value="sv">Svenska</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </FormField>
            <FormField label={t('admin.role')}>
              <select className="admin-input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="viewer">{t('admin.roleViewer')}</option>
                <option value="editor">{t('admin.roleEditor')}</option>
                <option value="admin">{t('admin.roleAdmin')}</option>
              </select>
            </FormField>
            <div className="admin-modal-actions">
              <button type="button" className="btn secondary" onClick={() => setEditing(null)}>
                {t('admin.cancel')}
              </button>
              <button type="submit" className="btn">
                {t('admin.save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
