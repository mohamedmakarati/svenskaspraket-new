import { Link } from 'react-router-dom';
import { PageSeo } from '@/components/SeoHead';
import RtlLayout from '@/hooks/useRtl';
import LundLevelsSection from '@/components/LundLevelsSection';

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
        <section className="lang-hero">
          <div className="wrap">
            <div className="tag">السويدية خطوة بخطوة</div>
            <h1>تعلم اللغة السويدية مجاناً – من A1 إلى C1</h1>
            <p className="lead">
              تعلم اللغة السويدية مجاناً من A1 إلى C1. تدرب على الأفعال والمفردات والقواعد والبطاقات والاختبارات مع
              شرح باللغة العربية.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
              <Link className="btn" to="/verbs?lang=ar">
                ابدأ بأفعال A1 ←
              </Link>
              <Link className="btn secondary" to="/vocabulary?lang=ar">
                افتح 805 كلمات
              </Link>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <div className="tag">اختر مسار الدراسة</div>
            <h2>مواد سويدية–عربية</h2>
            <div className="grid-3">
              <article className="card">
                <div className="ico" style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', background: '#e8f2fe', borderRadius: 10, color: 'var(--blue)', fontWeight: 900 }}>
                  465
                </div>
                <h3>الأفعال السويدية</h3>
                <p>تعلّم المضارع والماضي وصيغة supinum والأمر مع المعنى بالعربية وبطاقات ذاكرة مصورة.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link className="btn" to="/verbs?lang=ar">
                    A1
                  </Link>
                  <Link className="btn secondary" to="/verbs-a2?lang=ar">
                    A2
                  </Link>
                  <Link className="btn secondary" to="/verbs-b1b2?lang=ar">
                    B1–B2
                  </Link>
                  <Link className="btn secondary" to="/c1">
                    C1
                  </Link>
                </div>
              </article>
              <article className="card">
                <div className="ico" style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', background: '#e8f2fe', borderRadius: 10, color: 'var(--blue)', fontWeight: 900 }}>
                  805
                </div>
                <h3>المفردات والاختبارات</h3>
                <p>ابحث عن الكلمات السويدية، واعرض الترجمة العربية والإنجليزية، واستخدم البطاقات والاختبارات.</p>
                <Link className="btn" to="/vocabulary?lang=ar">
                  تعلّم المفردات ←
                </Link>
              </article>
              <article className="card">
                <div className="ico" style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', background: '#e8f2fe', borderRadius: 10, color: 'var(--blue)', fontWeight: 900 }}>
                  Aa
                </div>
                <h3>قواعد اللغة السويدية</h3>
                <p>تدرّب على الضمائر الشخصية في A1، أو على الأسماء والكلمات المركبة والملكية في B1–B2.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link className="btn" to="/lessons-a1?lang=ar">
                    قواعد A1 ←
                  </Link>
                  <Link className="btn secondary" to="/lessons?lang=ar">
                    قواعد B1–B2
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>
        <LundLevelsSection lang="ar" />
        <section className="section alt">
          <div className="wrap">
            <div className="notice">
              <strong>مواد جمعها الطلاب لمساعدة الطلاب</strong>
              <p>
                جُمعت هذه المواد ونُظّمت بواسطة طلاب. وهي مخصصة لمن يدرس أو يريد الاستعداد لدراسة{' '}
                <em>السويدية كلغة أجنبية</em> في جامعة لوند.
              </p>
            </div>
            <div className="stats-row">
              {[
                ['131', 'فعل A1'],
                ['199', 'فعل A2'],
                ['135', 'فعل B1–B2'],
                ['805', 'كلمات'],
              ].map(([n, label]) => (
                <div key={label} className="stat-box">
                  <strong>{n}</strong>
                  {label}
                </div>
              ))}
            </div>
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
