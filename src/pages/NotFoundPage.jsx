import { Link } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';

export default function NotFoundPage() {
  return (
    <>
      <PageSeo pageKey="notFound" />
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
