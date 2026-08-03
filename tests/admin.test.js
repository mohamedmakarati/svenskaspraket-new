import { describe, it, expect } from 'vitest';
import { slugify } from '../src/lib/slug';
import { safeAdminRedirect } from '../src/lib/redirect';
import { toAdminError } from '../src/lib/adminErrors';
import { loginSchema, quizFormSchema, exerciseFormSchema } from '../src/schemas/admin';

describe('slugify', () => {
  it('creates valid slugs', () => {
    expect(slugify('Prata Svenska')).toBe('prata-svenska');
    expect(slugify('  köra  ')).toBe('kora');
  });
});

describe('safeAdminRedirect', () => {
  it('allows internal admin paths', () => {
    expect(safeAdminRedirect('/admin/verbs')).toBe('/admin/verbs');
  });
  it('blocks external URLs', () => {
    expect(safeAdminRedirect('https://evil.com')).toBe('/admin');
    expect(safeAdminRedirect('//evil.com/admin')).toBe('/admin');
  });
});

describe('toAdminError', () => {
  it('sanitizes JWT errors', () => {
    expect(toAdminError({ code: 'PGRST301' })).toMatch(/session/i);
  });
});

describe('loginSchema', () => {
  it('validates email and password', () => {
    const r = loginSchema.safeParse({ email: 'a@b.co', password: '12345678' });
    expect(r.success).toBe(true);
  });
  it('rejects short password', () => {
    const r = loginSchema.safeParse({ email: 'a@b.co', password: 'short' });
    expect(r.success).toBe(false);
  });
});

describe('quizFormSchema', () => {
  it('requires a parent entity', () => {
    const r = quizFormSchema.safeParse({
      question_sv: 'Test?',
      answer_data: { type: 'multiple_choice', choices: ['a', 'b'], correct: 'a' },
      status: 'draft',
      difficulty: 'medium',
    });
    expect(r.success).toBe(false);
  });

  it('accepts lesson-linked quiz', () => {
    const r = quizFormSchema.safeParse({
      lesson_id: '550e8400-e29b-41d4-a716-446655440000',
      question_sv: 'Test?',
      answer_data: { type: 'multiple_choice', choices: ['a', 'b'], correct: 'a' },
      status: 'draft',
      difficulty: 'medium',
    });
    expect(r.success).toBe(true);
  });
});

describe('exerciseFormSchema', () => {
  it('requires lesson_id', () => {
    const r = exerciseFormSchema.safeParse({
      exercise_type: 'quiz',
      status: 'draft',
      sort_order: 0,
    });
    expect(r.success).toBe(false);
  });
});
