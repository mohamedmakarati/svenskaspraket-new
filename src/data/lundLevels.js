/** Lund University course SFSH60 — level structure (attribution only; original copy). */
export const LUND_COURSE_URL = 'https://www.sol.lu.se/en/course/SFSH60/';

export const LUND_LEVEL_UI = {
  sv: {
    sectionTag: 'Lunds universitet · SFSH60',
    sectionTitle: 'Svenska som främmande språk – nivå 1–8',
    sectionIntro:
      'Studienivåerna 1–8 följer kursupplägget i Svenska som främmande språk (SFSH60) vid Lunds universitet. De är ett eget progressionssystem och ska inte förväxlas med CEFR-skalan A1–C1 som används i övriga delar av SvenskaSpråket.',
    cefrHeading: 'CEFR A1–C1 på SvenskaSpråket',
    cefrNote:
      'Vår CEFR-baserade navigation (A1, A2, B1–B2, C1) är en separat väg genom verb, ordförråd och grammatik — oberoende av Lunds nivå 1–8.',
    writtenLabel: 'Skriftlig färdighet',
    oralLabel: 'Muntlig färdighet',
    readMore: 'Läs om nivån',
    externalLink: 'Se den officiella kursinformationen hos Lunds universitet',
    externalNote:
      'Nivånamn och kursstruktur hämtas från kursen SFSH60. SvenskaSpråket är en fristående studentresurs och är inte en officiell webbplats för Lunds universitet.',
    studyMaterials: 'Föreslagna övningar på SvenskaSpråket',
    backHome: 'Tillbaka till startsidan',
    levelPageIntro:
      'Denna sida beskriver studienivå {{n}} enligt kursstrukturen i SFSH60. Materialet här är kompletterande — inte en officiell kursplan.',
  },
  en: {
    sectionTag: 'Lund University · SFSH60',
    sectionTitle: 'Swedish as a Foreign Language – Levels 1–8',
    sectionIntro:
      'Levels 1–8 follow the course structure of Swedish as a Foreign Language (SFSH60) at Lund University. They are a separate progression system and should not be confused with the CEFR scale A1–C1 used elsewhere on SvenskaSpråket.',
    cefrHeading: 'CEFR A1–C1 on SvenskaSpråket',
    cefrNote:
      'Our CEFR-based navigation (A1, A2, B1–B2, C1) is a separate path through verbs, vocabulary and grammar — independent of Lund Levels 1–8.',
    writtenLabel: 'Written proficiency',
    oralLabel: 'Oral proficiency',
    readMore: 'About this level',
    externalLink: 'View official course information at Lund University',
    externalNote:
      'Level names and course structure are attributed to course SFSH60. SvenskaSpråket is an independent student resource and is not an official Lund University website.',
    studyMaterials: 'Suggested practice on SvenskaSpråket',
    backHome: 'Back to homepage',
    levelPageIntro:
      'This page describes Level {{n}} according to the SFSH60 course structure. Content here is supplementary — not an official syllabus.',
  },
  ar: {
    sectionTag: 'جامعة لوند · SFSH60',
    sectionTitle: 'السويدية كلغة أجنبية – المستويات 1–8',
    sectionIntro:
      'المستويات 1–8 تتبع هيكل مقرر السويدية كلغة أجنبية (SFSH60) في جامعة لوند. وهي نظام تقدم مستقل ولا ينبغي خلطه مع مقياس CEFR من A1 إلى C1 المستخدم في أجزاء أخرى من SvenskaSpråket.',
    cefrHeading: 'CEFR A1–C1 على SvenskaSpråket',
    cefrNote:
      'مسارنا المبني على CEFR (A1، A2، B1–B2، C1) مسار منفصل عبر الأفعال والمفردات والقواعد — مستقل عن مستويات لوند 1–8.',
    writtenLabel: 'الكفاءة الكتابية',
    oralLabel: 'الكفاءة الشفوية',
    readMore: 'عن هذا المستوى',
    externalLink: 'اطّلع على معلومات المقرر الرسمية في جامعة لوند',
    externalNote:
      'أسماء المستويات وهيكل المقرر منسوبة إلى مقرر SFSH60. SvenskaSpråket مصدر مستقل أنشأه الطلاب وليس موقعاً رسمياً لجامعة لوند.',
    studyMaterials: 'تمارين مقترحة على SvenskaSpråket',
    backHome: 'العودة إلى الصفحة الرئيسية',
    levelPageIntro:
      'تصف هذه الصحة المستوى {{n}} وفق هيكل مقرر SFSH60. المحتوى هنا تكميلي — وليس منهجاً رسمياً.',
  },
};

