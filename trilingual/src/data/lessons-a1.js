/** Preserved A1 grammar content — personliga pronomen */
export const lessonsA1Meta = {
  level: 'A1',
  title: 'Svenska personliga pronomen A1: jag, du, han',
  description:
    'Lär dig svenska personliga pronomen på A1-nivå: jag, du, han, hon, vi, de och objektformerna mig, dig, honom, henne. Quiz med engelskt och arabiskt stöd.',
  canonical: '/lessons-a1',
};

export const lessonsA1 = [
  {
    number: 1,
    title_sv: 'Personliga pronomen',
    subtitle_sv: 'Ord som ersätter namn och saker i en mening.',
    support_en:
      'Personal pronouns replace names and things. Swedish has two forms: subject pronouns (who does the action) and object pronouns (who receives the action).',
    support_ar:
      'الضمائر الشخصية تُستخدم بدل الأسماء والأشياء. في السويدية نوعان: ضمائر الفاعل (من يقوم بالفعل) وضمائر المفعول (من يُوجَّه إليه الفعل).',
    rules: [
      {
        title: 'Subjektspronomen',
        sv: 'Subjektspronomen står före verbet och visar vem som gör något.',
        example: 'jag talar svenska · du läser en bok · han bor i Malmö',
      },
      {
        title: 'Objektspronomen',
        sv: 'Objektspronomen står efter verbet (eller efter en preposition) och visar vem som påverkas.',
        example: 'Hon ser mig · Jag hjälper dig · Vi känner dem',
      },
    ],
    subjectTable: [
      { sv: 'jag', en: 'I', ar: 'أنا' },
      { sv: 'du', en: 'you (singular)', ar: 'أنت' },
      { sv: 'han', en: 'he', ar: 'هو' },
      { sv: 'hon', en: 'she', ar: 'هي' },
      { sv: 'den', en: 'it (en-word)', ar: 'هو/هي (مذكر)' },
      { sv: 'det', en: 'it (ett-word)', ar: 'هو (محايد)' },
      { sv: 'vi', en: 'we', ar: 'نحن' },
      { sv: 'ni', en: 'you (plural / formal)', ar: 'أنتم / حضرتك' },
      { sv: 'de', en: 'they', ar: 'هم' },
    ],
    objectTable: [
      { subj: 'jag', obj: 'mig', en: 'me', ar: 'ـني / إياي' },
      { subj: 'du', obj: 'dig', en: 'you', ar: 'ـك' },
      { subj: 'han', obj: 'honom', en: 'him', ar: 'ـه / إياه' },
      { subj: 'hon', obj: 'henne', en: 'her', ar: 'ـها / إياها' },
      { subj: 'vi', obj: 'oss', en: 'us', ar: 'ـنا' },
      { subj: 'ni', obj: 'er', en: 'you (plural)', ar: 'ـكم' },
      { subj: 'de', obj: 'dem', en: 'them', ar: 'ـهم' },
    ],
    examples: [
      { sv: 'Jag heter Anna.', en: 'My name is Anna.', ar: 'اسمي آنا.' },
      { sv: 'Du talar bra svenska.', en: 'You speak Swedish well.', ar: 'أنت تتحدث السويدية جيداً.' },
      { sv: 'Han bor i Lund.', en: 'He lives in Lund.', ar: 'هو يسكن في لوند.' },
      { sv: 'Vi studerar svenska.', en: 'We study Swedish.', ar: 'نحن ندرس السويدية.' },
      { sv: 'Kan du hjälpa mig?', en: 'Can you help me?', ar: 'هل يمكنك مساعدتي؟' },
      { sv: 'Jag ringer henne i kväll.', en: 'I will call her tonight.', ar: 'سأتصل بها هذا المساء.' },
    ],
    quiz: [
      { q: '___ heter Mohamed och kommer från Egypten.', answer: 'Jag', choices: ['Jag', 'Du', 'Hon'] },
      { q: '___ är lärare och bor i Stockholm.', answer: 'Hon', choices: ['Han', 'Hon', 'Det'] },
      { q: '___ studerar svenska på universitetet.', answer: 'Vi', choices: ['Du', 'Vi', 'De'] },
      { q: 'Tack för att du hjälper ___!', answer: 'mig', choices: ['jag', 'mig', 'min'] },
      { q: 'Jag känner ___ från språkkursen.', answer: 'honom', choices: ['han', 'honom', 'henne'] },
      { q: 'Vi träffar ___ på fredag.', answer: 'dem', choices: ['de', 'dem', 'oss'] },
    ],
  },
];
