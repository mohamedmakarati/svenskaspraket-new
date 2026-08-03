import { resolveMediaUrl, verbImageAlt, vocabImageAlt } from '@/lib/media';

export function OfflineNotice({ source }) {
  if (source === 'supabase') return null;
  return (
    <p className="offline-notice" role="status">
      Visar sparad kopia — live-uppdateringar är tillfälligt otillgängliga.
    </p>
  );
}

export function QueryError({ message, onRetry }) {
  return (
    <div className="query-error" role="alert">
      <p>{message ?? 'Kunde inte ladda innehållet just nu.'}</p>
      {onRetry && (
        <button type="button" className="btn secondary" onClick={onRetry}>
          Försök igen
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title ?? 'Inget att visa'}</p>
      {description && <p className="empty-state__desc">{description}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }) {
  return (
    <div className="skeleton-table" aria-hidden="true">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="skeleton-row">
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className="skeleton-cell" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="skeleton-cards" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  );
}

export function LessonSkeleton() {
  return (
    <div className="skeleton-lesson" aria-hidden="true">
      <div className="skeleton-line skeleton-line--lg" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <CardSkeleton count={2} />
    </div>
  );
}

export function ResponsiveImage({ src, alt, width = 120, height = 80, className = '' }) {
  const url = resolveMediaUrl(src);
  if (!url) return null;
  return (
    <img
      className={className}
      src={url}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      sizes="(max-width: 600px) 80px, 120px"
    />
  );
}

export function VerbImage({ verb, lang = 'sv', className = 'verb-image' }) {
  return (
    <ResponsiveImage
      src={verb.image_path}
      alt={verbImageAlt(verb, lang)}
      className={className}
    />
  );
}

export function VocabImage({ word, lang = 'sv' }) {
  return (
    <ResponsiveImage
      src={word.image_path}
      alt={vocabImageAlt(word, lang)}
      width={64}
      height={64}
      className="vocab-image"
    />
  );
}

export function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Sidnavigering">
      <button
        type="button"
        className="btn secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Föregående
      </button>
      <span>
        Sida {page} av {totalPages} ({total} totalt)
      </span>
      <button
        type="button"
        className="btn secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Nästa →
      </button>
    </nav>
  );
}
