import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '@/components/SeoHead';
import PublicNav, { SiteFooter, FabLinks } from '@/components/Layout';
import { SITE_URL } from '@/lib/supabase';

const WORDS = [
  ['lagom', 'بالقدر المناسب', 'Kaffet är lagom varmt.'],
  ['fika', 'استراحة قهوة', 'Ska vi ta en fika?'],
  ['längta', 'يشتاق', 'Jag längtar till sommaren.'],
];

export default function HomePage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [activeLevel, setActiveLevel] = useState(null);

  const word = WORDS[wordIndex];

  function handleWordClick() {
    if (!shown) setShown(true);
    else {
      const next = (wordIndex + 1) % WORDS.length;
      setWordIndex(next);
      setShown(false);
    }
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: 'SvenskaSpråket',
        description: 'Gratis svensk språkträning från A1 till B2 med stöd på engelska och arabiska.',
        inLanguage: ['sv', 'en', 'ar'],
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: 'Lär dig svenska A1-B2 gratis',
        inLanguage: 'sv',
      },
    ],
  };

  return (
    <>
      <SeoHead
        title="Lär dig svenska A1-B2 gratis | SvenskaSpråket"
        description="Lär dig svenska gratis från A1 till B2. Träna 465 verb, 805 ord, svensk grammatik, flashcards och quiz med stöd på engelska och arabiska."
        canonical="/"
        structuredData={structuredData}
      />
      <a href="#main" className="skip-link">
        Hoppa till innehåll
      </a>
      <PublicNav />
      <main id="main">
        <section className="hero-home wrap">
          <div>
            <div className="tag">✦ SVENSKA, STEG FÖR STEG</div>
            <h1>
              Lär dig svenska.
              <br />
              <em>På riktigt.</em>
            </h1>
            <p className="lead">
              En modern och enkel väg till bättre svenska. Träna grammatik, ord, uttal och skrivande – med stöd på
              arabiska och engelska.
            </p>
            <p>
              <a className="btn" href="#lar">
                Börja lära dig →
              </a>
            </p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="word-card">
              <small>
                DAGENS ORD · {wordIndex + 1} / {WORDS.length}
              </small>
              <h2>{word[0]}</h2>
              <small>{word[2]}</small>
              <div className="translation" aria-live="polite">
                {shown ? word[1] : 'Vad betyder ordet?'}
              </div>
              <button type="button" className="btn" style={{ width: '100%' }} onClick={handleWordClick}>
                {shown ? 'Nästa ord →' : 'Visa på arabiska'}
              </button>
            </div>
          </div>
        </section>

        <section id="lar" className="section wrap">
          <div className="tag">ALLT DU BEHÖVER</div>
          <h2>En smartare väg till svenska</h2>
          <div className="grid-4">
            {[
              ['Aa', 'Grammatik', 'Tydliga regler och exempel från A1 till C1.'],
              ['Hej', 'Ordförråd', 'Vanliga ord med svenska, arabiska och engelska.'],
              ['▶', 'Uttal', 'Lyssna, härma och träna svenska ljud.'],
              ['✎', 'Skrivhjälp', 'Praktiska mallar för studier, arbete och vardag.'],
            ].map(([ico, title, text]) => (
              <article key={title} className="feature-card">
                <div className="ico">{ico}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="ovningar" className="section wrap">
          <div className="steps-strip">
            {[
              ['01', 'Lär dig', 'Korta, tydliga lektioner anpassade till din nivå.'],
              ['02', 'Öva aktivt', 'Frågor och repetition gör att kunskapen fastnar.'],
              ['03', 'Följ framsteg', 'Bygg en studievana och fortsätt där du slutade.'],
            ].map(([num, title, text]) => (
              <div key={num} className="step">
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="niva" className="section wrap">
          <div className="levels-box">
            <div>
              <div className="tag">DIN SVENSKA RESA BÖRJAR HÄR</div>
              <h2>Vilken nivå passar dig?</h2>
              <p>Välj nivå för att förbereda din studieplan.</p>
            </div>
            <div className="level-choices" role="group" aria-label="Välj nivå">
              {[
                ['A1 Nybörjare', '/verbs'],
                ['A2 Grundläggande', '/verbs-a2'],
                ['B1 Medel', '/verbs-b1b2'],
                ['B2 Avancerad', '/verbs-b1b2'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  to={href}
                  className={activeLevel === label ? 'active' : ''}
                  onClick={() => setActiveLevel(label)}
                  style={{ textDecoration: 'none', textAlign: 'center' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="verb" className="section alt wrap">
          <div className="tag">A1–B2 · SVENSKA VERB</div>
          <h2>Lär dig svenska verb på tre nivåer</h2>
          <p>
            Träna 131 A1-verb, 199 A2-verb och 135 avancerade B1–B2-verb. Alla listor visar full böjning, visuella
            minnesbilder samt betydelser på engelska och arabiska.
          </p>
          <div className="grid-4" style={{ margin: '24px 0' }}>
            {[
              ['AR', 'arbeta', 'arbetar · arbetade · arbetat', 'work · يعمل'],
              ['SK', 'skriva', 'skriver · skrev · skrivit', 'write · يكتب'],
              ['GÅ', 'gå', 'går · gick · gått', 'go/walk · يذهب/يمشي'],
              ['VA', 'vara', 'är · var · varit', 'be · يكون'],
            ].map(([ico, inf, forms, trans]) => (
              <article key={inf} className="feature-card">
                <div className="ico">{ico}</div>
                <h3>{inf}</h3>
                <p>{forms}</p>
                <small>{trans}</small>
              </article>
            ))}
          </div>
          <p style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link className="btn" to="/verbs">
              A1 · 131 verb
            </Link>
            <Link className="btn" to="/verbs-a2">
              A2 · 199 verb
            </Link>
            <Link className="btn" to="/verbs-b1b2">
              B1–B2 · 135 verb
            </Link>
          </p>
        </section>

        <section id="ordforrad" className="section wrap">
          <div className="tag">NYTT · INTERAKTIVT ORDFÖRRÅD</div>
          <h2>Träna 805 svenska ord och uttryck</h2>
          <p>
            Studera med digitala flashcards, självrättande quiz och en sökbar ordlista på svenska, engelska och
            arabiska.
          </p>
          <div className="notice" style={{ margin: '24px 0' }}>
            <strong>En resurs skapad av studenter för studenter</strong>
            <p style={{ margin: '8px 0 0' }}>
              Materialet har samlats in och sammanställts av studenter. Resursen är till för dig som studerar eller vill
              förbereda dig för <em>Svenska som främmande språk</em> vid Lunds universitet.
            </p>
          </div>
          <div className="grid-4">
            {[
              ['805', 'Komplett ordlista', 'Alla orden från ditt Quizlet-material.'],
              ['↻', 'Flashcards', 'Vänd, blanda och repetera i din egen takt.'],
              ['✓', 'Quiz', 'Välj rätt betydelse och få svar direkt.'],
              ['ع', 'Tre språk', 'Svenska · English · العربية'],
            ].map(([ico, title, text]) => (
              <article key={title} className="feature-card">
                <div className="ico">{ico}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p style={{ marginTop: 24 }}>
            <Link className="btn" to="/vocabulary">
              Öppna 805 ord →
            </Link>
          </p>
        </section>

        <section id="resurser" className="section alt wrap">
          <div className="tag">EXTERN SPRÅKRESURS</div>
          <h2>Fördjupa dig med SALDO</h2>
          <p>
            SALDO från Språkbanken Text vid Göteborgs universitet är ett semantiskt och morfologiskt lexikon för modernt
            svenskt skriftspråk.
          </p>
          <p>
            <a
              className="btn"
              href="https://spraakbanken.gu.se/resurser/saldo"
              target="_blank"
              rel="noopener external"
            >
              Öppna SALDO hos Språkbanken →
            </a>
          </p>
          <small>
            SALDO är en extern resurs från Språkbanken Text, Göteborgs universitet. SvenskaSpråket är en fristående
            studentresurs.
          </small>
        </section>
      </main>
      <SiteFooter />
      <FabLinks />
    </>
  );
}
