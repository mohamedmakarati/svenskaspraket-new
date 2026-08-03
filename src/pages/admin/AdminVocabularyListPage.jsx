import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminList, adminDelete } from '@/lib/adminApi';
import { toAdminError } from '@/lib/adminErrors';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/context/ToastContext';
import { PageHeader, FiltersBar, AdminTable, Pagination, StatusBadge, useConfirm } from '@/components/admin/AdminUi';

export default function AdminVocabularyListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEdit, canDelete } = usePermissions();
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'vocabulary', page, search, status],
    queryFn: () => adminList('vocabulary', { page, search, filters: status ? { status } : {} }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminDelete('vocabulary', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'vocabulary'] });
      toast(t('admin.deleted'), 'success');
    },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  return (
    <>
      {dialog}
      <PageHeader
        title={t('admin.vocabulary')}
        actions={canEdit && <Link to="/admin/vocabulary/new" className="btn">+ {t('admin.newWord')}</Link>}
      />
      <FiltersBar search={search} onSearch={setSearch} searchPlaceholder={t('admin.search')}>
        <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t('admin.allStatuses')}</option>
          <option value="draft">{t('admin.draft')}</option>
          <option value="published">{t('admin.publish')}</option>
        </select>
      </FiltersBar>
      {error && <p className="admin-field__error">{toAdminError(error)}</p>}
      {isLoading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <>
          <AdminTable
            columns={[
              { key: 'word_sv', label: 'SV' },
              { key: 'meaning_en', label: 'EN' },
              { key: 'cefr_level', label: 'CEFR' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={data?.data ?? []}
            actions={(row) => (
              <>
                <button type="button" className="btn secondary" onClick={() => navigate(`/admin/vocabulary/${row.id}/edit`)}>
                  {canEdit ? t('admin.edit') : t('admin.preview')}
                </button>
                {canDelete && (
                  <button type="button" className="btn danger" onClick={async () => {
                    if (await confirm({ message: row.word_sv })) deleteMut.mutate(row.id);
                  }}>
                    {t('admin.delete')}
                  </button>
                )}
              </>
            )}
          />
          <Pagination page={page} count={data?.count ?? 0} pageSize={20} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
