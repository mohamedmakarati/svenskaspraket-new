import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminList, adminDelete } from '@/lib/adminApi';
import { toAdminError } from '@/lib/adminErrors';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/context/ToastContext';
import {
  PageHeader,
  FiltersBar,
  AdminTable,
  Pagination,
  StatusBadge,
  useConfirm,
} from '@/components/admin/AdminUi';

export default function AdminVerbsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEdit, canDelete } = usePermissions();
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [cefr, setCefr] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'verbs', page, search, status, cefr],
    queryFn: () =>
      adminList('verbs', {
        page,
        filters: { ...(status && { status }), ...(cefr && { cefr_level: cefr }) },
        search,
      }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminDelete('verbs', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'verbs'] });
      toast(t('admin.deleted'), 'success');
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  async function handleDelete(row) {
    const ok = await confirm({ message: `${row.infinitive}?` });
    if (ok) deleteMut.mutate(row.id);
  }

  return (
    <>
      {dialog}
      <PageHeader
        title={t('admin.verbs')}
        actions={
          canEdit && (
            <Link to="/admin/verbs/new" className="btn">
              + {t('admin.newVerb')}
            </Link>
          )
        }
      />
      <FiltersBar search={search} onSearch={setSearch} searchPlaceholder={t('admin.search')}>
        <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">{t('admin.allStatuses')}</option>
          <option value="draft">{t('admin.draft')}</option>
          <option value="published">{t('admin.publish')}</option>
          <option value="archived">archived</option>
        </select>
        <select className="admin-input" value={cefr} onChange={(e) => setCefr(e.target.value)} aria-label="CEFR">
          <option value="">{t('admin.allLevels')}</option>
          {['A1', 'A2', 'B1', 'B2'].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </FiltersBar>
      {error && <p className="admin-field__error">{toAdminError(error)}</p>}
      {isLoading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <>
          <AdminTable
            columns={[
              { key: 'infinitive', label: 'Infinitive' },
              { key: 'cefr_level', label: 'CEFR' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'updated_at', label: 'Updated', render: (r) => new Date(r.updated_at).toLocaleDateString() },
            ]}
            rows={data?.data ?? []}
            actions={(row) => (
              <>
                <button type="button" className="btn secondary" onClick={() => navigate(`/admin/verbs/${row.id}/edit`)}>
                  {canEdit ? t('admin.edit') : t('admin.preview')}
                </button>
                {canDelete && (
                  <button type="button" className="btn danger" onClick={() => handleDelete(row)}>
                    {t('admin.delete')}
                  </button>
                )}
              </>
            )}
          />
          <Pagination page={page} pageSize={20} count={data?.count ?? 0} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
