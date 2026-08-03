import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SeoHead from '@/components/SeoHead';
import { SiteFooter } from '@/components/Layout';
import { fetchVerbs, fetchAuxiliaries } from '@/lib/data';
import { normalizeSearch, shuffle } from '@/lib/utils';
import { SITE_URL } from '@/lib/supabase';

const LEVEL_CONFIG = {
  A1: {
    path: '/verbs',
    title: '131 svenska A1-verb med böjning | SvenskaSpråket',
    description: 'Träna 131 vanliga svenska A1-verb med full böjning, minnesbilder och betydelser på engelska och arabiska.',
    canonical: '/verbs',
    count: 131,
    groups: ['all', '1', '2A', '2B', '2C', '3', '4-5'],
    showAux: true,
  },
  A2: {
    path: '/verbs-a2',
    title: '199 svenska A2-verb med böjning | SvenskaSpråket',
    description: 'Träna 199 svenska A2-verb med böjning, minnesbilder och översättningar.',
    canonical: '/verbs-a2',
    count: 199,
    groups: null,
    showAux: false,
  },
  'B1-B2': {
    path: '/verbs-b1b2',
    title: '135 oregelbundna verb B1-B2 | SvenskaSpråket',
    description: 'Träna 135 oregelbundna svenska verb på B1-B2-nivå.',
    canonical: '/verbs-b1b2',
    count: 135,
    groups: null,
    showAux: false,
  },
};

export default function VerbsPage({ level = 'A1' }) {
  const config = LEVEL_CONFIG[level];
  const [searchParams] = useSearchParams();
  const [verbs, setVerbs] = useState([]);
  const [auxiliaries, setAuxiliaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [lang, setLang] = useState(searchParams.get('lang') === 'ar' ? 'ar' : 'en');
  const [quiz, setQuiz] = useState(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    Promise.all([fetchVerbs(level), config.showAux ? fetchAuxiliaries() : Promise.resolve([])])
      .then(([v, a]) => {
        setVerbs(v);
        setAuxiliaries(a);
      })
      .finally(() => setLoading(false));
  }, [level, config.showAux]);

  const groups =
    config.groups ??
    [...new Set(verbs.map((v) => v.verb_group).filter(Boolean))].sort();

  const filtered = verbs.filter((v) => {
    const gm = group === 'all' || v.verb_group === group;
    const q = normalizeSearch(query);
    const hay = normalizeSearch(
      [v.infinitive, v.present, v.preterite, v.content_en, v.content_ar, v.english, v.arabic, v.en, v.ar]
        .filter(Boolean)
        .join(' '),
    );
    return gm && (!q || hay.includes(q));
  });

  function getTranslation(v) {
    if (lang === 'ar') return v.content_ar ?? v.arabic ?? v.ar ?? '—';
    return v.content_en ?? v.english ?? v.en ?? '—';
  }

  function startQuiz() {
    const q = shuffle(verbs).slice(0, 10);
    setQuiz(q);
    setQuizIndex(0);
    setScore(0);
    setLocked(false);
  }

  function answerQuiz(choice) {
    if (locked || !quiz) return;
    setLocked(true);
    const verb = quiz[quizIndex];
    const correct = choice === verb.preterite;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      setQuizIndex((i) => i + 1);
      setLocked(false);
    }, 850);
  }

  const currentVerb = quiz?.[quizIndex];

  return (
    <>
      <SeoHead
        title={config.title}
        description={config.description}
        canonical={config.canonical}
        hreflang={false}
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'LearningResource',
              url: `${SITE_URL}${config.canonical}`,
              name: config.title,
              educationalLevel: level,
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
          <Link to="/verbs">A1</Link>
          <Link to="/verbs-a2">A2</Link>
          <Link to="/verbs-b1b2">B1-B2</Link>
          <Link to="/lessons-a1">Grammatik</Link>
          <Link to="/">Hem</Link>
        </nav>
      </header>
      <main className="wrap verbs-page section">
        <div className="tag">{level} · SVENSKA VERB</div>
        <h1>{config.count} svenska {level}-verb</h1>
        <p>Sök, filtrera och träna verbformerna. Välj engelska eller arabiska översättningar.</p>

        <div className="controls">
          <input
            type="search"
            placeholder="Sök verb…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Sök verb"
          />
          <select value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Filtrera grupp">
            <option value="all">Alla grupper</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g === 'all' ? 'Alla' : g}
              </option>
            ))}
          </select>
          <div className="lang-toggle">
            <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
              English
            </button>
            <button type="button" className={lang === 'ar' ? 'active' : ''} onClick={() => setLang('ar')}>
              العربية
            </button>
          </div>
        </div>

        <p>
          Visar <strong>{filtered.length}</strong> verb
        </p>

        {loading ? (
          <p>Laddar verb…</p>
        ) : (
          <div className="verbs-table-wrap">
            <table className="verbs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bild</th>
                  <th>Grupp</th>
                  <th>Imperativ</th>
                  <th>Infinitiv</th>
                  <th>Presens</th>
                  <th>Preteritum</th>
                  <th>Supinum</th>
                  <th>{lang === 'ar' ? 'العربية' : 'English'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id ?? v.legacy_id}>
                    <td>{v.legacy_id ?? v.id}</td>
                    <td>
                      {v.image_path && (
                        <img
                          className="verb-image"
                          loading="lazy"
                          src={v.image_path}
                          alt={`Minnesbild för ${v.infinitive}`}
                          width={120}
                          height={80}
                        />
                      )}
                    </td>
                    <td>{v.verb_group}</td>
                    <td>{v.imperative ?? '—'}</td>
                    <td>
                      <strong>{v.infinitive}</strong>
                    </td>
                    <td>{v.present}</td>
                    <td>{v.preterite}</td>
                    <td>{v.supine}</td>
                    <td className={lang === 'ar' ? 'arabic' : ''} dir={lang === 'ar' ? 'rtl' : undefined}>
                      {getTranslation(v)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {config.showAux && auxiliaries.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <h2>Hjälpverb</h2>
            <div className="grid-3">
              {auxiliaries.map((a, i) => (
                <div key={i} className="card">
                  <strong>{a.swedish ?? a.content_sv}</strong>
                  <div className={lang === 'ar' ? 'arabic' : ''} dir={lang === 'ar' ? 'rtl' : undefined}>
                    {lang === 'ar' ? (a.arabic ?? a.content_ar) : (a.english ?? a.content_en)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="quiz-area">
          <h2>Snabbtest — preteritum</h2>
          <button type="button" className="btn" onClick={startQuiz}>
            {quiz ? 'Starta om' : 'Starta quiz'}
          </button>
          {quiz && quizIndex >= quiz.length && (
            <p style={{ fontWeight: 700, marginTop: 16 }}>
              Klart! Du fick {score} av {quiz.length} rätt.
            </p>
          )}
          {currentVerb && quizIndex < quiz.length && (
            <>
              <p style={{ marginTop: 16 }}>
                {quizIndex + 1}/10: Vad är preteritum av &ldquo;{currentVerb.infinitive}&rdquo;?
              </p>
              <div className="quiz-choices">
                {shuffle([
                  currentVerb.preterite,
                  ...shuffle(verbs.filter((x) => x.id !== currentVerb.id).map((x) => x.preterite)).slice(0, 2),
                ]).map((c) => (
                  <button key={c} type="button" onClick={() => answerQuiz(c)} disabled={locked}>
                    {c}
                  </button>
                ))}
              </div>
              <p>Poäng: {score}</p>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
