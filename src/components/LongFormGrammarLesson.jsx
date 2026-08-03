import { GrammarQuiz } from '@/components/GrammarQuiz';

function LessonTable({ title, headers, rows }) {
  if (!rows?.length) return null;
  return (
    <>
      {title && <h3>{title}</h3>}
      <div className="grammar-long__table-wrap">
        <table className="lesson-table grammar-long__table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join('|')}>
                {row.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SectionBlock({ section }) {
  return (
    <section className="grammar-long__section" id={section.id}>
      <h2>{section.title}</h2>
      {section.paragraphs?.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
      {section.list && (
        <ul>
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.subsections?.map((sub) => (
        <div key={sub.title} className="grammar-long__subsection">
          <h3>{sub.title}</h3>
          {sub.paragraphs?.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
          {sub.list && (
            <ul>
              {sub.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {sub.examples?.map((ex) => (
            <p key={ex.sv} className="grammar-long__example">
              <strong>{ex.sv}</strong>
              {ex.en && <span> — {ex.en}</span>}
            </p>
          ))}
          <LessonTable {...sub.table} />
        </div>
      ))}
      <LessonTable {...section.table} />
      {section.examples?.map((ex) => (
        <p key={ex.sv} className="grammar-long__example">
          <strong>{ex.sv}</strong>
          {ex.en && <span> — {ex.en}</span>}
        </p>
      ))}
      {section.callout && (
        <div className={`grammar-long__callout grammar-long__callout--${section.callout.type ?? 'tip'}`}>
          <strong>{section.callout.label}</strong>
          <p>{section.callout.text}</p>
        </div>
      )}
    </section>
  );
}

export default function LongFormGrammarLesson({ lesson }) {
  return (
    <article className="grammar-long">
      <header className="grammar-long__header">
        <span className="tag">{lesson.level}</span>
        <h1>{lesson.title}</h1>
        <p className="grammar-long__subtitle">{lesson.subtitle}</p>
        {lesson.goals?.length > 0 && (
          <>
            <h2 className="grammar-long__goals-title">What you will learn</h2>
            <ul className="grammar-long__goals">
              {lesson.goals.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </>
        )}
      </header>

      {lesson.sections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}

      {lesson.summary?.length > 0 && (
        <section className="grammar-long__section">
          <h2>Summary</h2>
          <ul>
            {lesson.summary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.recall && (
        <section className="grammar-long__section grammar-long__callout grammar-long__callout--tip">
          <h2>{lesson.recall.question}</h2>
          <p>{lesson.recall.answer}</p>
        </section>
      )}

      {lesson.quiz?.length > 0 && (
        <div className="grammar-long__quiz">
          <GrammarQuiz questions={lesson.quiz} />
        </div>
      )}
    </article>
  );
}
