export const CONCEPT_CATEGORY_IDS = [
  "foundations",
  "go",
  "algorithms",
  "architecture",
  "memory",
  "compilers",
  "os",
  "concurrency",
  "networking",
  "performance",
] as const;

export type ConceptCategoryId = (typeof CONCEPT_CATEGORY_IDS)[number];

export const CONCEPT_DIFFICULTIES = [
  "foundational",
  "intermediate",
  "advanced",
] as const;

export type ConceptDifficulty = (typeof CONCEPT_DIFFICULTIES)[number];

export interface ConceptCategory {
  id: ConceptCategoryId;
  order: number;
  title: string;
  description: string;
}

export interface ConceptExercise {
  id: string;
  title: string;
  problem: string;
  objectives: string[];
  requirements: string[];
  acceptanceCriteria: string[];
  testCases: string[];
  difficulty: ConceptDifficulty;
  hints: string[];
  solution: string;
}

export type ExerciseInput = Omit<ConceptExercise, "id">;

export interface ProjectReference {
  projectId: string;
  milestoneId: string;
  note: string;
}

export interface PromptSpec {
  model: string;
  formal: string;
  internals: string;
  example: string;
  connections: string;
  mistakes: string;
  practice: string;
}

export interface ConceptSeed {
  id: string;
  categoryId: ConceptCategoryId;
  order: number;
  name: string;
  description: string;
  difficulty: ConceptDifficulty;
  prerequisiteIds: string[];
  relatedIds: string[];
  promptSpec: PromptSpec;
  exercises: ConceptExercise[];
  projectRefs: ProjectReference[];
}

export interface LearningConcept extends Omit<ConceptSeed, "promptSpec"> {
  prompt: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  acceptanceCriteria: string[];
}

export interface LearningProject {
  id: string;
  title: string;
  summary: string;
  purpose: string;
  difficulty: ConceptDifficulty;
  prerequisiteConceptIds: string[];
  conceptIds: string[];
  requirements: string[];
  constraints: string[];
  milestones: ProjectMilestone[];
  acceptanceCriteria: string[];
  suggestedTests: string[];
  extensions: string[];
}

export interface ConceptInput
  extends Omit<ConceptSeed, "promptSpec" | "exercises">,
    PromptSpec {
  exercises: ExerciseInput[];
}

export function ex(
  title: string,
  problem: string,
  objectives: string[],
  requirements: string[],
  acceptanceCriteria: string[],
  testCases: string[],
  difficulty: ConceptDifficulty,
  hints: string[],
  solution: string,
): ExerciseInput {
  return {
    title,
    problem,
    objectives,
    requirements,
    acceptanceCriteria,
    testCases,
    difficulty,
    hints,
    solution,
  };
}

export function ref(
  projectId: string,
  milestoneId: string,
  note: string,
): ProjectReference {
  return { projectId, milestoneId, note };
}

export function concept(input: ConceptInput): ConceptSeed {
  const {
    model,
    formal,
    internals,
    example,
    connections,
    mistakes,
    practice,
    exercises,
    ...rest
  } = input;

  return {
    ...rest,
    promptSpec: { model, formal, internals, example, connections, mistakes, practice },
    exercises: exercises.map((exercise, index) => ({
      ...exercise,
      id: `${input.id}-exercise-${index + 1}`,
    })),
  };
}

function resolveNames(
  ids: string[],
  concepts: Map<string, ConceptSeed>,
  ownerId: string,
): string[] {
  return ids.map((id) => {
    const concept = concepts.get(id);
    if (!concept) {
      throw new Error(`Unknown concept reference "${id}" from "${ownerId}"`);
    }
    return concept.name;
  });
}

function buildPrompt(
  seed: ConceptSeed,
  category: ConceptCategory,
  prerequisiteNames: string[],
  relatedNames: string[],
): string {
  const prerequisites =
    prerequisiteNames.length > 0
      ? prerequisiteNames.join(", ")
      : "basic programming comfort";
  const related = relatedNames.length > 0 ? relatedNames.join(", ") : "none listed";
  const firstExercise = seed.exercises[0];

  return [
    `You are an expert computer-science tutor teaching ${seed.name} in the ${category.title} stage of a Go and systems-engineering roadmap.`,
    `My learning objective: ${seed.description}`,
    `Assume I already understand: ${prerequisites}. Do not skip steps or hand-wave.`,
    "",
    "Teach the concept in this order:",
    `1. Intuitive mental model: ${seed.promptSpec.model}`,
    `2. Precise technical model: ${seed.promptSpec.formal}`,
    `3. Internal execution: ${seed.promptSpec.internals}`,
    `4. Worked example: ${seed.promptSpec.example}`,
    `5. Connections: ${seed.promptSpec.connections} Related concepts: ${related}.`,
    `6. Misconceptions: ${seed.promptSpec.mistakes}`,
    "7. Socratic checks: ask me one prediction question, one tracing question, and one design question. Wait for each answer before revealing the explanation.",
    `8. Practice: ${firstExercise.title} — ${firstExercise.problem}`,
    "",
    "Rules: use Go examples where they clarify the idea, define every term, show exact inputs and outputs, and finish with a short mastery checklist. If my answer is wrong, diagnose the specific mental-model error instead of only giving the answer.",
  ].join("\n");
}

export function finalizeConcepts(
  seeds: ConceptSeed[],
  categories: ConceptCategory[],
): LearningConcept[] {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const conceptMap = new Map(seeds.map((seed) => [seed.id, seed]));

  return seeds.map((seed) => {
    const category = categoryMap.get(seed.categoryId);
    if (!category) {
      throw new Error(`Unknown category "${seed.categoryId}" for "${seed.id}"`);
    }

    return {
      ...seed,
      prompt: buildPrompt(
        seed,
        category,
        resolveNames(seed.prerequisiteIds, conceptMap, seed.id),
        resolveNames(seed.relatedIds, conceptMap, seed.id),
      ),
    };
  });
}
