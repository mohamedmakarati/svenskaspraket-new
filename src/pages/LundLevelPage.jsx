import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import PublicNav, { SiteFooter } from '@/components/Layout';
import RtlLayout from '@/hooks/useRtl';
import {
  LUND_COURSE_URL,
  LUND_LEVEL_UI,
  getLundLevel,
  lundLevelCopy,
} from '@/data/lundLevels';
import { LundLevelStudyLinks } from '@/components/LundLevelsSection';

function resolveLang(searchParams) {
  const q = searchParams.get('lang');
  if (q === 'en' || q === 'ar') return q;
  return 'sv';
}

export default function LundLevelPage() {
  const { levelId } = useParams();
  const [searchParams] = useSearchParams();
  const lang = resolveLang(searchParams);
  const level = getLundLevel(levelId);
  const ui = LUND_LEVEL_UI[lang] ?? LUND_LEVEL_UI.sv;
  const copy = level ? lundLevelCopy(level, lang) : null;
  const seoKey = level ? `lundLevel${level.id}` : 'notFound';

  if (!level || !copy) {
    return (
      <RtlLayout lang={lang}>
        <PageSeo pageKey="notFound" />
        <PublicNav lang={lang === 'sv' ? 'sv' : undefined} />
        <main className="wrap section">
          <h1>404</h1>
          <Link to="/">{ui.backHome}</Link>
        </main>
        <SiteFooter />
      </RtlLayout>
    );
  }

  const intro = ui.levelPageIntro.replace('{{n}}', String(level.id));
  const homeLink = lang === 'en' ? '/en' : lang === 'ar' ? '/ar' : '/';

  return (
    <RtlLayout lang={lang}>
      <PageSeo pageKey={seoKey} />
      <PublicNav lang={lang === 'sv' ? 'sv' : undefined} />
      <main className="wrap section lund-level-page" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to={homeLink}>{ui.backHome}</Link>
          <span aria-hidden="true"> / </span>
          <span>{copy.title}</span>
        </nav>

        <div className="tag">{LUND_LEVEL_UI[lang].sectionTag}</div>
        <h1>{copy.title}</h1>
        <p className="lead">{intro}</p>
        <p>{copy.summary}</p>

        <dl className="lund-proficiency lund-proficiency--page">
          <div>
            <dt>{ui.writtenLabel}</dt>
            <dd>{copy.written}</dd>
          </div>
          <div>
            <dt>{ui.oralLabel}</dt>
            <dd>{copy.oral}</dd>
          </div>
        </dl>

        <LundLevelStudyLinks level={level} lang={lang} />

        <aside className="external-source-block" aria-labelledby="lund-level-source">
          <h2 id="lund-level-source">{ui.externalLink}</h2>
          <p>
            <a href={LUND_COURSE_URL} target="_blank" rel="noopener external">
              {ui.externalLink} →
            </a>
          </p>
          <p className="external-source-block__note">{ui.externalNote}</p>
        </aside>
      </main>
      <SiteFooter />
    </RtlLayout>
  );
}
