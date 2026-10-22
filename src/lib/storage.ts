import type {
  AppSettings,
  AppState,
  ConceptProgress,
  Difficulty,
  ExerciseProgress,
  Mastery,
  Note,
  PromptCategory,
  PromptState,
  PromptTemplate,
  PromptVariable,
  ProjectProgress,
  ReviewRecord,
  ReviewRating,
  StudySession,
  TopicProgress,
} from "@/lib/types";
import { MASTERY_ORDER, PROMPT_CATEGORIES } from "@/lib/types";
import { DEFAULT_REVIEW_INTERVALS } from "@/lib/review";
import { buildVariablesFromTemplate } from "@/lib/template";

export const SCHEMA_VERSION = 2;
export const STORAGE_KEY = "deep-systems:state:v1";
export const STORAGE_BACKUP_KEY = "deep-systems:invalid-backup";
export const THEME_STORAGE_KEY = "deep-systems:theme";
export const FALLBACK_STORAGE_FLAG = "deep-systems:use-localstorage";

export function createInitialState(now: Date = new Date()): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now.toISOString(),
    settings: {
      platformName: "Deep Systems",
      learnerName: "Learner",
      theme: "system",
      dailyGoalMinutes: 30,
      weeklyGoalMinutes: 180,
      reviewIntervals: [...DEFAULT_REVIEW_INTERVALS],
      sidebarCollapsed: false,
    },
    conceptProgress: {},
    topics: {},
    exercises: {},
    projects: {},
    sessions: [],
    activeSession: null,
    notes: [],
    reviews: {},
    prompts: {
      favorites: [],
      recentIds: [],
      custom: [],
      values: {},
    },
  };
}

type ValidationResult =
  | { ok: true; state: AppState; migratedFrom?: number }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOr(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function validDateOrNow(value: unknown): string {
  if (typeof value === "string" && !Number.isNaN(new Date(value).getTime())) {
    return value;
  }
  return new Date().toISOString();
}

function validMastery(value: unknown): Mastery {
  return typeof value === "string" && MASTERY_ORDER.includes(value as Mastery)
    ? (value as Mastery)
    : "unseen";
}

function validateSettings(value: unknown): AppSettings {
  const raw = isRecord(value) ? value : {};
  const theme =
    raw.theme === "light" || raw.theme === "dark" || raw.theme === "system"
      ? raw.theme
      : "system";
  const intervals = Array.isArray(raw.reviewIntervals)
    ? raw.reviewIntervals
        .map((item) => numberOr(item, 0))
        .filter((item) => item > 0)
        .sort((a, b) => a - b)
    : DEFAULT_REVIEW_INTERVALS;

  return {
    platformName: stringOr(raw.platformName, "Deep Systems").slice(0, 60) || "Deep Systems",
    learnerName: stringOr(raw.learnerName, "Learner").slice(0, 60) || "Learner",
    theme,
    dailyGoalMinutes: Math.min(1440, Math.max(1, numberOr(raw.dailyGoalMinutes, 30))),
    weeklyGoalMinutes: Math.min(10080, Math.max(1, numberOr(raw.weeklyGoalMinutes, 180))),
    reviewIntervals: intervals.length > 0 ? intervals : [...DEFAULT_REVIEW_INTERVALS],
    sidebarCollapsed: raw.sidebarCollapsed === true,
  };
}

function validateTopicProgress(value: unknown): TopicProgress {
  const raw = isRecord(value) ? value : {};
  const lessons = isRecord(raw.lessons)
    ? Object.fromEntries(
        Object.entries(raw.lessons)
          .filter(([, date]) => typeof date === "string")
          .map(([id, date]) => [id, validDateOrNow(date)]),
      )
    : {};
  const evidence = isRecord(raw.evidence) ? raw.evidence : {};
  const assessments: Record<string, boolean> = {};
  if (isRecord(raw.assessments)) {
    for (const [question, value] of Object.entries(raw.assessments)) {
      if (typeof value === "boolean") assessments[question] = value;
    }
  }
  return {
    status: validMastery(raw.status),
    lessons,
    assessments,
    explanation: stringOr(raw.explanation),
    evidence: {
      exerciseIds: stringArray(evidence.exerciseIds),
      quizScore:
        typeof evidence.quizScore === "number" && Number.isFinite(evidence.quizScore)
          ? Math.min(100, Math.max(0, evidence.quizScore))
          : undefined,
    },
    manualOverride: raw.manualOverride === true,
    updatedAt: validDateOrNow(raw.updatedAt),
  };
}

function validateSessions(value: unknown): StudySession[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    if (!stringOr(item.id) || !stringOr(item.topicId)) return [];
    return [
      {
        id: stringOr(item.id),
        topicId: stringOr(item.topicId),
        objective: stringOr(item.objective, "Study"),
        startedAt: validDateOrNow(item.startedAt),
        endedAt: validDateOrNow(item.endedAt),
        durationMinutes: Math.max(0, numberOr(item.durationMinutes, 0)),
        learned: stringOr(item.learned),
        questions: stringOr(item.questions),
        nextActions: stringOr(item.nextActions),
      },
    ];
  });
}

