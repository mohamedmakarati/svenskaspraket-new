import { useState } from 'react';

export function LanguageToggle({ supportLang, onChange }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Språkstöd">
      <button type="button" className={supportLang === 'en' ? 'active' : ''} onClick={() => onChange('en')}>
        English
      </button>
      <button type="button" className={supportLang === 'ar' ? 'active' : ''} onClick={() => onChange('ar')}>
        العربية
      </button>
    </div>
  );
}

export function GrammarQuiz({ questions }) {
  const [answered, setAnswered] = useState(new Map());

  function handleAnswer(index, choice, correct) {
    if (answered.has(index)) return;
    setAnswered(new Map(answered.set(index, { choice, correct })));
  }

  const points = [...answered.values()].filter((a) => a.correct).length;

  return (
    <div className="quiz-area">
      <h3>Snabbtest</h3>
      {questions.map((item, i) => {
        const result = answered.get(i);
        return (
          <div key={i} className="card" style={{ marginTop: 16 }}>
            <div dangerouslySetInnerHTML={{ __html: item.q.replace(/___/g, '<strong>___</strong>') }} />
            <div className="quiz-choices">
              {item.choices.map((c) => {
                let cls = '';
                if (result) {
                  if (c === item.answer) cls = 'correct';
                  else if (c === result.choice) cls = 'wrong';
                }
                return (
                  <button
                    key={c}
                    type="button"
                    className={cls}
                    disabled={!!result}
                    onClick={() => handleAnswer(i, c, c === item.answer)}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            {result && (
              <p style={{ fontWeight: 700, marginTop: 8, color: result.correct ? 'var(--ok)' : 'var(--bad)' }}>
                {result.correct ? '✓ Rätt!' : `Rätt svar: ${item.answer}`}
              </p>
            )}
          </div>
        );
      })}
      <div className="score-bar">
        Resultat: {points} av {questions.length} rätt. Du har svarat på {answered.size} frågor.
      </div>
    </div>
  );
}

export function SupportBlock({ lang, en, ar }) {
  if (lang === 'en') {
    return (
      <div className="support-block">
        <strong>English:</strong> {en}
      </div>
    );
  }
  return (
    <div className="support-block arabic" dir="rtl">
      <strong>العربية:</strong> {ar}
    </div>
  );
}

export function ExampleCard({ ex, supportLang }) {
  return (
    <div className="feature-card">
      <strong style={{ color: 'var(--blue)' }}>{ex.sv}</strong>
      {supportLang === 'en' && <div>{ex.en}</div>}
      {supportLang === 'ar' && (
        <div className="arabic" dir="rtl">
          {ex.ar}
        </div>
      )}
    </div>
  );
}
