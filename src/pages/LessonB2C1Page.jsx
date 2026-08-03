import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import { SiteFooter } from '@/components/Layout';
import { B2C1_LESSON, getB2C1Stats, flattenB2C1Entries } from '@/data/lesson-b2c1';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function LessonB2C1Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const supportLang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';

  const allEntries = useMemo(() => flattenB2C1Entries(), []);
  const stats = useMemo(() => getB2C1Stats(), []);
  const [search, setSearch] = useState('');
  const [setFilter, setSetFilter] = useState('all');
  const [tab, setTab] = useState('flashcards');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allEntries.filter(
      (e) =>
        (setFilter === 'all' || e.setId === setFilter) &&
        (!q || `${e.sv} ${e.en} ${e.ar}`.toLowerCase().includes(q)),
    );
  }, [allEntries, search, setFilter]);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [search, setFilter]);

  useEffect(() => {
    if (index >= filtered.length) setIndex(0);
  }, [filtered.length, index]);

  useEffect(() => {
    if (filtered.length) newQuestion(filtered);
    else setQuestion(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.map((e) => e.id).join(',')]);

  function newQuestion(pool = filtered) {
    if (!pool.length) {
      setQuestion(null);
      return;
    }
    const answer = pick(pool);
    const choices = [
      answer,
      ...pool.filter((x) => x.id !== answer.id).sort(() => Math.random() - 0.5).slice(0, 3),
    ].sort(() => Math.random() - 0.5);
    setQuestion({ answer, choices });
    setFeedback('');
    setSelectedId(null);
  }

  const card = filtered[index];

  function shuffleCards() {
    if (!filtered.length) return;
    setIndex(Math.floor(Math.random() * filtered.length));
    setFlipped(false);
  }

  return (
    <>
      <PageSeo pageKey="lessonB2C1" />
      <header className="public-nav wrap">
        <Link to="/" className="brand">
          🇸🇪 Svenska<b>Språket</b>
        </Link>
        <nav className="links">
          <Link to="/lessons">Grammatik B1–B2</Link>
          <Link to="/verbs-b1b2">B1–B2 verb</Link>
          <Link to="/vocabulary">Ordförråd</Link>
          <Link to="/">Hem</Link>
        </nav>
      </header>

      <section className="b2c1-hero">
        <div className="wrap">
          <div className="tag">B2–C1 · SVENSKA / ENGLISH / العربية</div>
          <h1>Ord och verb från kapitel 1–3</h1>
          <p className="lead">
            Studera samtliga {stats.sourceEntries} poster från de {B2C1_LESSON.sets.length} källuppsättningarna. Upprepade
            poster (t.ex. <em>uppskattar</em>, <em>förknippar</em>, <em>uppger</em>) finns kvar så att ingen källpost
            saknas.
          </p>
          <aside className="b2c1-credit" role="note">
            <strong>Källkredit:</strong> {B2C1_LESSON.creatorCredit}. {B2C1_LESSON.disclaimer}
          </aside>
        </div>
      </section>

      <main className="wrap section b2c1-lesson">
        <div className="controls vocabulary-controls">
          <input
            type="search"
            placeholder="Sök på svenska, engelska eller arabiska…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Sök i ordlistan"
          />
          <select value={setFilter} onChange={(e) => setSetFilter(e.target.value)} aria-label="Filtrera uppsättning">
            <option value="all">Båda uppsättningarna</option>
            {B2C1_LESSON.sets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <div className="lang-toggle">
            <button
              type="button"
              className={supportLang === 'en' ? 'active' : ''}
              onClick={() => setSearchParams({ lang: 'en' })}
            >
              English
            </button>
            <button
              type="button"
              className={supportLang === 'ar' ? 'active' : ''}
              onClick={() => setSearchParams({ lang: 'ar' })}
            >
              العربية
            </button>
          </div>
        </div>

        <p className="b2c1-stats">
          {filtered.length} av {stats.sourceEntries} källposter visas · {stats.uniqueSwedish} unika svenska poster
        </p>

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

        {filtered.length === 0 && (
          <p className="notice">Inga träffar — prova ett annat sökord eller filter.</p>
        )}

        {tab === 'flashcards' && card && (
          <div style={{ textAlign: 'center' }}>
            <p>
              {index + 1} / {filtered.length} · {card.setTitle}
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
                  <h2>{card.sv}</h2>
                </div>
                <div className="flashcard-back">
                  <p>{card.en}</p>
                  <p className="arabic" dir="rtl">
                    {card.ar || card.en}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setIndex((index - 1 + filtered.length) % filtered.length);
                  setFlipped(false);
                }}
              >
                ← Föregående
              </button>
              <button type="button" className="btn secondary" onClick={shuffleCards}>
                Blanda
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setIndex((index + 1) % filtered.length);
                  setFlipped(false);
                }}
              >
                Nästa →
              </button>
            </div>
          </div>
        )}

        {tab === 'quiz' && question && (
          <div className="quiz-area">
            <h2>Välj rätt {supportLang === 'ar' ? 'arabisk' : 'engelsk'} betydelse</h2>
            <p style={{ fontSize: 28, fontWeight: 700 }}>{question.answer.sv}</p>
            <div className="quiz-choices">
              {question.choices.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  dir={supportLang === 'ar' ? 'rtl' : undefined}
                  className={
                    feedback && e.id === question.answer.id
                      ? 'correct'
                      : selectedId === e.id && e.id !== question.answer.id
                        ? 'wrong'
                        : ''
                  }
                  disabled={!!feedback}
                  onClick={() => {
                    setSelectedId(e.id);
                    const ok = e.id === question.answer.id;
                    setFeedback(
                      ok
                        ? `Rätt! ${question.answer.ar || question.answer.en}`
                        : `Rätt svar: ${question.answer.en}${question.answer.ar ? ` · ${question.answer.ar}` : ''}`,
                    );
                  }}
                >
                  {e[supportLang]}
                </button>
              ))}
            </div>
            {feedback && <p style={{ fontWeight: 700, marginTop: 12 }}>{feedback}</p>}
            <button type="button" className="btn" style={{ marginTop: 16 }} onClick={() => newQuestion()}>
              Ny fråga
            </button>
          </div>
        )}

        {tab === 'list' && filtered.length > 0 && (
          <div className="verbs-table-wrap">
            <table className="verbs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Svenska</th>
                  <th>English</th>
                  <th>العربية</th>
                  <th>Källa</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td>{e.n}</td>
                    <td>
                      <b>{e.sv}</b>
                    </td>
                    <td>{e.en}</td>
                    <td className="arabic" dir="rtl">
                      {e.ar || e.en}
                    </td>
                    <td>{e.setTitle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <section className="b2c1-sources section" aria-labelledby="b2c1-sources-heading">
          <h2 id="b2c1-sources-heading">Källor och erkännande</h2>
          <p>
            Originaluppsättningarnas skapare: <strong>AnnaRansheim</strong>.
          </p>
          <ul className="b2c1-sources__list">
            {B2C1_LESSON.sets.map((s) => (
              <li key={s.id}>
                <a href={s.sourceUrl} target="_blank" rel="noopener external">
                  {s.title} på Quizlet
                </a>{' '}
                — skapad av AnnaRansheim
              </li>
            ))}
          </ul>
          <p className="b2c1-sources__note">
            Betydelserna har strukturerats och kompletterats med arabisk översättning för denna oberoende
            utbildningssida. Kontrollera alltid sammanhang och böjning i en ordbok. Sidan är avsedd som{' '}
            <strong>noindex</strong> tills källmaterialets licens har verifierats.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
