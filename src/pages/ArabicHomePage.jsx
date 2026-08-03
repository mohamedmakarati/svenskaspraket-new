import { Link } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import RtlLayout from '@/hooks/useRtl';
import LundLevelsSection from '@/components/LundLevelsSection';
import StudyMaterialsSection from '@/components/StudyMaterialsSection';

export default function ArabicHomePage() {
  return (
    <RtlLayout lang="ar">
      <PageSeo pageKey="ar" />
      <header className="public-nav wrap">
        <Link to="/" className="brand">
          🇸🇪 Svenska<b>Språket</b>
        </Link>
        <nav className="lang-switch" aria-label="اختر اللغة">
          <Link to="/" lang="sv">
            Svenska
          </Link>
          <Link to="/en" lang="en">
            English
          </Link>
          <Link to="/ar" className="active" aria-current="page">
            العربية
          </Link>
        </nav>
      </header>
      <main>
        <section className="hero-simple wrap">
          <div className="tag">السويدية خطوة بخطوة</div>
          <h1>تعلم اللغة السويدية مجاناً – من A1 إلى C1</h1>
          <p className="lead">
            تدرب على الأفعال ومفردات Quizlet والقواعد مع شرح بالعربية والإنجليزية.
          </p>
          <p className="hero-simple__actions">
            <a className="btn" href="#materials">
              عرض جميع المواد ←
            </a>
            <Link className="btn secondary" to="/lessons-a1?lang=ar">
              قواعد A1
            </Link>
          </p>
        </section>

        <StudyMaterialsSection lang="ar" />

        <LundLevelsSection lang="ar" />

        <section className="section alt wrap">
          <div className="notice">
            <strong>مواد جمعها الطلاب لمساعدة الطلاب</strong>
            <p>
              جُمعت هذه المواد ونُظّمت بواسطة طلاب. وهي مخصصة لمن يدرس أو يريد الاستعداد لدراسة{' '}
              <em>السويدية كلغة أجنبية</em> في جامعة لوند.
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
