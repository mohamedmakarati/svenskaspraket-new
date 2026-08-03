import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminSearchEntities } from '@/lib/adminApi';
import { FormField } from '@/components/admin/AdminUi';

export default function EntityPicker({ table, label, value, onChange, disabled }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'entity-search', table, query],
    queryFn: () => adminSearchEntities(table, query),
  });

  const options = data ?? [];
  const selected = options.find((o) => o.id === value);

  return (
    <FormField label={label}>
      <input
        type="search"
        className="admin-input"
        placeholder={t('admin.search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
        aria-label={label}
      />
      <select
        className="admin-input"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled || isLoading}
        style={{ marginTop: 8 }}
      >
        <option value="">{t('admin.noneSelected')}</option>
        {selected && !options.some((o) => o.id === selected.id) && (
          <option value={selected.id}>{selected.label}</option>
        )}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label} ({o.status})
          </option>
        ))}
      </select>
    </FormField>
  );
}
