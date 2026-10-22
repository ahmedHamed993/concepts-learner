import { describe, expect, it } from "vitest";
import {
  categoryCompletion,
  conceptCompletion,
  isConceptComplete,
  nextIncompleteConcept,
} from "@/lib/concept-progress";
import { concepts } from "@/lib/learning-concepts";
import { createInitialState } from "@/lib/storage";

const timestamp = "2026-01-01T00:00:00.000Z";

function complete(state: ReturnType<typeof createInitialState>, id: string) {
  state.conceptProgress[id] = { completedAt: timestamp, updatedAt: timestamp };
}

describe("concept completion", () => {
  it("starts empty and reports the full curriculum size", () => {
    const state = createInitialState();
    const overall = conceptCompletion(state);
    expect(overall.completed).toBe(0);
    expect(overall.total).toBe(concepts.length);
    expect(overall.percent).toBe(0);
    expect(nextIncompleteConcept(state)?.id).toBe(concepts[0].id);
  });

  it("counts completed concepts per category and overall", () => {
    const state = createInitialState();
    const first = concepts[0];
    complete(state, first.id);

    expect(isConceptComplete(state, first.id)).toBe(true);
    expect(conceptCompletion(state).completed).toBe(1);
    expect(categoryCompletion(state, first.categoryId).completed).toBe(1);
    expect(categoryCompletion(state, first.categoryId).percent).toBeGreaterThan(0);
    expect(nextIncompleteConcept(state)?.id).not.toBe(first.id);
  });

  it("unchecking removes completion without touching other concepts", () => {
    const state = createInitialState();
    const [first, second] = concepts;
    complete(state, first.id);
    complete(state, second.id);

    delete state.conceptProgress[first.id];

    expect(isConceptComplete(state, first.id)).toBe(false);
    expect(isConceptComplete(state, second.id)).toBe(true);
    expect(conceptCompletion(state).completed).toBe(1);
  });
});
