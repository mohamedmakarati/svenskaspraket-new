import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import { SiteFooter } from '@/components/Layout';
import { useLessons } from '@/hooks/usePublicData';
import LessonRenderer, { LanguageToggle } from '@/components/LessonRenderer';
import { OfflineNotice, QueryError, LessonSkeleton, EmptyState } from '@/components/PublicUi';
import { lessonsB1Meta, allB1Quiz } from '@/data/lessons-b1';

export default function LessonsB1Page() {
  const [searchParams] = useSearchParams();
  const [supportLang, setSupportLang] = useState(searchParams.get('lang') === 'ar' ? 'ar' : 'en');
  const { data, isLoading, isError, error, refetch } = useLessons('B1-B2');
  const lessons = data?.items ?? [];
  const source = data?.source ?? 'static';
  const quizCount = lessons.reduce((n, l) => n + (l.quiz?.length ?? 0), 0) || allB1Quiz.length;

  return (
    <>
      <PageSeo pageKey="lessonsB1" />
      <header className="public-nav wrap">
        <Link to="/" className="brand">
          🇸🇪 Svenska<b>Språket</b>
        </Link>
        <nav className="links">
          <Link to="/lessons-a1">Grammatik A1</Link>
          <Link to="/verbs">A1-verb</Link>
          <Link to="/">Startsidan</Link>
        </nav>
      </header>
      <main className="wrap section">
        <OfflineNotice source={source} />
        <div className="tag">GRAMMATIK · B1–B2</div>
        <h1>Substantiv steg för steg</h1>
        <p>Tre korta originallektioner med svenska som huvudspråk. Välj engelskt eller arabiskt språkstöd.</p>
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

        {!isLoading && lessons.length > 0 && (
          <div className="score-bar">Totalt {quizCount} quizfrågor i alla lektioner.</div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
