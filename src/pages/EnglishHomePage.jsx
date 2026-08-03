import { Link } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import RtlLayout from '@/hooks/useRtl';
import LundLevelsSection from '@/components/LundLevelsSection';
import StudyMaterialsSection from '@/components/StudyMaterialsSection';

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
        <section className="hero-simple wrap">
          <div className="tag">Swedish, step by step</div>
          <h1>Learn Swedish free – from A1 to C1</h1>
          <p className="lead">
            Study verbs, Quizlet vocabulary and grammar with English and Arabic support.
          </p>
          <p className="hero-simple__actions">
            <a className="btn" href="#materials">
              Browse all materials →
            </a>
            <Link className="btn secondary" to="/lessons-a1?lang=en">
              A1 grammar
            </Link>
          </p>
        </section>

        <StudyMaterialsSection lang="en" />

        <LundLevelsSection lang="en" />

        <section className="section alt wrap">
          <div className="notice">
            <strong>Collected by students, for students</strong>
            <p>
              This independent resource has been collected and organised by students. It is designed to help learners
              studying—or preparing to study—<em>Swedish as a Foreign Language</em> at Lund University.
            </p>
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
