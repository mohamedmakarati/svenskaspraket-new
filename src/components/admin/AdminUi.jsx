import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger }) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="admin-modal">
        <h2 id="confirm-title">{title ?? t('admin.confirmDelete')}</h2>
        {message && <p>{message}</p>}
        <div className="admin-modal-actions">
          <button type="button" className="btn secondary" onClick={onCancel}>
            {t('admin.cancel')}
          </button>
          <button type="button" className={`btn ${danger ? 'danger' : ''}`} onClick={onConfirm}>
            {t('admin.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const [state, setState] = useState(null);
  const confirm = (opts) =>
    new Promise((resolve) => {
      setState({ ...opts, resolve });
    });
  const dialog = state ? (
    <ConfirmDialog
      open
      title={state.title}
      message={state.message}
      danger={state.danger !== false}
      onCancel={() => {
        state.resolve(false);
        setState(null);
      }}
      onConfirm={() => {
        state.resolve(true);
        setState(null);
      }}
    />
  ) : null;
  return { confirm, dialog };
}

export function LanguageTabs({ active, onChange, children }) {
  const tabs = ['sv', 'en', 'ar'];
  const labels = { sv: 'Svenska', en: 'English', ar: 'العربية' };
  return (
    <div className="admin-lang-tabs">
      <div className="admin-lang-tabs__nav" role="tablist">
        {tabs.map((lang) => (
          <button
            key={lang}
            type="button"
            role="tab"
            aria-selected={active === lang}
            className={active === lang ? 'active' : ''}
            onClick={() => onChange(lang)}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            {labels[lang]}
          </button>
        ))}
      </div>
      <div className="admin-lang-tabs__panel" role="tabpanel">
        {typeof children === 'function' ? children(active) : children}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={`admin-badge admin-badge--${status}`}>{status}</span>;
}

export function PageHeader({ title, actions }) {
  return (
    <header className="admin-page-header">
      <h1>{title}</h1>
      {actions && <div className="admin-page-header__actions">{actions}</div>}
    </header>
  );
}

export function Pagination({ page, pageSize, count, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  return (
    <nav className="admin-pagination" aria-label="Pagination">
      <button type="button" className="btn secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ←
      </button>
      <span>
        {page} / {totalPages} ({count})
      </span>
      <button
        type="button"
        className="btn secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        →
      </button>
    </nav>
  );
}

export function FiltersBar({ search, onSearch, searchPlaceholder, children }) {
  const { t } = useTranslation();
  return (
    <div className="admin-filters">
      <input
        type="search"
        className="admin-input"
        placeholder={searchPlaceholder ?? t('admin.search')}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        aria-label={t('admin.search')}
      />
      {children}
    </div>
  );
}

export function FormField({ label, error, children, required }) {
  return (
    <label className="admin-field">
      <span className="admin-field__label">
        {label}
        {required && ' *'}
      </span>
      {children}
      {error && (
        <span className="admin-field__error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

export function SeoFields({ register, lang }) {
  const { t } = useTranslation();
  const suffix = lang === 'sv' ? '_sv' : lang === 'en' ? '_en' : '_ar';
  return (
    <>
      <FormField label={`${t('admin.seoTitle')} (${lang})`}>
        <input className="admin-input" {...register(`seo_title${suffix}`)} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      </FormField>
      <FormField label={`${t('admin.seoDescription')} (${lang})`}>
        <textarea
          className="admin-input"
          rows={2}
          {...register(`seo_description${suffix}`)}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        />
      </FormField>
    </>
  );
}

export function ImagePicker({ value, onChange, onUpload, disabled }) {
  const { t } = useTranslation();
  return (
    <div className="admin-image-picker">
      {value && <img src={value} alt="" className="admin-image-picker__thumb" />}
      <input
        type="text"
        className="admin-input"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/verb-images/… or URL"
        disabled={disabled}
      />
      {onUpload && !disabled && (
        <label className="btn secondary admin-upload-btn">
          {t('admin.upload')}
          <input type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp" hidden onChange={onUpload} />
        </label>
      )}
    </div>
  );
}

export function AdminTable({ columns, rows, actions }) {
  const { t } = useTranslation();
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            {actions && <th scope="col">{t('admin.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="admin-table__empty">
                {t('admin.noRecords')}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
              {actions && <td className="admin-table__actions">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
