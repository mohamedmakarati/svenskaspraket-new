import { Link } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import RtlLayout from '@/hooks/useRtl';

export default function EnglishHomePage() {
  return (
    <RtlLayout lang="en">
      <PageSeo pageKey="en" />
      <header className="public-nav wrap">
        <Link to="/" className="brand">
          🇸🇪 Svenska<b>Språket</b>
        </Link>
        <nav className="lang-switch" aria-label="Choose language">
          <Link to="/">Svenska</Link>
          <Link to="/en" className="active" aria-current="page">
            English
          </Link>
          <Link to="/ar" lang="ar" dir="rtl">
            العربية
          </Link>
        </nav>
      </header>
      <main>
        <section className="lang-hero">
          <div className="wrap">
            <div className="tag">Swedish, step by step</div>
            <h1>Learn Swedish free – from A1 to C1</h1>
            <p className="lead">
              Learn Swedish free from A1 to C1. Study Swedish verbs, vocabulary and grammar with interactive
              flashcards, quizzes and English support.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
              <Link className="btn" to="/verbs?lang=en">
                Start with A1 verbs →
              </Link>
              <Link className="btn secondary" to="/vocabulary?lang=en">
                Open 805 words
              </Link>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <div className="tag">Choose your study path</div>
            <h2>Swedish–English learning materials</h2>
            <div className="grid-3">
              <article className="card">
                <div className="ico" style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', background: '#e8f2fe', borderRadius: 10, color: 'var(--blue)', fontWeight: 900 }}>
                  465
                </div>
                <h3>Swedish verbs</h3>
                <p>Study present, past, supine and imperative forms with English meanings and visual memory cards.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link className="btn" to="/verbs?lang=en">
                    A1
                  </Link>
                  <Link className="btn secondary" to="/verbs-a2?lang=en">
                    A2
                  </Link>
                  <Link className="btn secondary" to="/verbs-b1b2?lang=en">
                    B1–B2
                  </Link>
                  <Link className="btn secondary" to="/c1">
                    C1
                  </Link>
                </div>
              </article>
              <article className="card">
                <div className="ico" style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', background: '#e8f2fe', borderRadius: 10, color: 'var(--blue)', fontWeight: 900 }}>
                  805
                </div>
                <h3>Vocabulary and quizzes</h3>
                <p>Search Swedish words, reveal English and Arabic translations, flip flashcards and test yourself.</p>
                <Link className="btn" to="/vocabulary?lang=en">
                  Study vocabulary →
                </Link>
              </article>
              <article className="card">
                <div className="ico" style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', background: '#e8f2fe', borderRadius: 10, color: 'var(--blue)', fontWeight: 900 }}>
                  Aa
                </div>
                <h3>Swedish grammar</h3>
                <p>Practise personal pronouns at A1 level, or study nouns, compound words and the genitive at B1–B2.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link className="btn" to="/lessons-a1?lang=en">
                    A1 grammar →
                  </Link>
                  <Link className="btn secondary" to="/lessons?lang=en">
                    B1–B2 grammar
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section className="section alt">
          <div className="wrap">
            <div className="notice">
              <strong>Collected by students, for students</strong>
              <p>
                This independent resource has been collected and organised by students. It is designed to help learners
                studying—or preparing to study—<em>Swedish as a Foreign Language</em> at Lund University.
              </p>
            </div>
            <div className="stats-row">
              {[
                ['131', 'A1 verbs'],
                ['199', 'A2 verbs'],
                ['135', 'B1–B2 verbs'],
                ['805', 'words'],
              ].map(([n, label]) => (
                <div key={label} className="stat-box">
                  <strong>{n}</strong>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer wrap">
        <b>SvenskaSpråket</b>
        <span>© 2026 svenskaspraket.com</span>
      </footer>
    </RtlLayout>
  );
}
