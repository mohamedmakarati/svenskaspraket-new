import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SeoHead from '@/components/SeoHead';
import { SiteFooter } from '@/components/Layout';
import { fetchVocabulary } from '@/lib/data';
import { SITE_URL } from '@/lib/supabase';

export default function VocabularyPage() {
  const [searchParams] = useSearchParams();
  const supportLang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';
  const [words, setWords] = useState([]);
  const [order, setOrder] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tab, setTab] = useState('flashcards');
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVocabulary().then((data) => {
      setWords(data);
      setOrder(data.map((_, i) => i));
      setLoading(false);
      newQuestion(data);
    });
  }, []);

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function newQuestion(list = words) {
    if (!list.length) return;
    const q = pick(list);
    setQuestion({ word: q, choices: null });
    setFeedback('');
    const choices = [q, ...list.filter((x) => x.id !== q.id).sort(() => Math.random() - 0.5).slice(0, 3)].sort(
      () => Math.random() - 0.5,
    );
    setQuestion({ word: q, choices });
  }

  function showCard(idx) {
    setCurrent(idx);
    setFlipped(false);
  }

  function shuffleCards() {
    setOrder([...order].sort(() => Math.random() - 0.5));
    setCurrent(0);
    setFlipped(false);
  }

  const filtered = words.filter((w) => {
    const q = search.trim().toLowerCase();
    return !q || `${w.sv} ${w.en} ${w.ar}`.toLowerCase().includes(q);
  });

  const cardWord = words[order[current]];

  return (
    <>
      <SeoHead
        title="805 svenska ord B1-B2 med flashcards | SvenskaSpråket"
        description="Träna 805 svenska ord och uttryck på B1-B2-nivå med engelsk och arabisk översättning. Interaktiva flashcards, sökbar ordlista och quiz."
        canonical="/vocabulary"
        hreflang={false}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'LearningResource',
          url: `${SITE_URL}/vocabulary`,
          name: '805 svenska ord B1-B2 med flashcards',
          educationalLevel: 'B1-B2',
        }}
      />
      <header className="public-nav wrap">
        <Link to="/" className="brand">
          Svenska<span style={{ color: 'var(--blue)' }}>Språket</span>
        </Link>
        <nav className="links">
          <Link to="/">Hem</Link>
          <Link to="/verbs">A1-verb</Link>
          <Link to="/lessons-a1">Grammatik A1</Link>
          <Link to="/lessons">Grammatik B1–B2</Link>
        </nav>
      </header>
      <main className="wrap section">
        <div className="tag">B1-B2 · ORDFÖRRÅD</div>
        <h1>805 svenska ord och uttryck</h1>
        <p>Svenska · English · العربية</p>

        <div className="tabs" role="tablist">
          {[
            ['flashcards', 'Flashcards'],
            ['quiz', 'Quiz'],
            ['list', 'Ordlista'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Laddar ordlista…</p>
        ) : (
          <>
            {tab === 'flashcards' && cardWord && (
              <div style={{ textAlign: 'center' }}>
                <p>
                  {current + 1} / {words.length}
                </p>
                <div
                  className={`flashcard${flipped ? ' flipped' : ''}`}
                  onClick={() => setFlipped(!flipped)}
                  onKeyDown={(e) => e.key === 'Enter' && setFlipped(!flipped)}
                  role="button"
                  tabIndex={0}
                  aria-label="Vänd flashcard"
                >
                  <div className="flashcard-inner">
                    <div className="flashcard-front">
                      <h2>{cardWord.sv}</h2>
                    </div>
                    <div className="flashcard-back">
                      <p>{cardWord.en}</p>
                      <p className="arabic" dir="rtl">
                        {cardWord.ar}
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                  <button type="button" className="btn secondary" onClick={() => showCard((current - 1 + words.length) % words.length)}>
                    ← Föregående
                  </button>
                  <button type="button" className="btn secondary" onClick={shuffleCards}>
                    Blanda
                  </button>
                  <button type="button" className="btn secondary" onClick={() => showCard((current + 1) % words.length)}>
                    Nästa →
                  </button>
                </div>
              </div>
            )}

            {tab === 'quiz' && question && (
              <div className="quiz-area">
                <h2>Vad betyder ordet?</h2>
                <p style={{ fontSize: 28, fontWeight: 700 }}>{question.word.sv}</p>
                <div className="quiz-choices">
                  {question.choices.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      dir={supportLang === 'ar' ? 'rtl' : undefined}
                      className={feedback && w.id === question.word.id ? 'correct' : feedback && feedback.includes(w[supportLang]) ? 'wrong' : ''}
                      disabled={!!feedback}
                      onClick={() => {
                        const ok = w.id === question.word.id;
                        setFeedback(
                          ok
                            ? `Rätt! ${question.word.ar}`
                            : `Inte rätt. Svaret är: ${question.word.en} · ${question.word.ar}`,
                        );
                      }}
                    >
                      {w[supportLang]}
                    </button>
                  ))}
                </div>
                {feedback && <p style={{ fontWeight: 700, marginTop: 12 }}>{feedback}</p>}
                <button type="button" className="btn" style={{ marginTop: 16 }} onClick={() => newQuestion()}>
                  Nästa fråga
                </button>
              </div>
            )}

            {tab === 'list' && (
              <>
                <input
                  type="search"
                  placeholder="Sök ord…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', maxWidth: 400, padding: 12, marginBottom: 16 }}
                  aria-label="Sök ordlista"
                />
                <p>{filtered.length} ord</p>
                <div className="verbs-table-wrap">
                  <table className="verbs-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Svenska</th>
                        <th>English</th>
                        <th>العربية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((w) => (
                        <tr key={w.id}>
                          <td>{w.id}</td>
                          <td>
                            <b>{w.sv}</b>
                          </td>
                          <td>{w.en}</td>
                          <td className="arabic" dir="rtl">
                            {w.ar}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
