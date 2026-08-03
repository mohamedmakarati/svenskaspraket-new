import { Link } from 'react-router-dom';
import {
  LUND_COURSE_URL,
  LUND_LEVEL_UI,
  LUND_LEVELS,
  lundLevelCopy,
  lundLevelPath,
  lundLinkLabel,
  lundLinkTo,
} from '@/data/lundLevels';

export default function LundLevelsSection({ lang = 'sv', id = 'lund-niva' }) {
  const ui = LUND_LEVEL_UI[lang] ?? LUND_LEVEL_UI.sv;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <section id={id} className="section alt wrap lund-levels-section" lang={lang} dir={dir} aria-labelledby={`${id}-title`}>
      <div className="tag">{ui.sectionTag}</div>
      <h2 id={`${id}-title`}>{ui.sectionTitle}</h2>
      <p className="lead">{ui.sectionIntro}</p>

      <div className="notice lund-cefr-notice" role="note">
        <strong>{ui.cefrHeading}</strong>
        <p>{ui.cefrNote}</p>
      </div>

      <ul className="lund-levels-grid" role="list">
        {LUND_LEVELS.map((level) => {
          const copy = lundLevelCopy(level, lang);
          return (
            <li key={level.id}>
              <article className="lund-level-card">
                <header>
                  <span className="lund-level-card__num" aria-hidden="true">
                    {level.id}
                  </span>
                  <h3>
                    <Link to={lundLevelPath(level.id)}>{copy.title}</Link>
                  </h3>
                </header>
                <p>{copy.summary}</p>
                <dl className="lund-proficiency">
                  <div>
                    <dt>{ui.writtenLabel}</dt>
                    <dd>{copy.written}</dd>
                  </div>
                  <div>
                    <dt>{ui.oralLabel}</dt>
                    <dd>{copy.oral}</dd>
                  </div>
                </dl>
                <Link className="btn secondary" to={lundLevelPath(level.id)}>
                  {ui.readMore} →
                </Link>
              </article>
            </li>
          );
        })}
      </ul>

      <aside className="external-source-block" aria-labelledby={`${id}-source`}>
        <h3 id={`${id}-source`}>{ui.externalLink}</h3>
        <p>
          <a href={LUND_COURSE_URL} target="_blank" rel="noopener external">
            {ui.externalLink} →
          </a>
        </p>
        <p className="external-source-block__note">{ui.externalNote}</p>
      </aside>
    </section>
  );
}

export function LundLevelStudyLinks({ level, lang = 'sv' }) {
  const ui = LUND_LEVEL_UI[lang] ?? LUND_LEVEL_UI.sv;
  if (!level?.links?.length) return null;

  return (
    <section className="lund-study-links" aria-labelledby="lund-study-heading">
      <h2 id="lund-study-heading">{ui.studyMaterials}</h2>
      <ul className="lund-study-links__list">
        {level.links.map((item) => (
          <li key={item.sv.to}>
            <Link className="btn secondary" to={lundLinkTo(item, lang)}>
              {lundLinkLabel(item, lang)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
