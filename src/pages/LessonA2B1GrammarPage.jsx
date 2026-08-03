import { Link } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import { SiteFooter } from '@/components/Layout';
import LongFormGrammarLesson from '@/components/LongFormGrammarLesson';
import { a2b1GrammarLesson, a2b1GrammarMeta } from '@/data/lesson-a2b1-grammar';

export default function LessonA2B1GrammarPage() {
  return (
    <>
      <PageSeo pageKey="lessonA2B1Grammar" />
      <header className="public-nav wrap">
        <Link to="/" className="brand">
          🇸🇪 Svenska<b>Språket</b>
        </Link>
        <nav className="links">
          <Link to="/lessons-a1">Grammatik A1</Link>
          <Link to="/lessons">Grammatik B1–B2</Link>
          <Link to="/">Startsidan</Link>
        </nav>
      </header>
      <main className="wrap section grammar-long-page">
        <LongFormGrammarLesson lesson={a2b1GrammarLesson} />
      </main>
      <SiteFooter />
    </>
  );
}

export { a2b1GrammarMeta };
