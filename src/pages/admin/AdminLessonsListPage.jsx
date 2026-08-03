import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminList, adminDelete } from '@/lib/adminApi';
import { toAdminError } from '@/lib/adminErrors';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/context/ToastContext';
import { PageHeader, FiltersBar, AdminTable, Pagination, StatusBadge, useConfirm } from '@/components/admin/AdminUi';

export default function AdminLessonsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEdit, canDelete } = usePermissions();
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'lessons', page, search],
    queryFn: () => adminList('lessons', { page, search, sort: 'sort_order', ascending: true }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminDelete('lessons', id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'lessons'] }); toast(t('admin.deleted'), 'success'); },
    onError: (e) => toast(toAdminError(e), 'error'),
  });

  return (
    <>
      {dialog}
      <PageHeader title={t('admin.lessons')} actions={canEdit && <Link to="/admin/lessons/new" className="btn">+ {t('admin.newLesson')}</Link>} />
      <FiltersBar search={search} onSearch={setSearch} searchPlaceholder={t('admin.search')} />
      {error && <p className="admin-field__error">{toAdminError(error)}</p>}
      {isLoading ? <p>{t('common.loading')}</p> : (
        <>
          <AdminTable
            columns={[
              { key: 'title_sv', label: 'Title' },
              { key: 'cefr_level', label: 'CEFR' },
              { key: 'sort_order', label: '#' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={data?.data ?? []}
            actions={(row) => (
              <>
                <button type="button" className="btn secondary" onClick={() => navigate(`/admin/lessons/${row.id}/edit`)}>{t('admin.edit')}</button>
                {canDelete && <button type="button" className="btn danger" onClick={async () => { if (await confirm({ message: row.title_sv })) deleteMut.mutate(row.id); }}>{t('admin.delete')}</button>}
              </>
            )}
          />
          <Pagination page={page} count={data?.count ?? 0} pageSize={20} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
