import { Link } from 'react-router-dom';
import SeoHead from '@/components/SeoHead';

export default function NotFoundPage() {
  return (
    <>
      <SeoHead title="Sidan hittades inte | SvenskaSpråket" noindex hreflang={false} />
      <main className="not-found">
        <h1>404</h1>
        <p>Sidan du söker finns inte.</p>
        <Link className="btn" to="/">
          Tillbaka till startsidan
        </Link>
      </main>
    </>
  );
}
