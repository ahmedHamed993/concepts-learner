import { algorithmConcepts } from "./algorithms";
import { architectureConcepts } from "./architecture";
import { compilerConcepts } from "./compilers";
import { concurrencyConcepts } from "./concurrency";
import { foundationConcepts } from "./foundations";
import { goConcepts } from "./go";
import { memoryConcepts } from "./memory";
import { networkingConcepts } from "./networking";
import { osConcepts } from "./os";
import { performanceConcepts } from "./performance";
import { learningProjects } from "./projects";
import {
  finalizeConcepts,
  type ConceptCategory,
  type ConceptCategoryId,
  type LearningConcept,
  type LearningProject,
  type ProjectMilestone,
} from "./types";

export * from "./types";
export { learningProjects } from "./projects";

export const conceptCategories: ConceptCategory[] = [
  {
    id: "foundations",
    order: 1,
    title: "Programming Fundamentals",
    description:
      "Execution, values, control flow, functions, errors, testing, and code organization.",
  },
  {
    id: "go",
    order: 2,
    title: "Go Programming",
    description:
      "Language semantics, tooling, data modeling, concurrency, runtime behavior, and performance.",
  },
  {
    id: "algorithms",
    order: 3,
    title: "Data Structures and Algorithms",
    description:
      "Complexity, concrete data structures, algorithm design, graphs, and problem-solving patterns.",
  },
  {
    id: "architecture",
    order: 4,
    title: "Computer Architecture and Data Representation",
    description:
      "Bits, logic, instruction sets, pipelines, caches, memory hierarchies, and CPU performance.",
  },
  {
    id: "memory",
    order: 5,
    title: "Memory and Runtime Internals",
    description:
      "Address spaces, allocation, virtual memory, garbage collection, and runtime systems.",
  },
  {
    id: "compilers",
    order: 6,
    title: "Compilers and Language Internals",
    description:
      "Lexing, parsing, ASTs, type checking, intermediate representations, optimization, and code generation.",
  },
  {
    id: "os",
    order: 7,
    title: "Operating Systems",
    description:
      "Processes, scheduling, synchronization, files, I/O, virtualization, and systems observability.",
  },
  {
    id: "concurrency",
    order: 8,
    title: "Concurrency and Systems Programming",
    description:
      "Execution models, data races, memory ordering, synchronization primitives, and process-level systems interfaces.",
  },
  {
    id: "networking",
    order: 9,
    title: "Networking and Backend Systems",
    description:
      "Packets, protocols, sockets, HTTP, backend services, reliability, distributed coordination, and observability.",
  },
  {
    id: "performance",
    order: 10,
    title: "Performance, Testing, and Production Engineering",
    description:
      "Benchmarking, profiling, reliability objectives, failure engineering, and safe production releases.",
  },
];

const EXPECTED_CATEGORY_COUNTS: Record<ConceptCategoryId, number> = {
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

const seeds = [
  ...foundationConcepts,
  ...goConcepts,
  ...algorithmConcepts,
  ...architectureConcepts,
  ...memoryConcepts,
  ...compilerConcepts,
  ...osConcepts,
  ...concurrencyConcepts,
  ...networkingConcepts,
  ...performanceConcepts,
];

const categoryOrder = new Map(
  conceptCategories.map((category) => [category.id, category.order]),
);

export const concepts: LearningConcept[] = finalizeConcepts(seeds, conceptCategories).sort(
  (a, b) =>
    (categoryOrder.get(a.categoryId) ?? 0) -
      (categoryOrder.get(b.categoryId) ?? 0) || a.order - b.order,
);

export const categoryById = new Map(
  conceptCategories.map((category) => [category.id, category]),
);

export const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));

export const projectById = new Map(
  learningProjects.map((project) => [project.id, project]),
);

export function getConcept(id: string | undefined): LearningConcept | undefined {
  return id ? conceptById.get(id) : undefined;
}

export function getProject(id: string | undefined): LearningProject | undefined {
  return id ? projectById.get(id) : undefined;
}

