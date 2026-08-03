/** Preserved B1-B2 grammar content */
export const lessonsB1Meta = {
  level: 'B1-B2',
  title: 'Svensk grammatik B1-B2: substantiv',
  description:
    'Lär dig svensk grammatik B1-B2: sammansatta substantiv, genitiv samt bestämd och obestämd form. Quiz med engelskt och arabiskt stöd.',
  canonical: '/lessons',
};

export const lessonsB1 = [
  {
    number: 1,
    title_sv: 'Sammansatta substantiv',
    subtitle_sv: 'Två eller flera ord blir ett nytt substantiv.',
    support_en:
      'A compound noun joins two or more words. The final noun controls whether the compound uses en or ett.',
    support_ar: 'الاسم المركّب يجمع كلمتين أو أكثر. الاسم الأخير هو الذي يحدد استعمال en أو ett.',
    rule_sv:
      'Huvudregel: Skriv delarna tillsammans. Det sista substantivet bestämmer genus. en buss + ett kort → ett busskort',
    examples: [
      { sv: 'en arbetsdag', detail: 'arbete + dag', en: 'a working day', ar: 'يوم عمل' },
      { sv: 'ett språkprov', detail: 'språk + prov', en: 'a language test', ar: 'اختبار لغة' },
      { sv: 'en kökslampa', detail: 'kök + s + lampa', en: 'a kitchen lamp', ar: 'مصباح المطبخ' },
      { sv: 'ett väntrum', detail: 'vänta + rum', en: 'a waiting room', ar: 'غرفة انتظار' },
    ],
    quiz: [
      { q: '___ språkkurs', answer: 'en', choices: ['en', 'ett'] },
      {
        q: 'Vilket ord bildas av ett bibliotek + ett kort?',
        answer: 'ett bibliotekskort',
        choices: ['en bibliotek kort', 'ett bibliotekskort', 'ett bibliotekkort'],
      },
    ],
  },
  {
    number: 2,
    title_sv: 'Genitiv med -s',
    subtitle_sv: 'Genitiv visar vem som äger eller hör ihop med något.',
    support_en:
      'Swedish normally forms the possessive by adding -s without an apostrophe: Emmas bok.',
    support_ar: 'تُصاغ الملكية في السويدية غالبًا بإضافة -s من دون فاصلة عليا: Emmas bok أي كتاب إيما.',
    rule_sv:
      'Form: ägare + s + huvudord i obestämd form. studenten → studentens fråga',
    examples: [
      { sv: 'Karins cykel', en: "Karin's bicycle", ar: 'دراجة كارين' },
      { sv: 'barnens lärare', en: "the children's teacher", ar: 'معلّم الأطفال' },
      { sv: 'Sveriges huvudstad', en: 'the capital of Sweden', ar: 'عاصمة السويد' },
      { sv: 'husets dörr', en: 'the door of the house', ar: 'باب المنزل' },
    ],
    quiz: [
      {
        q: 'Välj rätt form.',
        answer: 'Marias telefon',
        choices: ['Maria telefon', 'Marias telefon', 'Marias telefonen'],
      },
      {
        q: 'Kontoret tillhör läraren.',
        answer: 'lärarens kontor',
        choices: ['lärarens kontor', 'läraren kontor', 'lärarens kontoret'],
      },
    ],
  },
  {
    number: 3,
    title_sv: 'Obestämd och bestämd form',
    subtitle_sv: 'Ny information först, känd information sedan.',
    support_en:
      'Use the indefinite form when something is introduced. Use the definite form when both people know which thing is meant.',
    support_ar:
      'نستخدم صيغة النكرة عند تقديم شيء للمرة الأولى، وصيغة المعرفة عندما يعرف الطرفان الشيء المقصود.',
    rule_sv:
      'Första gången: Jag såg en hund. Nästa gång: Hunden sprang mot parken.',
    examples: [
      { sv: 'ett brev → brevet', en: 'a letter → the letter', ar: 'رسالة → الرسالة' },
      { sv: 'en lärare → läraren', en: 'a teacher → the teacher', ar: 'معلّم → المعلّم' },
      { sv: 'böcker → böckerna', en: 'books → the books', ar: 'كتب → الكتب' },
      { sv: 'äpplen → äpplena', en: 'apples → the apples', ar: 'تفاح → التفاح المحدد' },
    ],
    quiz: [
      {
        q: 'Ali har hyrt ___ i Lund. Vi hör om den första gången.',
        answer: 'en lägenhet',
        choices: ['lägenheten', 'en lägenhet', 'ett lägenhet'],
      },
      {
        q: 'Ali har hyrt en lägenhet. ___ ligger nära stationen.',
        answer: 'Lägenheten',
        choices: ['En lägenhet', 'Lägenheten', 'Lägenhet'],
      },
      {
        q: 'Jag dricker ___ varje morgon. Allmän betydelse.',
        answer: 'kaffe',
        choices: ['ett kaffe', 'kaffet', 'kaffe'],
      },
    ],
  },
  {
    number: 4,
    title_sv: 'Formell svenska',
    subtitle_sv: 'Vanliga ord för studier, rapporter och myndighetstexter.',
    support_en:
      'Formal Swedish uses precise words and neutral expressions. Learn the word together with its normal sentence pattern.',
    support_ar:
      'تستخدم السويدية الرسمية كلمات دقيقة وتعبيرات محايدة. تعلّم الكلمة مع تركيبها المعتاد داخل الجملة.',
    rule_sv:
      'Studietips: Lär dig inte bara översättningen. Träna betydelse, böjning, preposition och vanliga ordkombinationer.',
    examples: [
      { sv: 'analysera', detail: 'Vi analyserar resultaten.', en: 'analyse', ar: 'يحلّل' },
      { sv: 'bedöma', detail: 'Läraren bedömer arbetet.', en: 'assess / evaluate', ar: 'يقيّم' },
      { sv: 'framgå', detail: 'Det framgår av tabellen att kostnaden ökar.', en: 'be evident / appear', ar: 'يتّضح' },
      { sv: 'innebära', detail: 'Förändringen innebär nya krav.', en: 'mean / entail', ar: 'يعني / يستلزم' },
      { sv: 'relevant', detail: 'Källan är relevant för frågan.', en: 'relevant', ar: 'ذو صلة' },
      { sv: 'omfattande', detail: 'Rapporten bygger på en omfattande studie.', en: 'extensive / comprehensive', ar: 'شامل / واسع' },
    ],
    quiz: [
      {
        q: 'Det ___ av diagrammet att antalet studenter ökar.',
        answer: 'framgår',
        choices: ['framgår', 'innebär', 'bedömer'],
      },
      {
        q: 'Forskarna ska ___ intervjuerna.',
        answer: 'analysera',
        choices: ['relevant', 'analysera', 'framgå'],
      },
      {
        q: 'Den nya regeln ___ att alla måste registrera sig.',
        answer: 'innebär',
        choices: ['bedömer', 'omfattar', 'innebär'],
      },
    ],
  },
];

export const allB1Quiz = lessonsB1.flatMap((l) => l.quiz);
