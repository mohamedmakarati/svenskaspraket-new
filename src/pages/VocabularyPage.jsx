import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import { SiteFooter } from '@/components/Layout';
import { useVocabularyPage, useVocabularyCategories } from '@/hooks/usePublicData';
import {
  OfflineNotice,
  QueryError,
  EmptyState,
  TableSkeleton,
  Pagination,
} from '@/components/PublicUi';

const PAGE_SIZE = 50;

export default function VocabularyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const supportLang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tab, setTab] = useState('flashcards');
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, refetch, isFetching } = useVocabularyPage({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    level: levelFilter,
    category: categoryFilter,
  });

  const categoriesQuery = useVocabularyCategories();
  const words = data?.items ?? [];
  const total = data?.total ?? 0;
  const source = data?.source ?? 'static';

  useEffect(() => {
    setCurrent(0);
    setFlipped(false);
  }, [page, debouncedSearch, levelFilter, categoryFilter]);

  useEffect(() => {
    if (words.length) newQuestion(words);
    else setQuestion(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.map((w) => w.id).join(','), page]);

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function newQuestion(list = words) {
    if (!list.length) {
      setQuestion(null);
      return;
    }
    const q = pick(list);
    const choices = [q, ...list.filter((x) => x.id !== q.id).sort(() => Math.random() - 0.5).slice(0, 3)].sort(
      () => Math.random() - 0.5,
    );
    setQuestion({ word: q, choices });
    setFeedback('');
  }

  function showCard(idx) {
    setCurrent(idx);
    setFlipped(false);
  }

  function shuffleCards() {
    setCurrent(Math.floor(Math.random() * words.length));
    setFlipped(false);
  }

  const cardWord = words[current];
  const totalLabel = total || 805;

  return (
    <>
      <PageSeo pageKey="vocabulary" />
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
        <OfflineNotice source={source} />
        <div className="tag">B1-B2 · ORDFÖRRÅD</div>
        <h1>{totalLabel} svenska ord och uttryck</h1>
        <p>Svenska · English · العربية</p>

        <div className="controls vocabulary-controls">
          <input
            type="search"
            placeholder="Sök ord…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Sök ordlista"
          />
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filtrera CEFR-nivå"
          >
            <option value="">Alla nivåer</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filtrera kategori"
          >
            <option value="">Alla kategorier</option>
            {(categoriesQuery.data ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
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

        {isError && (
          <QueryError message={error?.message ?? 'Kunde inte ladda ordlistan.'} onRetry={() => refetch()} />
        )}

        {isLoading && <TableSkeleton rows={8} cols={4} />}

        {!isLoading && !isError && words.length === 0 && (
          <EmptyState
            title="Inga ord hittades"
            description="Prova att ändra sökord eller filter."
          />
        )}

        {!isLoading && !isError && words.length > 0 && (
          <>
            {tab === 'flashcards' && cardWord && (
              <div style={{ textAlign: 'center' }}>
                <p>
                  {current + 1} / {words.length} (sida {page})
                  {isFetching && ' · uppdaterar…'}
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
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => showCard((current - 1 + words.length) % words.length)}
                  >
                    ← Föregående
                  </button>
                  <button type="button" className="btn secondary" onClick={shuffleCards}>
                    Blanda
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => showCard((current + 1) % words.length)}
                  >
                    Nästa →
                  </button>
                </div>
                <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
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
                      className={
                        feedback && w.id === question.word.id
                          ? 'correct'
                          : feedback && feedback.includes(w[supportLang])
                            ? 'wrong'
                            : ''
                      }
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
                <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
              </div>
            )}

            {tab === 'list' && (
              <>
                <p>
                  {total} ord {isFetching && '· uppdaterar…'}
                </p>
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
                      {words.map((w, i) => (
                        <tr key={w.id ?? w.slug ?? i}>
                          <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
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
                <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
              </>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
