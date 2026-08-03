import { useQuery } from '@tanstack/react-query';
import {
  fetchVerbs,
  fetchAuxiliaries,
  fetchVocabularyPage,
  fetchVocabularyCategories,
  fetchLessonsByLevel,
  fetchLessonBySlug,
} from '@/lib/publicQueries';

const STALE = {
  verbs: 5 * 60_000,
  vocabulary: 2 * 60_000,
  lessons: 10 * 60_000,
};

export function useVerbs(level) {
  return useQuery({
    queryKey: ['verbs', level],
    queryFn: () => fetchVerbs(level),
    staleTime: STALE.verbs,
    select: (data) => data,
  });
}

export function useAuxiliaries(enabled = true) {
  return useQuery({
    queryKey: ['auxiliaries'],
    queryFn: () => fetchAuxiliaries(),
    staleTime: STALE.verbs,
    enabled,
  });
}

export function useVocabularyPage({ page, pageSize, search, level, category }) {
  return useQuery({
    queryKey: ['vocabulary', { page, pageSize, search, level, category }],
    queryFn: () => fetchVocabularyPage({ page, pageSize, search, level, category }),
    staleTime: STALE.vocabulary,
    placeholderData: (prev) => prev,
  });
}

export function useVocabularyCategories() {
  return useQuery({
    queryKey: ['vocabulary-categories'],
    queryFn: fetchVocabularyCategories,
    staleTime: STALE.vocabulary,
  });
}

export function useLessons(level) {
  return useQuery({
    queryKey: ['lessons', level],
    queryFn: () => fetchLessonsByLevel(level),
    staleTime: STALE.lessons,
  });
}

export function useLessonBySlug(slug) {
  return useQuery({
    queryKey: ['lesson', slug],
    queryFn: () => fetchLessonBySlug(slug),
    staleTime: STALE.lessons,
    enabled: Boolean(slug),
  });
}
