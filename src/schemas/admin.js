import { z } from 'zod';

const slug = z
  .string()
  .min(1, 'Slug required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, digits and hyphens only');

const status = z.enum(['draft', 'published', 'archived']);
const cefr = z.enum(['A1', 'A2', 'B1', 'B2']);

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export const verbFormSchema = z.object({
  slug: slug,
  infinitive: z.string().min(1, 'Infinitive required'),
  imperative: z.string().optional().nullable(),
  present: z.string().optional().nullable(),
  preterite: z.string().optional().nullable(),
  supine: z.string().optional().nullable(),
  verb_group: z.string().optional().nullable(),
  cefr_level: cefr,
  meaning_en: z.string().optional().nullable(),
  meaning_ar: z.string().optional().nullable(),
  example_sv: z.string().optional().nullable(),
  example_en: z.string().optional().nullable(),
  example_ar: z.string().optional().nullable(),
  image_path: z.string().optional().nullable(),
  status,
  seo_title_sv: z.string().optional().nullable(),
  seo_title_en: z.string().optional().nullable(),
  seo_title_ar: z.string().optional().nullable(),
  seo_description_sv: z.string().optional().nullable(),
  seo_description_en: z.string().optional().nullable(),
  seo_description_ar: z.string().optional().nullable(),
});

export const vocabularyFormSchema = z.object({
  slug: slug,
  word_sv: z.string().min(1, 'Swedish word required'),
  meaning_en: z.string().optional().nullable(),
  meaning_ar: z.string().optional().nullable(),
  example_sv: z.string().optional().nullable(),
  example_en: z.string().optional().nullable(),
  example_ar: z.string().optional().nullable(),
  word_class: z.string().optional().nullable(),
  cefr_level: cefr.optional().nullable(),
  category: z.string().optional().nullable(),
  image_path: z.string().optional().nullable(),
  status,
});

export const lessonFormSchema = z.object({
  slug: slug,
  title_sv: z.string().min(1, 'Swedish title required'),
  title_en: z.string().optional().nullable(),
  title_ar: z.string().optional().nullable(),
  summary_sv: z.string().optional().nullable(),
  summary_en: z.string().optional().nullable(),
  summary_ar: z.string().optional().nullable(),
  content_sv: z.string().optional().nullable(),
  content_en: z.string().optional().nullable(),
  content_ar: z.string().optional().nullable(),
  cefr_level: cefr.optional().nullable(),
  category: z.string().optional().nullable(),
  featured_image_path: z.string().optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
  status,
  seo_title_sv: z.string().optional().nullable(),
  seo_title_en: z.string().optional().nullable(),
  seo_title_ar: z.string().optional().nullable(),
  seo_description_sv: z.string().optional().nullable(),
  seo_description_en: z.string().optional().nullable(),
  seo_description_ar: z.string().optional().nullable(),
});

const uuidOrEmpty = z
  .union([z.string().uuid(), z.literal(''), z.null()])
  .optional()
  .transform((v) => (v === '' ? null : v ?? null));

export const quizFormSchema = z
  .object({
    lesson_id: uuidOrEmpty,
    vocabulary_id: uuidOrEmpty,
    verb_id: uuidOrEmpty,
    question_sv: z.string().min(1, 'Question required'),
    question_en: z.string().optional().nullable(),
    question_ar: z.string().optional().nullable(),
    answer_data: z.object({
      type: z.string().default('multiple_choice'),
      choices: z.array(z.string()).min(2),
      correct: z.string().min(1),
    }),
    explanation_sv: z.string().optional().nullable(),
    explanation_en: z.string().optional().nullable(),
    explanation_ar: z.string().optional().nullable(),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    status,
  })
  .refine((d) => d.lesson_id || d.vocabulary_id || d.verb_id, {
    message: 'Link the quiz to a lesson, vocabulary item or verb',
    path: ['lesson_id'],
  });

export const exerciseFormSchema = z.object({
  lesson_id: z.string().uuid(),
  instruction_sv: z.string().optional().nullable(),
  instruction_en: z.string().optional().nullable(),
  instruction_ar: z.string().optional().nullable(),
  exercise_type: z.enum(['quiz', 'fill_blank', 'matching', 'free_text']).default('quiz'),
  exercise_data: z.record(z.unknown()).default({}),
  sort_order: z.coerce.number().int().default(0),
  status,
});

export const siteSettingSchema = z.object({
  setting_key: z.string().regex(/^[a-z][a-z0-9_]*$/),
  setting_value: z.record(z.unknown()),
});

export const profileRoleSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']),
  preferred_language: z.enum(['sv', 'en', 'ar']).optional(),
  display_name: z.string().optional().nullable(),
});
