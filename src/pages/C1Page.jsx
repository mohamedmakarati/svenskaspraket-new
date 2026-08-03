import { Link } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import { SiteFooter } from '@/components/Layout';

export default function C1Page() {
  return (
    <>
      <PageSeo pageKey="c1" />
      <header className="public-nav wrap">
        <Link to="/" className="brand">
          🇸🇪 Svenska<b>Språket</b>
        </Link>
        <nav className="links">
          <Link to="/verbs">A1</Link>
          <Link to="/verbs-a2">A2</Link>
          <Link to="/verbs-b1b2">B1–B2</Link>
          <Link to="/c1" aria-current="page">
            C1
          </Link>
          <Link to="/">Hem</Link>
        </nav>
      </header>
      <main className="wrap section">
        <div className="tag">C1 · KOMMER SNART</div>
        <h1>Avancerad svenska (C1) – kommer snart</h1>
        <p className="lead">
          Vi arbetar på originellt C1-material: avancerade texter, idiom, akademiskt språk och
          uttrycksfulla övningar. Till dess kan du träna verb, ordförråd och grammatik på A1–B2.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
          <Link className="btn" to="/verbs-b1b2">
            B1–B2 verb
          </Link>
          <Link className="btn secondary" to="/vocabulary">
            Ordförråd
          </Link>
          <Link className="btn secondary" to="/lessons">
            Grammatik B1–B2
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
