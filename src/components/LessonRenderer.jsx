import { resolveMediaUrl } from '@/lib/media';
import {
  LanguageToggle,
  GrammarQuiz,
  SupportBlock,
  ExampleCard,
} from '@/components/GrammarQuiz';
import { ResponsiveImage } from '@/components/PublicUi';

function LessonTables({ lesson, supportLang }) {
  return (
    <>
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
    </>
  );
}

function LessonRules({ lesson }) {
  if (lesson.rules?.length > 0) {
    return lesson.rules.map((rule) => (
      <div key={rule.title ?? rule.sv} className="rule-block">
        {rule.title && <h3>{rule.title}</h3>}
        <strong>{rule.title ? 'Huvudregel:' : ''}</strong> {rule.sv}
        {rule.example && (
          <>
            <br />
            <em>{rule.example}</em>
          </>
        )}
      </div>
    ));
  }

  if (lesson.rule_sv) {
    return (
      <div className="rule-block">
        <strong>{lesson.rule_sv}</strong>
      </div>
    );
  }

  return null;
}

function LessonExamples({ lesson, supportLang, variant = 'card' }) {
  if (!lesson.examples?.length) return null;

  if (variant === 'card' && lesson.subjectTable) {
    return (
      <div className="grid-2">
        {lesson.examples.map((ex) => (
          <ExampleCard key={ex.sv} ex={ex} supportLang={supportLang} />
        ))}
      </div>
    );
  }

  return (
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
  );
}

export default function LessonRenderer({ lesson, supportLang, showQuiz = true }) {
  const featuredUrl = resolveMediaUrl(lesson.featured_image_path);

  return (
    <article className="lesson-block" id={lesson.slug ? `lesson-${lesson.slug}` : `lektion-${lesson.number}`}>
      <div className="lesson-head">
        <span className="tag">LEKTION {lesson.number}</span>
        <h2>{lesson.title_sv}</h2>
        <p>{lesson.subtitle_sv}</p>
        {featuredUrl && (
          <ResponsiveImage
            src={featuredUrl}
            alt={lesson.title_sv}
            width={640}
            height={360}
            className="lesson-featured"
          />
        )}
      </div>
      <div className="lesson-body">
        <SupportBlock lang={supportLang} en={lesson.support_en} ar={lesson.support_ar} />
        <LessonRules lesson={lesson} />
        <LessonTables lesson={lesson} supportLang={supportLang} />
        <LessonExamples
          lesson={lesson}
          supportLang={supportLang}
          variant={lesson.subjectTable ? 'card' : 'feature'}
        />
        {showQuiz && lesson.quiz?.length > 0 && <GrammarQuiz questions={lesson.quiz} />}
      </div>
    </article>
  );
}

export { LanguageToggle };
