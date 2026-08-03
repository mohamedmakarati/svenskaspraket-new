import { Link } from 'react-router-dom';

const COPY = {
  sv: {
    tag: 'VERB & QUIZLET',
    title: 'Verb och Quizlet-material',
    intro: 'Alla övningssidor samlade på ett ställe — klicka för att öppna listor, flashcards och quiz.',
    open: 'Öppna →',
    items: [
      { to: '/verbs', label: 'A1-verb', count: '131', desc: 'Grundläggande verb med böjning, bilder och översättning.' },
      { to: '/verbs-a2', label: 'A2-verb', count: '199', desc: 'Utökade verb för vardag och studier.' },
      { to: '/verbs-b1b2', label: 'B1–B2-verb', count: '135', desc: 'Oregelbundna och avancerade verb.' },
      { to: '/vocabulary', label: 'Quizlet-ordförråd', count: '805', desc: 'Sökbar ordlista med flashcards och quiz.' },
      { to: '/lessons-b2c1', label: 'Rivstart B2/C1', count: '162', desc: 'Ord och verb från kapitel 1–3 m.m. (AnnaRansheim).' },
    ],
  },
  en: {
    tag: 'VERBS & QUIZLET',
    title: 'Verbs and Quizlet materials',
    intro: 'All practice pages in one place — open lists, flashcards and quizzes.',
    open: 'Open →',
    items: [
      { to: '/verbs?lang=en', label: 'A1 verbs', count: '131', desc: 'Core verbs with conjugation, images and translations.' },
      { to: '/verbs-a2?lang=en', label: 'A2 verbs', count: '199', desc: 'Expanded verbs for daily life and study.' },
      { to: '/verbs-b1b2?lang=en', label: 'B1–B2 verbs', count: '135', desc: 'Irregular and advanced verb forms.' },
      { to: '/vocabulary?lang=en', label: 'Quizlet vocabulary', count: '805', desc: 'Searchable word list with flashcards and quiz.' },
      { to: '/lessons-b2c1', label: 'Rivstart B2/C1', count: '162', desc: 'Words and verbs from chapters 1–3 and more (AnnaRansheim).' },
    ],
  },
  ar: {
    tag: 'الأفعال و Quizlet',
    title: 'الأفعال ومواد Quizlet',
    intro: 'جميع صفحات التدريب في مكان واحد — بطاقات واختبارات وقوائم.',
    open: 'افتح ←',
    items: [
      { to: '/verbs?lang=ar', label: 'أفعال A1', count: '131', desc: 'أفعال أساسية مع التصريف والصور والترجمة.' },
      { to: '/verbs-a2?lang=ar', label: 'أفعال A2', count: '199', desc: 'أفعال موسّعة للحياة اليومية والدراسة.' },
      { to: '/verbs-b1b2?lang=ar', label: 'أفعال B1–B2', count: '135', desc: 'أفعال شاذة ومتقدمة.' },
      { to: '/vocabulary?lang=ar', label: 'مفردات Quizlet', count: '805', desc: 'قائمة قابلة للبحث مع بطاقات واختبارات.' },
      { to: '/lessons-b2c1', label: 'Rivstart B2/C1', count: '162', desc: 'كلمات وأفعال من الفصول 1–3 وغيرها (AnnaRansheim).' },
    ],
  },
};

export default function StudyMaterialsSection({ lang = 'sv', id = 'materials' }) {
  const ui = COPY[lang] ?? COPY.sv;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <section id={id} className="section wrap study-materials" lang={lang} dir={dir}>
      <div className="tag">{ui.tag}</div>
      <h2>{ui.title}</h2>
      <p className="study-materials__intro">{ui.intro}</p>
      <ul className="study-materials__list">
        {ui.items.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="study-materials__card">
              <span className="study-materials__count">{item.count}</span>
              <span className="study-materials__body">
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </span>
              <span className="study-materials__action">{ui.open}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
