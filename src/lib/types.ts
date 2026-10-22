export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Mastery =
  | "unseen"
  | "learning"
  | "practicing"
  | "understood"
  | "mastered";

export const MASTERY_ORDER: Mastery[] = [
  "unseen",
  "learning",
  "practicing",
  "understood",
  "mastered",
];

export const MASTERY_LABELS: Record<Mastery, string> = {
  unseen: "Not started",
  learning: "Learning",
  practicing: "Practiced",
  understood: "Understood",
  mastered: "Mastered",
};

export type ThemeMode = "light" | "dark" | "system";

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
}

export interface CodeExample {
  language: "go" | "asm" | "text" | "c";
  caption: string;
  code: string;
}

export interface TraceStep {
  step: string;
  detail: string;
}

export interface TopicContent {
  what: string;
  why: string;
  mentalModel: string;
  precise: string;
  connections: string;
  misconceptions: string[];
  trace: TraceStep[];
  assessment: string[];
}

export interface Topic {
  id: string;
  phaseId: string;
  order: number;
  title: string;
  definition: string;
  summary: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  keywords: string[];
  aliases: string[];
  prerequisites: string[];
  related: string[];
  objectives: string[];
  lessons: Lesson[];
  content: TopicContent;
  codeExamples: CodeExample[];
  exerciseIds: string[];
  promptIds: string[];
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  tagline: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  completionCriteria: string[];
  estimatedWeeks: number;
  keywords: string[];
  projectIdea: string;
  topics: Topic[];
}

export type PromptCategory =
  | "Learn a Concept"
  | "Socratic Tutor"
  | "Predict the Output"
  | "Code Tracing"
  | "Debugging"
  | "Code Review"
  | "Algorithms and Complexity"
  | "Memory and Pointers"
  | "CPU and Assembly"
  | "Compiler Internals"
  | "Operating Systems"
  | "Go Concurrency"
  | "Performance and Profiling"
  | "Project Planning"
  | "Quiz and Exam Preparation"
  | "Spaced Repetition"
  | "Explain My Own Code";

export const PROMPT_CATEGORIES: PromptCategory[] = [
  "Learn a Concept",
  "Socratic Tutor",
  "Predict the Output",
  "Code Tracing",
  "Debugging",
  "Code Review",
  "Algorithms and Complexity",
  "Memory and Pointers",
  "CPU and Assembly",
  "Compiler Internals",
  "Operating Systems",
  "Go Concurrency",
  "Performance and Profiling",
  "Project Planning",
  "Quiz and Exam Preparation",
  "Spaced Repetition",
  "Explain My Own Code",
];

export interface PromptVariable {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: PromptCategory;
  template: string;
  keywords: string[];
  phases: number[];
  difficulty: Difficulty;
  variables: PromptVariable[];
  source: "seed" | "user";
  createdAt?: string;
}

export interface TestCase {
  name: string;
  expectation: string;
}

export interface Exercise {
  id: string;
  phaseId: string;
  title: string;
  instructions: string;
  prerequisites: string[];
  difficulty: Difficulty;
  estimatedMinutes: number;
  testCases: TestCase[];
  hints: string[];
  solutionNotes: string;
  concepts: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  acceptance: string[];
}

export interface Project {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedHours: number;
  milestones: Milestone[];
  acceptanceCriteria: string[];
  concepts: string[];
  exerciseId?: string;
}

export type ExerciseStatus = "not-started" | "in-progress" | "completed";

export interface TopicProgress {
  status: Mastery;
  lessons: Record<string, string>;
  assessments: Record<string, boolean>;
  explanation: string;
  evidence: {
    exerciseIds: string[];
    quizScore?: number;
  };
  manualOverride: boolean;
  updatedAt: string;
}

export interface ConceptProgress {
  completedAt: string;
  updatedAt: string;
}

export interface ExerciseProgress {
  status: ExerciseStatus;
  notes: string;
  completedAt?: string;
  updatedAt: string;
}

export interface ProjectProgress {
  completedMilestones: string[];
  notes: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  topicId: string;
  objective: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  learned: string;
  questions: string;
  nextActions: string;
}

export interface ActiveSession {
  id: string;
  topicId: string;
  objective: string;
  startedAt: string;
}

export interface Note {
  id: string;
  topicId?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface ReviewEvent {
  at: string;
  rating: ReviewRating;
  answer?: string;
}

export interface ReviewRecord {
  topicId: string;
  stage: number;
  intervalDays: number;
  dueAt: string;
  lastReviewedAt?: string;
  lapses: number;
  successfulReviews: number;
  history: ReviewEvent[];
}

export interface PromptState {
  favorites: string[];
  recentIds: string[];
  custom: PromptTemplate[];
  values: Record<string, Record<string, string>>;
}

export interface AppSettings {
  platformName: string;
  learnerName: string;
  theme: ThemeMode;
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
  reviewIntervals: number[];
  sidebarCollapsed: boolean;
}

export interface AppState {
  schemaVersion: number;
  createdAt: string;
  settings: AppSettings;
  conceptProgress: Record<string, ConceptProgress>;
  topics: Record<string, TopicProgress>;
  exercises: Record<string, ExerciseProgress>;
  projects: Record<string, ProjectProgress>;
  sessions: StudySession[];
  activeSession: ActiveSession | null;
  notes: Note[];
  reviews: Record<string, ReviewRecord>;
  prompts: PromptState;
}


export type PhaseProgress = {
  phaseId: string;
  percent: number;
  completedLessons: number;
  totalLessons: number;
  startedTopics: number;
  masteredTopics: number;
  totalTopics: number;
};

export type NextLesson = {
  phase: Phase;
  topic: Topic;
  lesson: Lesson | null;
} | null;
