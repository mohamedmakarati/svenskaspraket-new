import { Link, useLocation } from 'react-router-dom';

export default function PublicNav({ lang = 'sv' }) {
  const location = useLocation();
  const isHome = lang === 'sv';

  return (
    <header className="public-nav wrap">
      <Link to="/" className="brand">
        🇸🇪 Svenska<b>Språket</b>
      </Link>
      {isHome && (
        <nav className="links" aria-label="Sidnavigering">
          <a href="#materials">Verb & Quizlet</a>
          <a href="#lund-niva">Lund-nivåer</a>
        </nav>
      )}
      <nav className="lang-switch" aria-label="Välj språk">
        <Link to="/" lang="sv" className={location.pathname === '/' ? 'active' : ''} aria-current={location.pathname === '/' ? 'page' : undefined}>
          SV
        </Link>
        <Link to="/en" lang="en" className={location.pathname === '/en' ? 'active' : ''} aria-current={location.pathname === '/en' ? 'page' : undefined}>
          EN
        </Link>
        <Link to="/ar" lang="ar" dir="rtl" className={location.pathname === '/ar' ? 'active' : ''} aria-current={location.pathname === '/ar' ? 'page' : undefined}>
          العربية
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer wrap">
      <b>SvenskaSpråket</b>
      <span>© 2026 svenskaspraket.com</span>
    </footer>
  );
}

export function FabLinks() {
  return (
    <div className="fab" aria-label="Snabblänkar">
      <Link to="/vocabulary" className="vocab">
        <span aria-hidden="true">🎴 </span>805 ord
      </Link>
      <Link to="/verbs" className="verbs">
        <span aria-hidden="true">📘 </span>131 A1-verb
      </Link>
      <Link to="/lessons-a1" className="grammar-a1">
        <span aria-hidden="true">📚 </span>Grammatik A1
      </Link>
      <Link to="/lessons" className="grammar-b1">
        <span aria-hidden="true">📖 </span>Grammatik B1–B2
      </Link>
    </div>
  );
}
