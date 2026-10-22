import { describe, expect, it } from "vitest";
import { allTopics, phases } from "@/lib/curriculum";
import { seedExercises } from "@/lib/exercises";
import { seedPrompts } from "@/lib/prompts";
import { seedProjects } from "@/lib/projects";
import { extractVariableKeys } from "@/lib/template";
import { PROMPT_CATEGORIES } from "@/lib/types";

const topicIds = new Set(allTopics.map((topic) => topic.id));
const phaseIds = new Set(phases.map((phase) => phase.id));

describe("seed content integrity", () => {
  it("covers every prompt category", () => {
    for (const category of PROMPT_CATEGORIES) {
      expect(
        seedPrompts.some((prompt) => prompt.category === category),
        category,
      ).toBe(true);
    }
    expect(new Set(seedPrompts.map((prompt) => prompt.id)).size).toBe(seedPrompts.length);
  });

  it("keeps prompt variables consistent with templates", () => {
    for (const prompt of seedPrompts) {
      const fromTemplate = new Set(extractVariableKeys(prompt.template));
      const declared = new Set(prompt.variables.map((variable) => variable.key));
      expect(declared, prompt.id).toEqual(fromTemplate);
      expect(prompt.phases.every((phase) => phase >= 1 && phase <= 8), prompt.id).toBe(true);
    }
  });

  it("points every topic prompt id at a real prompt", () => {
    const promptIds = new Set(seedPrompts.map((prompt) => prompt.id));
    const broken = allTopics.flatMap((topic) =>
      topic.promptIds
        .filter((id) => !promptIds.has(id))
        .map((id) => `${topic.id} -> ${id}`),
    );
    expect(broken).toEqual([]);
  });

  it("keeps exercises on real phases and topics", () => {
    const exerciseIds = new Set(seedExercises.map((exercise) => exercise.id));
    expect(exerciseIds.size).toBe(seedExercises.length);
    for (const exercise of seedExercises) {
      expect(phaseIds.has(exercise.phaseId), exercise.id).toBe(true);
      expect(exercise.testCases.length, exercise.id).toBeGreaterThan(0);
      for (const concept of exercise.concepts) {
        expect(topicIds.has(concept), `${exercise.id} -> ${concept}`).toBe(true);
      }
    }
  });

  it("keeps projects on real phases, topics, and exercises", () => {
    const exerciseIds = new Set(seedExercises.map((exercise) => exercise.id));
    expect(new Set(seedProjects.map((project) => project.id)).size).toBe(seedProjects.length);
    for (const project of seedProjects) {
      expect(phaseIds.has(project.phaseId), project.id).toBe(true);
      expect(project.milestones.length, project.id).toBeGreaterThan(0);
      expect(project.milestones.every((milestone) => milestone.acceptance.length > 0), project.id).toBe(true);
      for (const concept of project.concepts) {
        expect(topicIds.has(concept), `${project.id} -> ${concept}`).toBe(true);
      }
      if (project.exerciseId) {
        expect(exerciseIds.has(project.exerciseId), project.id).toBe(true);
      }
    }
  });

  it("links each topic's exercises to that topic", () => {
    const exerciseIds = new Set(seedExercises.map((exercise) => exercise.id));
    for (const topic of allTopics) {
      for (const exerciseId of topic.exerciseIds) {
        expect(exerciseIds.has(exerciseId), `${topic.id} -> ${exerciseId}`).toBe(true);
      }
    }
  });
});
