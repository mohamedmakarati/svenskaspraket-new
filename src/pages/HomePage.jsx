import { Link } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import PublicNav, { SiteFooter, FabLinks } from '@/components/Layout';
import LundLevelsSection from '@/components/LundLevelsSection';
import StudyMaterialsSection from '@/components/StudyMaterialsSection';

export default function HomePage() {
  return (
    <>
      <PageSeo pageKey="home" />
      <a href="#main" className="skip-link">
        Hoppa till innehåll
      </a>
      <PublicNav />
      <main id="main">
        <section className="hero-simple wrap">
          <div className="tag">✦ SVENSKA, STEG FÖR STEG</div>
          <h1>Lär dig svenska gratis – från A1 till C1</h1>
          <p className="lead">
            Träna verb, Quizlet-ordförråd och grammatik med stöd på arabiska och engelska.
          </p>
          <p className="hero-simple__actions">
            <a className="btn" href="#materials">
              Se alla övningar →
            </a>
            <Link className="btn secondary" to="/lessons-a1">
              Grammatik A1
            </Link>
          </p>
        </section>

        <StudyMaterialsSection lang="sv" />

        <LundLevelsSection lang="sv" />

        <section className="section alt wrap">
          <div className="notice">
            <strong>En resurs skapad av studenter för studenter</strong>
            <p>
              Materialet har samlats in och sammanställts av studenter. Resursen är till för dig som studerar eller vill
              förbereda dig för <em>Svenska som främmande språk</em> vid Lunds universitet.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FabLinks />
    </>
  );
}
