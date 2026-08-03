import { z } from 'zod';

export const verbSchema = z.object({
  level: z.enum(['A1', 'A2', 'B1-B2']),
  verb_group: z.string().optional().nullable(),
  imperative: z.string().optional().nullable(),
  infinitive: z.string().min(1, 'Infinitiv krävs'),
  present: z.string().optional().nullable(),
  preterite: z.string().optional().nullable(),
  supine: z.string().optional().nullable(),
  content_sv: z.string().optional().nullable(),
  content_en: z.string().optional().nullable(),
  content_ar: z.string().optional().nullable(),
  image_path: z.string().optional().nullable(),
  is_auxiliary: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const vocabularySchema = z.object({
  content_sv: z.string().min(1, 'Svenska ord krävs'),
  content_en: z.string().optional().nullable(),
  content_ar: z.string().optional().nullable(),
  level: z.string().default('B1-B2'),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const lessonSchema = z.object({
  slug: z.string().min(1, 'Slug krävs').regex(/^[a-z0-9-]+$/, 'Endast gemener, siffror och bindestreck'),
  title_sv: z.string().min(1, 'Svensk titel krävs'),
  title_en: z.string().optional().nullable(),
  title_ar: z.string().optional().nullable(),
  description_sv: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  body_sv: z.string().optional().nullable(),
  body_en: z.string().optional().nullable(),
  body_ar: z.string().optional().nullable(),
  level: z.string().min(1),
  lesson_number: z.coerce.number().optional().nullable(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const quizQuestionSchema = z.object({
  lesson_id: z.string().uuid().optional().nullable(),
  question_sv: z.string().min(1, 'Fråga krävs'),
  question_en: z.string().optional().nullable(),
  question_ar: z.string().optional().nullable(),
  correct_answer: z.string().min(1, 'Rätt svar krävs'),
  choices: z.array(z.string()).min(2, 'Minst två svarsalternativ'),
  order_index: z.coerce.number().default(0),
  level: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const seoSchema = z.object({
  resource_type: z.string().min(1),
  slug: z.string().optional().nullable(),
  title: z.string().min(1, 'Titel krävs'),
  description: z.string().optional().nullable(),
  canonical_url: z.string().url('Ogiltig URL').optional().nullable().or(z.literal('')),
  robots_index: z.boolean().default(true),
  og_image: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const loginSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(8, 'Lösenordet måste vara minst 8 tecken'),
});
