/** A2–B1 grammar: word classes, sentence parts, and nouns (English-medium lesson). */
export const a2b1GrammarMeta = {
  level: 'A2–B1',
  title: 'Swedish Grammar: Word Classes, Sentence Parts, and Nouns',
  title_sv: 'Svensk grammatik: ordklasser, satsdelar och substantiv',
  description:
    'Learn Swedish word classes, sentence parts, noun gender, definite/indefinite forms, and common plural patterns. Level A2–B1 with English explanations.',
  canonical: '/lessons-a2-b1',
};

export const a2b1GrammarLesson = {
  level: 'A2–B1',
  title: 'Swedish Grammar: Word Classes, Sentence Parts, and Nouns',
  subtitle: 'Target language: Swedish · Lesson language: English',
  goals: [
    'Identify the main word classes in Swedish.',
    'Recognize important sentence parts.',
    'Understand Swedish noun gender and number.',
    'Use indefinite and definite noun forms.',
    'Form common plural nouns.',
  ],
  sections: [
    {
      id: 'word-classes',
      title: '1. Swedish Word Classes',
      paragraphs: [
        'Every Swedish word belongs to a word class. Swedish has nine main word classes.',
        'Remember the word classes in three groups: information words (nouns, verbs, adjectives, adverbs, number words), connecting words (pronouns, conjunctions, prepositions), and feeling words (interjections).',
      ],
      table: {
        title: 'The nine word classes',
        headers: ['Swedish', 'English', 'Example'],
        rows: [
          ['Substantiv', 'Noun', 'en tidning, ett hus'],
          ['Räkneord', 'Number word', 'två, första'],
          ['Verb', 'Verb', 'läsa, förstå'],
          ['Pronomen', 'Pronoun', 'jag, hon, någon'],
          ['Adjektiv', 'Adjective', 'snäll, lång'],
          ['Adverb', 'Adverb', 'nu, där, aldrig'],
          ['Konjunktioner', 'Conjunction', 'och, men, eftersom'],
          ['Prepositioner', 'Preposition', 'på, i, med'],
          ['Interjektioner', 'Interjection', 'Hej!, Oj!, Aj!'],
        ],
      },
      examples: [
        { sv: 'en student', en: 'Noun — a person or thing' },
        { sv: 'studera', en: 'Verb — an action or state' },
        { sv: 'intressant', en: 'Adjective — describes a noun' },
        { sv: 'snabbt', en: 'Adverb — how, when, where' },
        { sv: 'Jag vill gå, men jag är trött.', en: 'Conjunction — connects clauses' },
        { sv: 'på jobbet', en: 'Preposition — relationship' },
      ],
    },
    {
      id: 'sentence-parts',
      title: '2. Sentence Parts',
      paragraphs: ['A Swedish sentence can contain several sentence parts.'],
      subsections: [
        {
          title: 'Subject',
          paragraphs: ['The subject tells us who or what performs the action. Ask: Vem? (Who?) · Vad? (What?)'],
          examples: [
            { sv: 'Pia arbetar.', en: 'Pia works.' },
            { sv: 'Bilen startar inte.', en: 'The car does not start.' },
            { sv: 'Pia och Ali studerar.', en: 'Pia and Ali study.' },
          ],
        },
        {
          title: 'Verb or predicate',
          paragraphs: [
            'The verb tells us what happens. It can consist of more than one word: har arbetat, ska studera, vill köpa.',
            'Memory hook: the subject is the actor; the verb is the action or state.',
          ],
          examples: [
            { sv: 'Bilen startar.', en: '' },
            { sv: 'Ali studerar.', en: '' },
            { sv: 'De har läst boken.', en: '' },
          ],
        },
        {
          title: 'Direct object',
          paragraphs: ['The direct object receives the action. Ask: Vad? (What?) · Vem? (Whom?)'],
          examples: [
            { sv: 'Hon läser en bok.', en: 'She reads a book.' },
            { sv: 'Vi köper en ny dator.', en: '' },
            { sv: 'Läraren träffar studenterna.', en: '' },
          ],
        },
        {
          title: 'Indirect object',
          paragraphs: ['Often tells us who receives something. Ask: Till vem? · Åt vem? Swedish often uses a preposition: till mig, för henne, åt barnen.'],
          examples: [
            { sv: 'Jag skickar ett meddelande till min vän.', en: '' },
            { sv: 'Han köper en present till sin syster.', en: '' },
          ],
        },
        {
          title: 'Subject complement',
          paragraphs: ['Some verbs describe the subject: vara, bli, verka, känna sig.'],
          examples: [
            { sv: 'Lars är lärare.', en: 'Lars is a teacher.' },
            { sv: 'Hon är trött.', en: '' },
            { sv: 'Filmen verkar intressant.', en: '' },
          ],
        },
        {
          title: 'Adverbial',
          paragraphs: ['Gives extra information: Var? Vart? När? Hur? Hur mycket? Varför?'],
          examples: [
            { sv: 'Hon arbetar på ett stort företag.', en: 'Where?' },
            { sv: 'De åker till Göteborg.', en: 'Where to?' },
            { sv: 'Lektionen börjar klockan nio.', en: 'When?' },
            { sv: 'Vi stannar hemma eftersom det regnar.', en: 'Why?' },
          ],
        },
      ],
    },
    {
      id: 'nouns',
      title: '3. Swedish Nouns',
      paragraphs: [
        'A noun can name a person, animal, thing, place, plant, or idea.',
        'Swedish has two grammatical genders: common gender (en-words) and neuter gender (ett-words).',
        'Important: learn every noun together with en or ett — not just bok but en bok; not just hus but ett hus.',
      ],
      examples: [
        { sv: 'en bok · en telefon · en student', en: 'Common gender (en)' },
        { sv: 'ett hus · ett meddelande · ett problem', en: 'Neuter gender (ett)' },
      ],
    },
    {
      id: 'number',
      title: '4. Singular and Plural',
      paragraphs: ['Swedish nouns can be singular (one) or plural (more than one).'],
      examples: [
        { sv: 'en penna · ett häfte · en telefon', en: 'Singular' },
        { sv: 'pennor · häften · telefoner', en: 'Plural' },
      ],
    },
    {
      id: 'definite',
      title: '5. Indefinite and Definite Forms',
      paragraphs: [
        'Use the indefinite form when you introduce something new: Jag köper en bok.',
        'Use the definite form when the listener knows which thing you mean: Boken är dyr. Swedish often adds the definite article to the end of the noun.',
      ],
      table: {
        title: 'Common patterns',
        headers: ['Indefinite', 'Definite'],
        rows: [
          ['en bok', 'boken'],
          ['en penna', 'pennan'],
          ['ett hus', 'huset'],
          ['ett meddelande', 'meddelandet'],
        ],
      },
    },
    {
      id: 'four-forms',
      title: '6. Four Important Noun Forms',
      paragraphs: ['Think of the four forms as a square: one, known one, many, known many.'],
      subsections: [
        {
          title: 'en penna',
          table: {
            headers: ['Form', 'Example'],
            rows: [
              ['Indefinite singular', 'en penna'],
              ['Definite singular', 'pennan'],
              ['Indefinite plural', 'pennor'],
              ['Definite plural', 'pennorna'],
            ],
          },
        },
        {
          title: 'ett hus',
          table: {
            headers: ['Form', 'Example'],
            rows: [
              ['Indefinite singular', 'ett hus'],
              ['Definite singular', 'huset'],
              ['Indefinite plural', 'hus'],
              ['Definite plural', 'husen'],
            ],
          },
        },
      ],
    },
    {
      id: 'plural-patterns',
      title: '7. Common Plural Patterns',
      paragraphs: ['Learn the plural with each noun. These groups are useful starting points.'],
      subsections: [
        {
          title: 'Plural with -or (many en-words ending in -a)',
          table: {
            headers: ['Singular', 'Plural'],
            rows: [
              ['en flicka', 'flickor'],
              ['en kvinna', 'kvinnor'],
              ['en vecka', 'veckor'],
            ],
          },
        },
        {
          title: 'Plural with -ar',
          table: {
            headers: ['Singular', 'Plural'],
            rows: [
              ['en tidning', 'tidningar'],
              ['en dag', 'dagar'],
              ['en stol', 'stolar'],
            ],
          },
        },
        {
          title: 'Plural with -er (some vowel change)',
          table: {
            headers: ['Singular', 'Plural'],
            rows: [
              ['en film', 'filmer'],
              ['en bok', 'böcker'],
              ['en tand', 'tänder'],
            ],
          },
        },
        {
          title: 'Plural with -n (some ett-words)',
          table: {
            headers: ['Singular', 'Plural'],
            rows: [
              ['ett äpple', 'äpplen'],
              ['ett meddelande', 'meddelanden'],
            ],
          },
        },
        {
          title: 'No ending (same indefinite singular and plural)',
          table: {
            headers: ['Singular', 'Plural', 'Definite plural'],
            rows: [
              ['ett hus', 'hus', 'husen'],
              ['ett brev', 'brev', 'breven'],
            ],
          },
        },
      ],
    },
    {
      id: 'mistakes',
      title: '8. Common Mistakes',
      list: [
        'Forgetting en or ett: Jag köper en bok (not Jag köper bok).',
        'Using definite too early: Jag har en bok first; boken when the book is known.',
        'Same plural ending for every noun: två hus (not två husar).',
        'Confusing definite singular and plural: boken = the book; böckerna = the books.',
        'Confusing word class and sentence part: studenten is a noun and can be subject or object.',
      ],
    },
    {
      id: 'examples',
      title: '9. Useful Examples',
      examples: [
        { sv: 'Jag köper en ny telefon. Telefonen är dyr.', en: 'Indefinite → definite' },
        { sv: 'Det står flera böcker på bordet. Böckerna tillhör min lärare.', en: '' },
        { sv: 'Vi bor i ett stort hus. Huset ligger nära skolan.', en: '' },
        {
          sv: 'Läraren skickar ett meddelande till studenterna.',
          en: 'Subject: Läraren · Verb: skickar · Direct object: ett meddelande · Indirect: till studenterna',
        },
      ],
    },
  ],
  summary: [
    'Swedish words belong to different word classes.',
    'A sentence usually has a subject and a verb.',
    'Swedish nouns are either en-words or ett-words.',
    'Nouns can be singular, plural, indefinite, or definite.',
    'Learn every noun with its article and plural form, e.g. en bok, böcker.',
  ],
  recall: {
    question: 'What is the difference between Jag köper en bok and Jag läser boken?',
    answer:
      'The first sentence introduces a new, indefinite book. The second refers to a specific book that is already known.',
  },
  quiz: [
    { q: 'Jag ser ___ hund.', answer: 'en', choices: ['en', 'ett'] },
    { q: '___ hunden står utanför huset.', answer: 'En', choices: ['En', 'Ett'] },
    { q: 'Jag har två ___.', answer: 'böcker', choices: ['bok', 'böcker'] },
    { q: '___ ligger på bordet.', answer: 'Böckerna', choices: ['Böckerna', 'Bokarna'] },
    { q: 'Vi bor i ett ___.', answer: 'hus', choices: ['hus', 'husar'] },
    { q: 'Indefinite singular of en penna (definite): ___', answer: 'pennan', choices: ['pennan', 'pennor', 'pennorna'] },
    { q: 'Definite plural of ett hus: ___', answer: 'husen', choices: ['hus', 'husen', 'huset'] },
    { q: 'Plural of en film: ___', answer: 'filmer', choices: ['filmer', 'filmar', 'filmerna'] },
  ],
};