function validateNotes(value: unknown): Note[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || !stringOr(item.id) || !stringOr(item.title)) return [];
    return [
      {
        id: stringOr(item.id),
        topicId: stringOr(item.topicId) || undefined,
        title: stringOr(item.title, "Untitled"),
        content: stringOr(item.content),
        createdAt: validDateOrNow(item.createdAt),
        updatedAt: validDateOrNow(item.updatedAt),
      },
    ];
  });
}

const REVIEW_RATINGS: ReviewRating[] = ["again", "hard", "good", "easy"];

function validateReviews(value: unknown): Record<string, ReviewRecord> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(([topicId, item]) => {
      if (!isRecord(item)) return [];
      const history = Array.isArray(item.history)
        ? item.history.flatMap((event) => {
            if (!isRecord(event) || !REVIEW_RATINGS.includes(event.rating as ReviewRating)) {
              return [];
            }
            return [
              {
                at: validDateOrNow(event.at),
                rating: event.rating as ReviewRating,
                answer: stringOr(event.answer) || undefined,
              },
            ];
          })
        : [];
      return [
        [
          topicId,
          {
            topicId,
            stage: Math.max(0, Math.round(numberOr(item.stage, 0))),
            intervalDays: Math.max(1, numberOr(item.intervalDays, 1)),
            dueAt: validDateOrNow(item.dueAt),
            lastReviewedAt:
              typeof item.lastReviewedAt === "string"
                ? validDateOrNow(item.lastReviewedAt)
                : undefined,
            lapses: Math.max(0, Math.round(numberOr(item.lapses, 0))),
            successfulReviews: Math.max(
              0,
              Math.round(numberOr(item.successfulReviews, 0)),
            ),
            history,
          } satisfies ReviewRecord,
        ],
      ];
    }),
  );
}

function validatePromptVariables(value: unknown): PromptVariable[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || !stringOr(item.key)) return [];
    const type =
      item.type === "textarea" || item.type === "select" ? item.type : "text";
    return [
      {
        key: stringOr(item.key),
        label: stringOr(item.label, stringOr(item.key)),
        type,
        required: item.required !== false,
        options: Array.isArray(item.options) ? stringArray(item.options) : undefined,
        placeholder: stringOr(item.placeholder) || undefined,
        defaultValue: stringOr(item.defaultValue) || undefined,
      },
    ];
  });
}

function validateCustomPrompt(value: unknown): PromptTemplate | null {
  if (!isRecord(value)) return null;
  const template = stringOr(value.template);
  const title = stringOr(value.title);
  if (!template || !title) return null;
  const category = PROMPT_CATEGORIES.includes(value.category as PromptCategory)
    ? (value.category as PromptCategory)
    : "Learn a Concept";
  const difficulty: Difficulty =
    value.difficulty === "beginner" ||
    value.difficulty === "intermediate" ||
    value.difficulty === "advanced"
      ? value.difficulty
      : "intermediate";
  const existing = validatePromptVariables(value.variables);
  const variables = buildVariablesFromTemplate(template, existing);
  return {
    id: stringOr(value.id) || `custom-${Date.now()}`,
    title,
    description: stringOr(value.description),
    category,
    template,
    keywords: stringArray(value.keywords),
    phases: Array.isArray(value.phases)
      ? value.phases.map((phase) => Math.round(numberOr(phase, 0))).filter((phase) => phase >= 1 && phase <= 8)
      : [],
    difficulty,
    variables,
    source: "user",
    createdAt: validDateOrNow(value.createdAt),
  };
}