export function getProjectMilestone(
  projectId: string,
  milestoneId: string,
): { project: LearningProject; milestone: ProjectMilestone } | undefined {
  const project = projectById.get(projectId);
  const milestone = project?.milestones.find((item) => item.id === milestoneId);
  if (!project || !milestone) return undefined;
  return { project, milestone };
}

export function conceptsByCategory(categoryId: ConceptCategoryId): LearningConcept[] {
  return concepts.filter((concept) => concept.categoryId === categoryId);
}

export function filterConcepts(
  query: string,
  categoryId: ConceptCategoryId | "all",
  source: LearningConcept[] = concepts,
): LearningConcept[] {
  const needle = query.trim().toLowerCase();
  return source.filter((concept) => {
    if (categoryId !== "all" && concept.categoryId !== categoryId) return false;
    if (!needle) return true;
    const haystack = `${concept.name} ${concept.description}`.toLowerCase();
    return haystack.includes(needle);
  });
}

export function validateCurriculum(): void {
  const errors: string[] = [];

  if (conceptCategories.length !== 10) {
    errors.push(`Expected 10 categories, found ${conceptCategories.length}`);
  }

  const categoryIds = new Set<string>();
  for (const category of conceptCategories) {
    if (categoryIds.has(category.id)) {
      errors.push(`Duplicate category id "${category.id}"`);
    }
    categoryIds.add(category.id);
  }

  const conceptIds = new Set<string>();
  const categoryOrders = new Map<ConceptCategoryId, Set<number>>();
  const rankById = new Map(
    seeds.map((concept) => [
      concept.id,
      (categoryById.get(concept.categoryId)?.order ?? 0) * 1000 + concept.order,
    ]),
  );

  for (const concept of seeds) {
    if (conceptIds.has(concept.id)) {
      errors.push(`Duplicate concept id "${concept.id}"`);
    }
    conceptIds.add(concept.id);

    if (!categoryById.has(concept.categoryId)) {
      errors.push(`Concept "${concept.id}" has unknown category "${concept.categoryId}"`);
      continue;
    }

    if (!Number.isInteger(concept.order) || concept.order < 1) {
      errors.push(`Concept "${concept.id}" has invalid order ${concept.order}`);
    }

    const orders = categoryOrders.get(concept.categoryId) ?? new Set<number>();
    if (orders.has(concept.order)) {
      errors.push(
        `Category "${concept.categoryId}" has duplicate order ${concept.order} at "${concept.id}"`,
      );
    }
    orders.add(concept.order);
    categoryOrders.set(concept.categoryId, orders);

    const conceptRank = rankById.get(concept.id) ?? 0;
    for (const prerequisiteId of concept.prerequisiteIds) {
      const prerequisiteRank = rankById.get(prerequisiteId);
      if (prerequisiteRank !== undefined && prerequisiteRank >= conceptRank) {
        errors.push(
          `Concept "${concept.id}" lists "${prerequisiteId}" as a prerequisite but it does not come earlier in the curriculum`,
        );
      }
    }

    const promptFields = Object.values(concept.promptSpec);
    if (promptFields.some((field) => field.trim().length === 0)) {
      errors.push(`Concept "${concept.id}" has an empty prompt section`);
    }

    if (concept.exercises.length < 2) {
      errors.push(`Concept "${concept.id}" has fewer than two exercises`);
    }
    for (const exercise of concept.exercises) {
      if (
        exercise.title.trim().length === 0 ||
        exercise.problem.trim().length === 0 ||
        exercise.objectives.length === 0 ||
        exercise.requirements.length === 0 ||
        exercise.acceptanceCriteria.length === 0 ||
        exercise.testCases.length === 0 ||
        exercise.hints.length === 0 ||
        exercise.solution.trim().length === 0
      ) {
        errors.push(`Exercise "${exercise.id}" is incomplete`);
      }
    }
    if (concept.projectRefs.length === 0) {
      errors.push(`Concept "${concept.id}" has no project references`);
    }
    for (const reference of concept.projectRefs) {
      if (reference.note.trim().length === 0) {
        errors.push(`Concept "${concept.id}" has a project reference without a note`);
      }
    }
  }

  for (const [categoryId, expected] of Object.entries(EXPECTED_CATEGORY_COUNTS)) {
    const actual = seeds.filter((concept) => concept.categoryId === categoryId).length;
    if (actual !== expected) {
      errors.push(
        `Category "${categoryId}" expected ${expected} concepts, found ${actual}`,
      );
    }

    const orders = [...(categoryOrders.get(categoryId as ConceptCategoryId) ?? [])].sort(
      (a, b) => a - b,
    );
    for (let index = 0; index < orders.length; index += 1) {
      if (orders[index] !== index + 1) {
        errors.push(
          `Category "${categoryId}" orders must be contiguous from 1; found ${orders.join(", ")}`,
        );
        break;
      }
    }
  }

  const checkIds = (owner: string, label: string, ids: string[]) => {
    for (const id of ids) {
      if (!conceptIds.has(id)) {
        errors.push(`${owner} references unknown ${label} "${id}"`);
      }
    }
  };

  for (const concept of seeds) {
    checkIds(`Concept "${concept.id}"`, "prerequisite", concept.prerequisiteIds);
    checkIds(`Concept "${concept.id}"`, "related concept", concept.relatedIds);

    for (const reference of concept.projectRefs) {
      const project = learningProjects.find((item) => item.id === reference.projectId);
      if (!project) {
        errors.push(
          `Concept "${concept.id}" references unknown project "${reference.projectId}"`,
        );
        continue;
      }
      if (!project.milestones.some((item) => item.id === reference.milestoneId)) {
        errors.push(
          `Concept "${concept.id}" references unknown milestone "${reference.milestoneId}" in "${project.id}"`,
        );
      }
    }
  }

  const projectIds = new Set<string>();
  for (const project of learningProjects) {
    if (projectIds.has(project.id)) {
      errors.push(`Duplicate project id "${project.id}"`);
    }
    projectIds.add(project.id);

    checkIds(`Project "${project.id}"`, "concept", project.conceptIds);
    checkIds(
      `Project "${project.id}"`,
      "prerequisite concept",
      project.prerequisiteConceptIds,
    );

    const milestoneIds = new Set<string>();
    for (const milestone of project.milestones) {
      if (milestoneIds.has(milestone.id)) {
        errors.push(
          `Project "${project.id}" has duplicate milestone id "${milestone.id}"`,
        );
      }
      milestoneIds.add(milestone.id);
      if (
        milestone.title.trim().length === 0 ||
        milestone.description.trim().length === 0 ||
        milestone.requirements.length === 0 ||
        milestone.acceptanceCriteria.length === 0
      ) {
        errors.push(`Project "${project.id}" has an incomplete milestone "${milestone.id}"`);
      }
    }
    if (
      project.title.trim().length === 0 ||
      project.summary.trim().length === 0 ||
      project.purpose.trim().length === 0 ||
      project.requirements.length === 0 ||
      project.constraints.length === 0 ||
      project.acceptanceCriteria.length === 0 ||
      project.suggestedTests.length === 0 ||
      project.extensions.length === 0
    ) {
      errors.push(`Project "${project.id}" is incomplete`);
    }
    if (project.milestones.length === 0) {
      errors.push(`Project "${project.id}" has no milestones`);
    }
    if (
      !seeds.some((concept) =>
        concept.projectRefs.some((reference) => reference.projectId === project.id),
      )
    ) {
      errors.push(`Project "${project.id}" is not referenced by any concept`);
    }
  }

  const graph = new Map<string, string[]>(
    seeds.map((concept) => [concept.id, concept.prerequisiteIds]),
  );
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string, path: string[]) => {
    if (visiting.has(id)) {
      errors.push(`Prerequisite cycle: ${[...path, id].join(" -> ")}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const prerequisite of graph.get(id) ?? []) {
      if (graph.has(prerequisite)) {
        visit(prerequisite, [...path, id]);
      }
    }
    visiting.delete(id);
    visited.add(id);
  };

  for (const id of graph.keys()) visit(id, []);

  if (errors.length > 0) {
    throw new Error(`Invalid curriculum:\n- ${errors.join("\n- ")}`);
  }
}

validateCurriculum();
