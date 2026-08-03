import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import { SiteFooter } from '@/components/Layout';
import { useLessons } from '@/hooks/usePublicData';
import LessonRenderer, { LanguageToggle } from '@/components/LessonRenderer';
import { OfflineNotice, QueryError, LessonSkeleton, EmptyState } from '@/components/PublicUi';
import { lessonsA1Meta } from '@/data/lessons-a1';

export default function LessonsA1Page() {
  const [searchParams] = useSearchParams();
  const [supportLang, setSupportLang] = useState(searchParams.get('lang') === 'ar' ? 'ar' : 'en');
  const { data, isLoading, isError, error, refetch } = useLessons('A1');
  const lessons = data?.items ?? [];
  const source = data?.source ?? 'static';

  return (
    <>
      <PageSeo pageKey="lessonsA1" />
      <header className="public-nav wrap">
        <Link to="/" className="brand">
          🇸🇪 Svenska<b>Språket</b>
        </Link>
        <nav className="links">
          <Link to="/verbs">A1-verb</Link>
          <Link to="/lessons">Grammatik B1–B2</Link>
          <Link to="/">Startsidan</Link>
        </nav>
      </header>
      <main className="wrap section">
        <OfflineNotice source={source} />
        <div className="tag">GRAMMATIK · A1</div>
        <h1>{lessonsA1Meta.title.replace(' | SvenskaSpråket', '').split(':')[0] ?? 'Personliga pronomen'}</h1>
        <p>Lär dig subjekt- och objektpronomen på svenska – grunden för att bygga enkla meningar.</p>
        <div style={{ margin: '22px 0' }}>
          <strong>Språkstöd: </strong>
          <LanguageToggle supportLang={supportLang} onChange={setSupportLang} />
        </div>

        {isError && (
          <QueryError message={error?.message ?? 'Kunde inte ladda lektioner.'} onRetry={() => refetch()} />
        )}
        {isLoading && <LessonSkeleton />}
        {!isLoading && !isError && lessons.length === 0 && (
          <EmptyState title="Inga lektioner tillgängliga" description="Kom tillbaka senare." />
        )}
        {!isLoading &&
          !isError &&
          lessons.map((lesson) => (
            <LessonRenderer key={lesson.slug ?? lesson.number} lesson={lesson} supportLang={supportLang} />
          ))}
      </main>
      <SiteFooter />
    </>
  );
}
