import { describe, expect, it } from "vitest";
import {
  conceptCategories,
  concepts,
  conceptsByCategory,
  filterConcepts,
  getConcept,
  getProject,
  getProjectMilestone,
  learningProjects,
  validateCurriculum,
} from "@/lib/learning-concepts";

const EXPECTED_COUNTS: Record<string, number> = {
  foundations: 15,
  go: 29,
  algorithms: 22,
  architecture: 27,
  memory: 15,
  compilers: 18,
  os: 21,
  concurrency: 4,
  networking: 20,
  performance: 4,
};

describe("ordered learning curriculum", () => {
  it("has the ten ordered categories and 175 complete concepts", () => {
    expect(conceptCategories).toHaveLength(10);
    expect(concepts).toHaveLength(175);

    conceptCategories.forEach((category, index) => {
      expect(category.order).toBe(index + 1);
      expect(conceptsByCategory(category.id)).toHaveLength(
        EXPECTED_COUNTS[category.id],
      );
    });
  });

  it("has unique concept and project identifiers", () => {
    expect(new Set(concepts.map((concept) => concept.id)).size).toBe(
      concepts.length,
    );
    expect(new Set(learningProjects.map((project) => project.id)).size).toBe(
      learningProjects.length,
    );
  });

  it("numbers concepts contiguously inside every category", () => {
    for (const category of conceptCategories) {
      const orders = conceptsByCategory(category.id)
        .map((concept) => concept.order)
        .sort((a, b) => a - b);
      expect(orders, category.id).toEqual(
        Array.from({ length: orders.length }, (_, index) => index + 1),
      );
    }
  });

  it("gives every concept a tailored prompt, two exercises, and a project link", () => {
    for (const concept of concepts) {
      expect(concept.prompt, concept.id).toContain(concept.name);
      expect(concept.prompt, concept.id).toContain("Teach the concept in this order");
      expect(concept.prompt.length, concept.id).toBeGreaterThan(600);
      expect(concept.exercises.length, concept.id).toBeGreaterThanOrEqual(2);
      expect(concept.projectRefs.length, concept.id).toBeGreaterThan(0);

      for (const exercise of concept.exercises) {
        expect(exercise.objectives.length, exercise.id).toBeGreaterThan(0);
        expect(exercise.requirements.length, exercise.id).toBeGreaterThan(0);
        expect(exercise.acceptanceCriteria.length, exercise.id).toBeGreaterThan(0);
        expect(exercise.testCases.length, exercise.id).toBeGreaterThan(0);
        expect(exercise.hints.length, exercise.id).toBeGreaterThan(0);
        expect(exercise.solution.trim().length, exercise.id).toBeGreaterThan(0);
      }
    }
  });

  it("keeps prompts and exercise titles unique", () => {
    expect(new Set(concepts.map((concept) => concept.prompt)).size).toBe(
      concepts.length,
    );
    const exerciseTitles = concepts.flatMap((concept) =>
      concept.exercises.map((exercise) => exercise.title),
    );
    expect(new Set(exerciseTitles).size).toBe(exerciseTitles.length);
  });

  it("places every prerequisite earlier in the curriculum", () => {
    const rank = new Map<string, number>();
    conceptCategories.forEach((category) => {
      conceptsByCategory(category.id).forEach((concept) => {
        rank.set(concept.id, category.order * 1000 + concept.order);
      });
    });

    for (const concept of concepts) {
      for (const prerequisiteId of concept.prerequisiteIds) {
        expect(rank.get(prerequisiteId)!, `${concept.id} <- ${prerequisiteId}`).toBeLessThan(
          rank.get(concept.id)!,
        );
      }
    }
  });

  it("validates references, ordering, and prerequisite cycles", () => {
    expect(() => validateCurriculum()).not.toThrow();
  });

  it("resolves concepts, projects, and milestone references", () => {
    expect(getConcept("found-execution")?.name).toBe("How Programs Execute");
    expect(getConcept("missing-concept")).toBeUndefined();

    const project = getProject("cli-calculator");
    expect(project?.title).toBe("CLI Calculator");
    expect(getProjectMilestone("cli-calculator", "m-run")?.milestone.title).toBe(
      "Run loop and arithmetic",
    );
    expect(getProjectMilestone("cli-calculator", "missing")).toBeUndefined();
  });

  it("filters by search text and category without mutating the source", () => {
    const sourceLength = concepts.length;

    expect(filterConcepts("goroutine", "all")).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "go-goroutines" })]),
    );
    expect(filterConcepts("latin square", "all")).toHaveLength(0);
    expect(filterConcepts("cache", "all").every((concept) => {
      const text = `${concept.name} ${concept.description}`.toLowerCase();
      return text.includes("cache");
    })).toBe(true);

    for (const category of conceptCategories) {
      const filtered = filterConcepts("", category.id);
      expect(filtered.length, category.id).toBeGreaterThan(0);
      expect(
        filtered.every((concept) => concept.categoryId === category.id),
        category.id,
      ).toBe(true);
    }

    expect(filterConcepts("memory", "os").length).toBeGreaterThan(0);
    expect(
      filterConcepts("goroutine", "architecture").some(
        (concept) => concept.categoryId === "go",
      ),
    ).toBe(false);
    expect(concepts).toHaveLength(sourceLength);
  });
});
