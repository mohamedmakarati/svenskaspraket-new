import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SeoHead from '@/components/SeoHead';
import { SiteFooter } from '@/components/Layout';
import { LanguageToggle, GrammarQuiz, SupportBlock, ExampleCard } from '@/components/GrammarQuiz';
import { lessonsA1, lessonsA1Meta } from '@/data/lessons-a1';
import { SITE_URL } from '@/lib/supabase';

export default function LessonsA1Page() {
  const [searchParams] = useSearchParams();
  const [supportLang, setSupportLang] = useState(searchParams.get('lang') === 'ar' ? 'ar' : 'en');
  const lesson = lessonsA1[0];

  return (
    <>
      <SeoHead
        title={lessonsA1Meta.title}
        description={lessonsA1Meta.description}
        canonical={lessonsA1Meta.canonical}
        hreflang={false}
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'LearningResource',
              url: `${SITE_URL}${lessonsA1Meta.canonical}`,
              name: 'Svenska personliga pronomen A1',
              educationalLevel: 'A1',
              inLanguage: ['sv', 'en', 'ar'],
            },
          ],
        }}
      />
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
        <div className="tag">GRAMMATIK · A1</div>
        <h1>Personliga pronomen</h1>
        <p>Lär dig subjekt- och objektpronomen på svenska – grunden för att bygga enkla meningar.</p>
        <div style={{ margin: '22px 0' }}>
          <strong>Språkstöd: </strong>
          <LanguageToggle supportLang={supportLang} onChange={setSupportLang} />
        </div>

        <article className="lesson-block">
          <div className="lesson-head">
            <span className="tag">LEKTION {lesson.number}</span>
            <h2>{lesson.title_sv}</h2>
            <p>{lesson.subtitle_sv}</p>
          </div>
          <div className="lesson-body">
            <SupportBlock lang={supportLang} en={lesson.support_en} ar={lesson.support_ar} />

            {lesson.rules.map((rule) => (
              <div key={rule.title} className="rule-block">
                <h3>{rule.title}</h3>
                <strong>Huvudregel:</strong> {rule.sv}
                <br />
                <em>{rule.example}</em>
              </div>
            ))}

            {lesson.subjectTable && (
              <>
                <h3>Subjektspronomen</h3>
                <table className="lesson-table">
                  <thead>
                    <tr>
                      <th>Svenska</th>
                      <th>{supportLang === 'ar' ? 'العربية' : 'English'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lesson.subjectTable.map((row) => (
                      <tr key={row.sv}>
                        <td>
                          <strong>{row.sv}</strong>
                        </td>
                        <td className={supportLang === 'ar' ? 'arabic' : ''} dir={supportLang === 'ar' ? 'rtl' : undefined}>
                          {supportLang === 'ar' ? row.ar : row.en}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {lesson.objectTable && (
              <>
                <h3>Objektspronomen</h3>
                <table className="lesson-table">
                  <thead>
                    <tr>
                      <th>Subjekt</th>
                      <th>Objekt</th>
                      <th>{supportLang === 'ar' ? 'العربية' : 'English'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lesson.objectTable.map((row) => (
                      <tr key={row.obj}>
                        <td>{row.subj}</td>
                        <td>
                          <strong>{row.obj}</strong>
                        </td>
                        <td className={supportLang === 'ar' ? 'arabic' : ''} dir={supportLang === 'ar' ? 'rtl' : undefined}>
                          {supportLang === 'ar' ? row.ar : row.en}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <div className="grid-2">
              {lesson.examples.map((ex) => (
                <ExampleCard key={ex.sv} ex={ex} supportLang={supportLang} />
              ))}
            </div>

            <GrammarQuiz questions={lesson.quiz} />
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
