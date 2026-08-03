/** Map DB quiz row → GrammarQuiz component shape */
export function mapDbQuizToGrammar(q) {
  const ad = q.answer_data ?? {};
  return {
    id: q.id,
    q: q.question_sv ?? '',
    choices: ad.choices ?? [],
    answer: ad.correct ?? ad.answer ?? '',
  };
}

/** Parse content_sv JSON payload stored by the import pipeline */
export function parseLessonContent(contentSv) {
  if (!contentSv) return {};
  try {
    const parsed = JSON.parse(contentSv);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    /* plain text fallback */
  }
  return { body: contentSv };
}

/** Normalize a DB lesson row (+ nested relations) for LessonRenderer */
export function normalizeLessonFromDb(row) {
  const content = parseLessonContent(row.content_sv);
  const quizzes = (row.quiz_questions ?? [])
    .filter((q) => q.status !== 'draft' && q.status !== 'archived')
    .map(mapDbQuizToGrammar);

  return {
    id: row.id,
    slug: row.slug,
    number: row.sort_order ?? 0,
    title_sv: row.title_sv,
    subtitle_sv: row.summary_sv ?? '',
    support_en: row.summary_en ?? row.content_en ?? '',
    support_ar: row.summary_ar ?? row.content_ar ?? '',
    rules: content.rules ?? [],
    rule_sv: content.rules?.[0]?.sv ?? row.summary_sv ?? '',
    subjectTable: content.subjectTable ?? null,
    objectTable: content.objectTable ?? null,
    examples: content.examples ?? [],
    quiz: quizzes,
    exercises: (row.exercises ?? [])
      .filter((e) => e.status === 'published')
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    featured_image_path: row.featured_image_path,
    cefr_level: row.cefr_level,
    _source: 'supabase',
  };
}

/** Normalize static JS lesson module shape */
export function normalizeLessonFromStatic(lesson, level) {
  return {
    slug: null,
    number: lesson.number,
    title_sv: lesson.title_sv,
    subtitle_sv: lesson.subtitle_sv ?? '',
    support_en: lesson.support_en ?? '',
    support_ar: lesson.support_ar ?? '',
    rules: lesson.rules ?? [],
    rule_sv: lesson.rule_sv ?? lesson.rules?.[0]?.sv ?? '',
    subjectTable: lesson.subjectTable ?? null,
    objectTable: lesson.objectTable ?? null,
    examples: lesson.examples ?? [],
    quiz: lesson.quiz ?? [],
    exercises: [],
    featured_image_path: null,
    cefr_level: level === 'A1' ? 'A1' : 'B2',
    _source: 'static',
  };
}