function validatePrompts(value: unknown): PromptState {
  const raw = isRecord(value) ? value : {};
  return {
    favorites: stringArray(raw.favorites),
    recentIds: stringArray(raw.recentIds).slice(0, 12),
    custom: Array.isArray(raw.custom)
      ? raw.custom
          .map(validateCustomPrompt)
          .filter((prompt): prompt is PromptTemplate => prompt !== null)
      : [],
    values: isRecord(raw.values)
      ? Object.fromEntries(
          Object.entries(raw.values).flatMap(([key, item]) => {
            if (!isRecord(item)) return [];
            const entries = Object.entries(item).filter(
              ([, val]) => typeof val === "string",
            ) as [string, string][];
            return [[key, Object.fromEntries(entries)]];
          }),
        )
      : {},
  };
}

function validateConceptProgress(value: unknown): Record<string, ConceptProgress> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(([id, item]) => {
      if (typeof item === "boolean") {
        const now = new Date().toISOString();
        return [[id, { completedAt: now, updatedAt: now } satisfies ConceptProgress]];
      }
      if (!isRecord(item)) return [];
      return [
        [
          id,
          {
            completedAt: validDateOrNow(item.completedAt),
            updatedAt: validDateOrNow(item.updatedAt),
          } satisfies ConceptProgress,
        ],
      ];
    }),
  );
}

function validateExercises(value: unknown): Record<string, ExerciseProgress> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(([id, item]) => {
      if (!isRecord(item)) return [];
      const status =
        item.status === "in-progress" || item.status === "completed"
          ? item.status
          : "not-started";
      return [
        [
          id,
          {
            status,
            notes: stringOr(item.notes),
            completedAt:
              status === "completed" ? validDateOrNow(item.completedAt) : undefined,
            updatedAt: validDateOrNow(item.updatedAt),
          } satisfies ExerciseProgress,
        ],
      ];
    }),
  );
}

function validateProjects(value: unknown): Record<string, ProjectProgress> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(([id, item]) => {
      if (!isRecord(item)) return [];
      return [
        [
          id,
          {
            completedMilestones: stringArray(item.completedMilestones),
            notes: stringOr(item.notes),
            updatedAt: validDateOrNow(item.updatedAt),
          } satisfies ProjectProgress,
        ],
      ];
    }),
  );
}

function validateTopics(value: unknown): Record<string, TopicProgress> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([id, item]) => [id, validateTopicProgress(item)]),
  );
}

function validateActiveSession(value: unknown): AppState["activeSession"] {
  if (!isRecord(value)) return null;
  const topicId = stringOr(value.topicId);
  if (!topicId) return null;
  return {
    id: stringOr(value.id) || `session-${Date.now()}`,
    topicId,
    objective: stringOr(value.objective, "Study"),
    startedAt: validDateOrNow(value.startedAt),
  };
}

export function migrateRaw(raw: unknown): ValidationResult {
  if (!isRecord(raw)) {
    return { ok: false, error: "Stored data is not a JSON object." };
  }
  const rawVersion =
    typeof raw.schemaVersion === "number" ? raw.schemaVersion : 0;
  if (rawVersion > SCHEMA_VERSION) {
    return {
      ok: false,
      error: `This data was created by a newer version (schema ${rawVersion}).`,
    };
  }

  const base = createInitialState();
  const candidate: AppState = {
    ...base,
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    createdAt: validDateOrNow(raw.createdAt),
    settings: validateSettings(raw.settings),
    conceptProgress: validateConceptProgress(raw.conceptProgress),
    topics: validateTopics(raw.topics),
    exercises: validateExercises(raw.exercises),
    projects: validateProjects(raw.projects),
    sessions: validateSessions(raw.sessions),
    activeSession: validateActiveSession(raw.activeSession),
    notes: validateNotes(raw.notes),
    reviews: validateReviews(raw.reviews),
    prompts: validatePrompts(raw.prompts),
  };

  return {
    ok: true,
    state: candidate,
    migratedFrom: rawVersion < SCHEMA_VERSION ? rawVersion : undefined,
  };
}

export function parseStateJson(text: string): ValidationResult {
  try {
    return migrateRaw(JSON.parse(text));
  } catch {
    return { ok: false, error: "The file is not valid JSON." };
  }
}

export function serializeState(state: AppState): string {
  return JSON.stringify({ ...state, schemaVersion: SCHEMA_VERSION }, null, 2);
}

