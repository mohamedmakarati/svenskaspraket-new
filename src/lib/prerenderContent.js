/** Visible H1 + intro for build-time prerender (matches public page copy) */
import { LUND_LEVELS } from '../data/lundLevels.js';

const lundPrerenderEntries = Object.fromEntries(
  LUND_LEVELS.map((level) => [
    `lundLevel${level.id}`,
    {
      lang: 'sv',
      dir: 'ltr',
      h1: level.sv.title,
      intro: level.sv.summary,
    },
  ]),
);

export const PRERENDER_CONTENT = {
  home: {
    lang: 'sv',
    dir: 'ltr',
    h1: 'Lär dig svenska gratis – från A1 till C1',
    intro:
      'Lär dig svenska gratis från A1 till C1. Träna svenska verb, ordförråd, grammatik, flashcards och quiz med stöd på engelska och arabiska.',
  },
  en: {
    lang: 'en',
    dir: 'ltr',
    h1: 'Learn Swedish free – from A1 to C1',
    intro:
      'Learn Swedish free from A1 to C1. Study Swedish verbs, vocabulary and grammar with interactive flashcards, quizzes and English support.',
  },
  ar: {
    lang: 'ar',
    dir: 'rtl',
    h1: 'تعلم اللغة السويدية مجاناً – من A1 إلى C1',
    intro:
      'تعلم اللغة السويدية مجاناً من A1 إلى C1. تدرب على الأفعال والمفردات والقواعد والبطاقات والاختبارات مع شرح باللغة العربية.',
  },
  verbsA1: {
    lang: 'sv',
    dir: 'ltr',
    h1: '131 svenska A1-verb',
    intro:
      'Sök, filtrera och träna verbformerna. Välj engelska eller arabiska översättningar.',
  },
  verbsA2: {
    lang: 'sv',
    dir: 'ltr',
    h1: '199 svenska A2-verb',
    intro:
      'Träna A2-verb med full böjning, minnesbilder och översättningar på engelska och arabiska.',
  },
  verbsB1B2: {
    lang: 'sv',
    dir: 'ltr',
    h1: '135 oregelbundna verb B1-B2',
    intro:
      'Träna oregelbundna svenska verb på B1-B2-nivå med böjning och flerspråkigt stöd.',
  },
  vocabulary: {
    lang: 'sv',
    dir: 'ltr',
    h1: '805 svenska ord och uttryck',
    intro: 'Svenska · English · العربية — flashcards, sökbar ordlista och quiz.',
  },
  lessonsA1: {
    lang: 'sv',
    dir: 'ltr',
    h1: 'Personliga pronomen',
    intro:
      'Lär dig subjekt- och objektpronomen på svenska – grunden för att bygga enkla meningar.',
  },
  lessonsB1: {
    lang: 'sv',
    dir: 'ltr',
    h1: 'Substantiv steg för steg',
    intro:
      'Grammatiklektioner på B1–B2-nivå med engelskt eller arabiskt språkstöd.',
  },
  c1: {
    lang: 'sv',
    dir: 'ltr',
    h1: 'Avancerad svenska (C1) – kommer snart',
    intro:
      'Originellt C1-material publiceras snart. Till dess kan du träna verb, ordförråd och grammatik på A1–B2.',
  },
  ...lundPrerenderEntries,
};