function link(sv, en, ar, to, langSuffix = true) {
  const qs = langSuffix ? { en: '?lang=en', ar: '?lang=ar', sv: '' } : { en: '', ar: '', sv: '' };
  return { sv: { label: sv, to: `${to}${qs.sv}` }, en: { label: en, to: `${to}${qs.en}` }, ar: { label: ar, to: `${to}${qs.ar}` } };
}

export const LUND_LEVELS = [
  {
    id: 1,
    sv: {
      title: 'Nivå 1 – Introduktion till svenska',
      summary: 'Första kontakt med svenska: ljud, alfabet och enkla fraser.',
      written: 'Skriva enkla ord och korta hälsningar; känna igen grundläggande skrifttecken.',
      oral: 'Förstå och säga enkla hälsningar; träna uttal och grundläggande lyssning.',
    },
    en: {
      title: 'Level 1 – Introduction to Swedish',
      summary: 'First contact with Swedish: sounds, alphabet and simple phrases.',
      written: 'Write simple words and short greetings; recognise basic script.',
      oral: 'Understand and say basic greetings; practise pronunciation and listening.',
    },
    ar: {
      title: 'المستوى 1 – مقدمة في اللغة السويدية',
      summary: 'أول تعرف على السويدية: الأصوات والأبجدية وعبارات بسيطة.',
      written: 'كتابة كلمات بسيطة وتحيات قصيرة؛ التعرف على الرموز الأساسية.',
      oral: 'فهم ونطق تحيات أساسية؛ التدرب على النطق والاستماع.',
    },
    links: [
      link('A1-verb', 'A1 verbs', 'أفعال A1', '/verbs'),
      link('Grammatik A1', 'A1 grammar', 'قواعد A1', '/lessons-a1'),
    ],
  },
  {
    id: 2,
    sv: {
      title: 'Nivå 2 – Grundläggande kommunikation',
      summary: 'Bygg enkla meningar och delta i korta vardagssamtal.',
      written: 'Skriva korta meddelanden om vardagliga ämnen med enkel meningsbyggnad.',
      oral: 'Presentera dig och ställa enkla frågor i lugnt tempo.',
    },
    en: {
      title: 'Level 2 – Basic communication',
      summary: 'Build simple sentences and take part in short everyday conversations.',
      written: 'Write short messages on everyday topics with basic sentence patterns.',
      oral: 'Introduce yourself and ask simple questions at a calm pace.',
    },
    ar: {
      title: 'المستوى 2 – التواصل الأساسي',
      summary: 'بناء جمل بسيطة والمشاركة في محادثات يومية قصيرة.',
      written: 'كتابة رسائل قصيرة عن موضوعات يومية بتراكيب جمل أساسية.',
      oral: 'التعريف بنفسك وطرح أسئلة بسيطة بوتيرة هادئة.',
    },
    links: [
      link('A1-verb', 'A1 verbs', 'أفعال A1', '/verbs'),
      link('Grammatik A1', 'A1 grammar', 'قواعد A1', '/lessons-a1'),
      link('Ordförråd', 'Vocabulary', 'المفردات', '/vocabulary'),
    ],
  },
  {
    id: 3,
    sv: {
      title: 'Nivå 3 – Utveckla ordförråd och grammatik',
      summary: 'Utöka ord och strukturer för tydligare uttryck i vardagen.',
      written: 'Använda vanligare grammatik i korta texter och anteckningar.',
      oral: 'Beskriva rutiner och enkla planer muntligt.',
    },
    en: {
      title: 'Level 3 – Develop vocabulary and grammar',
      summary: 'Expand words and structures for clearer everyday expression.',
      written: 'Use common grammar in short texts and notes.',
      oral: 'Describe routines and simple plans orally.',
    },
    ar: {
      title: 'المستوى 3 – تطوير المفردات والقواعد',
      summary: 'توسيع المفردات والتراكيب للتعبير أوضح في الحياة اليومية.',
      written: 'استخدام قواعد شائعة في نصوص وملاحظات قصيرة.',
      oral: 'وصف الروتين وخطط بسيطة شفهياً.',
    },
    links: [
      link('A2-verb', 'A2 verbs', 'أفعال A2', '/verbs-a2'),
      link('Ordförråd', 'Vocabulary', 'المفردات', '/vocabulary'),
      link('Grammatik A1', 'A1 grammar', 'قواعد A1', '/lessons-a1'),
    ],
  },
  {
    id: 4,
    sv: {
      title: 'Nivå 4 – Kommunicera i vardag och studier',
      summary: 'Hantera vanliga situationer i vardagen och tidiga studiemiljöer.',
      written: 'Skriva tydligare stycken om studier, boende och vardagsärenden.',
      oral: 'Delta i samtal om studier och vardag med stödord och omformulering.',
    },
    en: {
      title: 'Level 4 – Communicate in daily life and studies',
      summary: 'Handle common situations in daily life and early study contexts.',
      written: 'Write clearer paragraphs about studies, housing and everyday tasks.',
      oral: 'Join conversations about study and daily life using support words and rephrasing.',
    },
    ar: {
      title: 'المستوى 4 – التواصل في الحياة اليومية والدراسة',
      summary: 'التعامل مع مواقف يومية وبدايات بيئة الدراسة.',
      written: 'كتابة فقرات أوضح عن الدراسة والسكن والمهام اليومية.',
      oral: 'المشاركة في حوار عن الدراسة والحياة اليومية بكلمات مساعدة وإعادة صياغة.',
    },
    links: [
      link('A2-verb', 'A2 verbs', 'أفعال A2', '/verbs-a2'),
      link('Ordförråd och quiz', 'Vocabulary & quiz', 'مفردات واختبار', '/vocabulary'),
      link('Grammatik A1', 'A1 grammar', 'قواعد A1', '/lessons-a1'),
    ],
  },
  {
    id: 5,
    sv: {
      title: 'Nivå 5 – Svenska på mellannivå',
      summary: 'Uttryck åsikter och argument med större säkerhet.',
      written: 'Skriva sammanhängande texter om bekanta ämnen med varierat ordförråd.',
      oral: 'Föra längre samtal och förklara val och åsikter.',
    },
    en: {
      title: 'Level 5 – Intermediate Swedish',
      summary: 'Express opinions and arguments with growing confidence.',
      written: 'Write connected texts on familiar topics with varied vocabulary.',
      oral: 'Hold longer conversations and explain choices and opinions.',
    },
    ar: {
      title: 'المستوى 5 – السويدية على المستوى المتوسط',
      summary: 'التعبير عن الآراء والحجج بثقة متزايدة.',
      written: 'كتابة نصوص مترابطة عن موضوعات مألوفة بمفردات متنوعة.',
      oral: 'إجراء محادثات أطول وشرح الخيارات والآراء.',
    },
    links: [
      link('B1–B2 verb', 'B1–B2 verbs', 'أفعال B1–B2', '/verbs-b1b2'),
      link('Ordförråd', 'Vocabulary', 'المفردات', '/vocabulary'),
      link('Grammatik B1–B2', 'B1–B2 grammar', 'قواعد B1–B2', '/lessons'),
    ],
  },
  {
    id: 6,
    sv: {
      title: 'Nivå 6 – Mer avancerad språkfärdighet',
      summary: 'Förfinad kommunikation i sociala och akademiska sammanhang.',
      written: 'Producera strukturerade texter med tydligare stil och sammanhang.',
      oral: 'Presentera och diskutera idéer med flyt i bekanta ämnen.',
    },
    en: {
      title: 'Level 6 – More advanced language skills',
      summary: 'Refined communication in social and academic contexts.',
      written: 'Produce structured texts with clearer style and cohesion.',
      oral: 'Present and discuss ideas fluently on familiar topics.',
    },
    ar: {
      title: 'المستوى 6 – مهارات لغوية أكثر تقدماً',
      summary: 'تواصل أكثر دقة في سياقات اجتماعية وأكاديمية.',
      written: 'إنتاج نصوص منظمة بأسلوب وترابط أوضح.',
      oral: 'عرض ومناقشة أفكار بطلاقة في موضوعات مألوفة.',
    },
    links: [
      link('B1–B2 verb', 'B1–B2 verbs', 'أفعال B1–B2', '/verbs-b1b2'),
      link('Ordförråd och quiz', 'Vocabulary & quiz', 'مفردات واختبار', '/vocabulary'),
      link('Grammatik B1–B2', 'B1–B2 grammar', 'قواعد B1–B2', '/lessons'),
    ],
  },
  {
    id: 7,
    sv: {
      title: 'Nivå 7 – Akademisk och avancerad svenska',
      summary: 'Förberedelse för akademiskt skrivande och muntlig framställning.',
      written: 'Sammanfatta, jämföra och argumentera skriftligt med källor och struktur.',
      oral: 'Hålla presentationer och delta i seminarieliknande diskussioner.',
    },
    en: {
      title: 'Level 7 – Academic and advanced Swedish',
      summary: 'Preparation for academic writing and oral presentation.',
      written: 'Summarise, compare and argue in writing with structure and sources.',
      oral: 'Give presentations and join seminar-style discussions.',
    },
    ar: {
      title: 'المستوى 7 – السويدية الأكاديمية والمتقدمة',
      summary: 'الاستعداد للكتابة الأكاديمية والعرض الشفهي.',
      written: 'تلخيص ومقارنة وحجج كتابية ببنية ومصادر.',
      oral: 'إلقاء عروض والمشاركة في نقاشات شبيهة بالندوات.',
    },
    links: [
      link('B1–B2 verb', 'B1–B2 verbs', 'أفعال B1–B2', '/verbs-b1b2'),
      link('Ordförråd', 'Vocabulary', 'المفردات', '/vocabulary'),
      link('Grammatik B1–B2', 'B1–B2 grammar', 'قواعد B1–B2', '/lessons'),
    ],
  },
  {
    id: 8,
    sv: {
      title: 'Nivå 8 – Fördjupad skriftlig och muntlig svenska',
      summary: 'Självständig, nyanserad produktion på avancerad nivå.',
      written: 'Skriva välstrukturerade, nyanserade texter för studier och professionella sammanhang.',
      oral: 'Leda diskussioner och uttrycka subtila betydelseskiftningar muntligt.',
    },
    en: {
      title: 'Level 8 – Advanced written and oral Swedish',
      summary: 'Independent, nuanced production at an advanced level.',
      written: 'Write well-structured, nuanced texts for study and professional contexts.',
      oral: 'Lead discussions and express subtle meaning shifts orally.',
    },
    ar: {
      title: 'المستوى 8 – السويدية الكتابية والشفوية المتعمقة',
      summary: 'إنتاج مستقل ودقيق على مستوى متقدم.',
      written: 'كتابة نصوص منظمة ودقيقة للدراسة والسياقات المهنية.',
      oral: 'قيادة النقاش والتعبير عن دلالات دقيقة شفهياً.',
    },
    links: [
      link('B1–B2 verb', 'B1–B2 verbs', 'أفعال B1–B2', '/verbs-b1b2'),
      link('Ordförråd', 'Vocabulary', 'المفردات', '/vocabulary'),
      link('C1 (kommer snart)', 'C1 (coming soon)', 'C1 (قريباً)', '/c1', false),
    ],
  },
];

export function lundLevelPath(id) {
  return `/niva/${id}`;
}

export function getLundLevel(id) {
  return LUND_LEVELS.find((l) => l.id === Number(id)) ?? null;
}

export function lundLevelCopy(level, lang) {
  const l = lang === 'en' || lang === 'ar' ? lang : 'sv';
  return level[l];
}

export function lundLinkLabel(linkItem, lang) {
  const l = lang === 'en' || lang === 'ar' ? lang : 'sv';
  return linkItem[l].label;
}

export function lundLinkTo(linkItem, lang) {
  const l = lang === 'en' || lang === 'ar' ? lang : 'sv';
  return linkItem[l].to;
}
