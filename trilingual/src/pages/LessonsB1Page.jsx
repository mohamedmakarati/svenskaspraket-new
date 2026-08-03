import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SeoHead from '@/components/SeoHead';
import { SiteFooter } from '@/components/Layout';
import { LanguageToggle, GrammarQuiz, SupportBlock } from '@/components/GrammarQuiz';
import { lessonsB1, lessonsB1Meta, allB1Quiz } from '@/data/lessons-b1';
import { SITE_URL } from '@/lib/supabase';

export default function LessonsB1Page() {
  const [searchParams] = useSearchParams();
  const [supportLang, setSupportLang] = useState(searchParams.get('lang') === 'ar' ? 'ar' : 'en');

  return (
    <>
      <SeoHead
        title={lessonsB1Meta.title}
        description={lessonsB1Meta.description}
        canonical={lessonsB1Meta.canonical}
        hreflang={false}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'LearningResource',
          url: `${SITE_URL}${lessonsB1Meta.canonical}`,
          name: lessonsB1Meta.title,
          educationalLevel: 'B1-B2',
        }}
      />
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
        <div className="tag">GRAMMATIK · B1–B2</div>
        <h1>Substantiv steg för steg</h1>
        <p>Tre korta originallektioner med svenska som huvudspråk. Välj engelskt eller arabiskt språkstöd.</p>
        <div style={{ margin: '22px 0' }}>
          <strong>Språkstöd: </strong>
          <LanguageToggle supportLang={supportLang} onChange={setSupportLang} />
        </div>

        {lessonsB1.map((lesson) => (
          <article key={lesson.number} className="lesson-block">
            <div className="lesson-head">
              <span className="tag">LEKTION {lesson.number}</span>
              <h2>{lesson.title_sv}</h2>
              <p>{lesson.subtitle_sv}</p>
            </div>
            <div className="lesson-body">
              <SupportBlock lang={supportLang} en={lesson.support_en} ar={lesson.support_ar} />
              <div className="rule-block">
                <strong>{lesson.rule_sv}</strong>
              </div>
              <div className="grid-2">
                {lesson.examples.map((ex) => (
                  <div key={ex.sv} className="feature-card">
                    <strong style={{ color: 'var(--blue)' }}>{ex.sv}</strong>
                    {ex.detail && <div>{ex.detail}</div>}
                    {supportLang === 'en' && <div>{ex.en}</div>}
                    {supportLang === 'ar' && (
                      <div className="arabic" dir="rtl">
                        {ex.ar}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <GrammarQuiz questions={lesson.quiz} />
            </div>
          </article>
        ))}

        <div className="score-bar">Totalt {allB1Quiz.length} quizfrågor i alla lektioner.</div>
      </main>
      <SiteFooter />
    </>
  );
}
