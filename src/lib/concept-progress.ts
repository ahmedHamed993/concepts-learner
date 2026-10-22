import { conceptCategories, concepts } from "@/lib/learning-concepts";
import type { ConceptCategoryId } from "@/lib/learning-concepts";
import type { AppState } from "@/lib/types";

export function isConceptComplete(state: AppState, conceptId: string): boolean {
  return Boolean(state.conceptProgress[conceptId]);
}

export function conceptCompletion(state: AppState): {
  completed: number;
  total: number;
  percent: number;
} {
  const completed = concepts.filter((concept) =>
    isConceptComplete(state, concept.id),
  ).length;
  const total = concepts.length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function categoryCompletion(
  state: AppState,
  categoryId: ConceptCategoryId,
): {
  completed: number;
  total: number;
  percent: number;
} {
  const categoryConcepts = concepts.filter(
    (concept) => concept.categoryId === categoryId,
  );
  const completed = categoryConcepts.filter((concept) =>
    isConceptComplete(state, concept.id),
  ).length;
  const total = categoryConcepts.length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function nextIncompleteConcept(state: AppState) {
  return concepts.find((concept) => !isConceptComplete(state, concept.id));
}

export function categoryTitle(categoryId: ConceptCategoryId): string {
  return (
    conceptCategories.find((category) => category.id === categoryId)?.title ??
    categoryId
  );
}