export interface LoadResult {
  state: AppState;
  error?: string;
  migratedFrom?: number;
  storageKind: string;
}

export interface StateStorage {
  kind: string;
  load(): Promise<LoadResult>;
  save(state: AppState): Promise<void>;
  clear(): Promise<void>;
}

function backupInvalid(raw: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(raw));
  } catch {
    // A full or unavailable localStorage must not break the app.
  }
}

class IndexedDbStorage implements StateStorage {
  kind = "IndexedDB";
  private dbName = "deep-systems";
  private storeName = "state";
  private key = "app";

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
    });
  }

  private async withStore<T>(
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const db = await this.open();
    try {
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction(this.storeName, mode);
        const request = run(tx.objectStore(this.storeName));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
      });
    } finally {
      db.close();
    }
  }

  async load(): Promise<LoadResult> {
    try {
      const raw = await this.withStore<unknown>("readonly", (store) =>
        store.get(this.key),
      );
      if (raw === undefined || raw === null) {
        return { state: createInitialState(), storageKind: this.kind };
      }
      const result = migrateRaw(raw);
      if (!result.ok) {
        backupInvalid(raw);
        return {
          state: createInitialState(),
          error: `${result.error} A backup of the invalid data was kept in local storage.`,
          storageKind: this.kind,
        };
      }
      return {
        state: result.state,
        migratedFrom: result.migratedFrom,
        storageKind: this.kind,
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error("IndexedDB read failed");
    }
  }

  async save(state: AppState): Promise<void> {
    await this.withStore("readwrite", (store) => store.put(state, this.key));
  }

  async clear(): Promise<void> {
    await this.withStore("readwrite", (store) => store.delete(this.key));
  }
}

class LocalStorageStorage implements StateStorage {
  kind = "localStorage";

  async load(): Promise<LoadResult> {
    const rawText = window.localStorage.getItem(STORAGE_KEY);
    if (!rawText) {
      return { state: createInitialState(), storageKind: this.kind };
    }
    const result = parseStateJson(rawText);
    if (!result.ok) {
      backupInvalid(rawText);
      return {
        state: createInitialState(),
        error: `${result.error} A backup of the invalid data was kept in local storage.`,
        storageKind: this.kind,
      };
    }
    return {
      state: result.state,
      migratedFrom: result.migratedFrom,
      storageKind: this.kind,
    };
  }

  async save(state: AppState): Promise<void> {
    window.localStorage.setItem(STORAGE_KEY, serializeState(state));
  }

  async clear(): Promise<void> {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

class ResilientStorage implements StateStorage {
  kind = "IndexedDB";
  private primary = new IndexedDbStorage();
  private fallback = new LocalStorageStorage();
  private active: StateStorage = this.primary;

  async load(): Promise<LoadResult> {
    const preferFallback =
      window.localStorage.getItem(FALLBACK_STORAGE_FLAG) === "1";
    if (!preferFallback) {
      try {
        const result = await this.primary.load();
        this.active = this.primary;
        return result;
      } catch {
        // Fall through to localStorage.
      }
    }
    const result = await this.fallback.load();
    this.active = this.fallback;
    try {
      window.localStorage.setItem(FALLBACK_STORAGE_FLAG, "1");
    } catch {
      // The flag is an optimization, not a requirement.
    }
    return {
      ...result,
      storageKind: "localStorage (IndexedDB unavailable)",
      error:
        result.error ??
        "IndexedDB could not be used; progress is saved in localStorage instead.",
    };
  }

  async save(state: AppState): Promise<void> {
    try {
      await this.active.save(state);
    } catch (error) {
      if (this.active === this.primary) {
        this.active = this.fallback;
        try {
          window.localStorage.setItem(FALLBACK_STORAGE_FLAG, "1");
        } catch {
          // Continue with the save attempt.
        }
        await this.fallback.save(state);
        return;
      }
      throw error;
    }
  }

  async clear(): Promise<void> {
    await Promise.allSettled([
      this.primary.clear(),
      this.fallback.clear(),
    ]);
    try {
      window.localStorage.removeItem(FALLBACK_STORAGE_FLAG);
    } catch {
      // Nothing else to clear.
    }
  }
}

export function createBrowserStorage(): StateStorage {
  if (typeof indexedDB !== "undefined") return new ResilientStorage();
  return new LocalStorageStorage();
}
