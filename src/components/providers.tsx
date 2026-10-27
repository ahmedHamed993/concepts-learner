"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ActiveSession,
  AppSettings,
  AppState,
  ExerciseStatus,
  Mastery,
  Note,
  PromptTemplate,
  ReviewRating,
  StudySession,
} from "@/lib/types";
import {
  createInitialState,
  createBrowserStorage,
  parseStateJson,
  serializeState,
  THEME_STORAGE_KEY,
  type StateStorage,
} from "@/lib/storage";
import { isFirebaseConfigured } from "@/lib/firebase";
import { FirestoreStorage } from "@/lib/firestore-storage";
import { createReviewRecord, scheduleReview } from "@/lib/review";
import { emptyTopicProgress } from "@/lib/progress";
import { uid } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: string; message: string; variant: ToastVariant };

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((items) => items.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = uid("toast");
      setToasts((items) => [...items.slice(-2), { id, message, variant }]);
      const timer = setTimeout(() => dismiss(id), 3500);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={[
              "pointer-events-auto flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm shadow-lg backdrop-blur",
              item.variant === "success"
                ? "border-primary/30 bg-primary/10 text-foreground"
                : item.variant === "error"
                  ? "border-danger/40 bg-danger/10 text-foreground"
                  : "border-border bg-surface text-foreground",
            ].join(" ")}
            role="status"
          >
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
            <span className="flex-1 leading-5">{item.message}</span>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="text-muted transition hover:text-foreground"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

type AppContextValue = {
  state: AppState;
  ready: boolean;
  storageError: string | null;
  storageKind: string;
  dismissStorageError: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setConceptCompleted: (conceptId: string, completed: boolean) => void;
  setTopicStatus: (
    topicId: string,
    status: Mastery,
    options?: { manualOverride?: boolean },
  ) => void;
  setTopicExplanation: (topicId: string, explanation: string) => void;
  setQuizScore: (topicId: string, score: number | undefined) => void;
  toggleLesson: (topicId: string, lessonId: string, done: boolean) => void;
  toggleAssessment: (topicId: string, question: string, done: boolean) => void;
  setExerciseStatus: (exerciseId: string, status: ExerciseStatus) => void;
  setExerciseNotes: (exerciseId: string, notes: string) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  setProjectNotes: (projectId: string, notes: string) => void;
  startSession: (topicId: string, objective: string) => void;
  finishSession: (input: {
    learned: string;
    questions: string;
    nextActions: string;
    durationMinutes?: number;
  }) => void;
  cancelSession: () => void;
  deleteSession: (id: string) => void;
  addNote: (input: { title: string; content: string; topicId?: string }) => Note;
  updateNote: (id: string, input: { title: string; content: string; topicId?: string }) => void;
  deleteNote: (id: string) => void;
  submitReview: (topicId: string, rating: ReviewRating, answer: string) => void;
  toggleFavorite: (promptId: string) => void;
  recordPromptUse: (promptId: string) => void;
  saveCustomPrompt: (prompt: PromptTemplate) => void;
  deleteCustomPrompt: (id: string) => void;
  setPromptValues: (promptId: string, values: Record<string, string>) => void;
  importState: (text: string) => { ok: boolean; error?: string; state?: AppState };
  exportState: () => string;
  resetAll: () => AppState;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}

function applyTheme(theme: AppSettings["theme"]) {
  if (typeof window === "undefined") return;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme mirroring is a convenience only.
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Deterministic placeholder for prerendering; the real state loads from storage in an effect.
  const [state, setState] = useState<AppState>(() => createInitialState(new Date(0)));
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [storageKind, setStorageKind] = useState("local");
  const storageRef = useRef<StateStorage | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    // Prefer Firestore when Firebase is configured; fall back to IndexedDB/localStorage.
    // The anonymous user ID is stable per browser via localStorage.
    const createStorage = (): StateStorage => {
      if (isFirebaseConfigured()) {
        let userId = "";
        try {
          userId = window.localStorage.getItem("deep-systems:firebase-uid") ?? "";
          if (!userId) {
            userId = `anon-${Math.random().toString(36).slice(2)}`;
            window.localStorage.setItem("deep-systems:firebase-uid", userId);
          }
        } catch {
          userId = "anon-default";
        }
        return new FirestoreStorage(userId);
      }
      return createBrowserStorage();
    };

    const storage = createStorage();
    storageRef.current = storage;
    storage
      .load()
      .then((result) => {
        if (cancelled) return;
        setState(result.state);
        setStorageKind(result.storageKind);
        setReady(true);
        if (result.error) setStorageError(result.error);
        else if (result.migratedFrom !== undefined) {
          toast("Local data was migrated to the current schema.", "info");
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const fallback = createInitialState();
        setState(fallback);
        setStorageKind("unavailable");
        setReady(true);
        setStorageError(
          error instanceof Error
            ? `Could not open storage: ${error.message}`
            : "Could not open storage.",
        );
      });
    return () => {
      cancelled = true;
    };
    // The toast function is stable for the lifetime of the provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !storageRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      storageRef.current
        ?.save(state)
        .catch((error: unknown) => {
          setStorageError(
            error instanceof Error
              ? `Changes could not be saved: ${error.message}`
              : "Changes could not be saved to local storage.",
          );
        });
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, ready]);

  useEffect(() => {
    applyTheme(state.settings.theme);
    if (state.settings.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [state.settings.theme]);

  useEffect(() => {
    if (!ready) return;
    document.title = `${state.settings.platformName} · Personal CS Workspace`;
  }, [ready, state.settings.platformName]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }));
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, sidebarCollapsed: collapsed },
    }));
  }, []);

  const setConceptCompleted = useCallback(
    (conceptId: string, completed: boolean) => {
      setState((current) => {
        const now = new Date().toISOString();
        const conceptProgress = { ...current.conceptProgress };
        if (completed) {
          conceptProgress[conceptId] = {
            completedAt: conceptProgress[conceptId]?.completedAt ?? now,
            updatedAt: now,
          };
        } else {
          delete conceptProgress[conceptId];
        }
        return { ...current, conceptProgress };
      });
    },
    [],
  );

  const setTopicStatus = useCallback(
    (topicId: string, status: Mastery, options?: { manualOverride?: boolean }) => {
      setState((current) => {
        const now = new Date().toISOString();
        const progress = current.topics[topicId] ?? emptyTopicProgress(now);
        const shouldSchedule = status !== "unseen";
        const reviews =
          shouldSchedule && !current.reviews[topicId]
            ? {
                ...current.reviews,
                [topicId]: createReviewRecord(
                  topicId,
                  current.settings.reviewIntervals,
                  new Date(now),
                ),
              }
            : current.reviews;
        return {
          ...current,
          topics: {
            ...current.topics,
            [topicId]: {
              ...progress,
              status,
              manualOverride:
                options?.manualOverride ?? progress.manualOverride,
              updatedAt: now,
            },
          },
          reviews,
        };
      });
    },
    [],
  );

  const setTopicExplanation = useCallback((topicId: string, explanation: string) => {
    setState((current) => {
      const now = new Date().toISOString();
      const progress = current.topics[topicId] ?? emptyTopicProgress(now);
      return {
        ...current,
        topics: {
          ...current.topics,
          [topicId]: {
            ...progress,
            explanation,
            updatedAt: now,
          },
        },
      };
    });
  }, []);

  const toggleAssessment = useCallback(
    (topicId: string, question: string, done: boolean) => {
      setState((current) => {
        const now = new Date().toISOString();
        const progress = current.topics[topicId] ?? emptyTopicProgress(now);
        const assessments = { ...progress.assessments };
        if (done) assessments[question] = true;
        else delete assessments[question];
        return {
          ...current,
          topics: {
            ...current.topics,
            [topicId]: { ...progress, assessments, updatedAt: now },
          },
        };
      });
    },
    [],
  );

  const setQuizScore = useCallback((topicId: string, score: number | undefined) => {
    setState((current) => {
      const now = new Date().toISOString();
      const progress = current.topics[topicId] ?? emptyTopicProgress(now);
      return {
        ...current,
        topics: {
          ...current.topics,
          [topicId]: {
            ...progress,
            evidence: { ...progress.evidence, quizScore: score },
            updatedAt: now,
          },
        },
      };
    });
  }, []);

  const toggleLesson = useCallback(
    (topicId: string, lessonId: string, done: boolean) => {
      setState((current) => {
        const now = new Date().toISOString();
        const progress = current.topics[topicId] ?? emptyTopicProgress(now);
        const lessons = { ...progress.lessons };
        if (done) lessons[lessonId] = now;
        else delete lessons[lessonId];
        const status =
          progress.status === "unseen" && done ? "learning" : progress.status;
        const reviews =
          status !== "unseen" && !current.reviews[topicId]
            ? {
                ...current.reviews,
                [topicId]: createReviewRecord(
                  topicId,
                  current.settings.reviewIntervals,
                  new Date(now),
                ),
              }
            : current.reviews;
        return {
          ...current,
          topics: {
            ...current.topics,
            [topicId]: {
              ...progress,
              lessons,
              status,
              updatedAt: now,
            },
          },
          reviews,
        };
      });
    },
    [],
  );

  const setExerciseStatus = useCallback(
    (exerciseId: string, status: ExerciseStatus) => {
      setState((current) => {
        const now = new Date().toISOString();
        return {
          ...current,
          exercises: {
            ...current.exercises,
            [exerciseId]: {
              status,
              notes: current.exercises[exerciseId]?.notes ?? "",
              completedAt:
                status === "completed"
                  ? (current.exercises[exerciseId]?.completedAt ?? now)
                  : undefined,
              updatedAt: now,
            },
          },
        };
      });
    },
    [],
  );

  const setExerciseNotes = useCallback((exerciseId: string, notes: string) => {
    setState((current) => {
      const now = new Date().toISOString();
      const existing = current.exercises[exerciseId];
      return {
        ...current,
        exercises: {
          ...current.exercises,
          [exerciseId]: {
            status: existing?.status ?? "not-started",
            notes,
            completedAt: existing?.completedAt,
            updatedAt: now,
          },
        },
      };
    });
  }, []);

  const toggleMilestone = useCallback((projectId: string, milestoneId: string) => {
    setState((current) => {
      const now = new Date().toISOString();
      const existing = current.projects[projectId];
      const completed = existing?.completedMilestones ?? [];
      const next = completed.includes(milestoneId)
        ? completed.filter((id) => id !== milestoneId)
        : [...completed, milestoneId];
      return {
        ...current,
        projects: {
          ...current.projects,
          [projectId]: {
            completedMilestones: next,
            notes: existing?.notes ?? "",
            updatedAt: now,
          },
        },
      };
    });
  }, []);

  const setProjectNotes = useCallback((projectId: string, notes: string) => {
    setState((current) => {
      const now = new Date().toISOString();
      const existing = current.projects[projectId];
      return {
        ...current,
        projects: {
          ...current.projects,
          [projectId]: {
            completedMilestones: existing?.completedMilestones ?? [],
            notes,
            updatedAt: now,
          },
        },
      };
    });
  }, []);

  const startSession = useCallback((topicId: string, objective: string) => {
    setState((current) => {
      if (current.activeSession) return current;
      const active: ActiveSession = {
        id: uid("session"),
        topicId,
        objective,
        startedAt: new Date().toISOString(),
      };
      return { ...current, activeSession: active };
    });
  }, []);

  const finishSession = useCallback(
    (input: {
      learned: string;
      questions: string;
      nextActions: string;
      durationMinutes?: number;
    }) => {
      setState((current) => {
        if (!current.activeSession) return current;
        const active = current.activeSession;
        const now = new Date();
        const elapsed = Math.max(
          0,
          (now.getTime() - new Date(active.startedAt).getTime()) / 60000,
        );
        const duration =
          input.durationMinutes && input.durationMinutes > 0
            ? Math.round(input.durationMinutes)
            : Math.max(1, Math.round(elapsed));
        const session: StudySession = {
          id: active.id,
          topicId: active.topicId,
          objective: active.objective,
          startedAt: active.startedAt,
          endedAt: now.toISOString(),
          durationMinutes: duration,
          learned: input.learned,
          questions: input.questions,
          nextActions: input.nextActions,
        };
        return {
          ...current,
          activeSession: null,
          sessions: [session, ...current.sessions],
        };
      });
      toast("Study session saved.", "success");
    },
    [toast],
  );

  const cancelSession = useCallback(() => {
    setState((current) => ({ ...current, activeSession: null }));
    toast("Study session discarded.", "info");
  }, [toast]);

  const deleteSession = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      sessions: current.sessions.filter((session) => session.id !== id),
    }));
  }, []);

  const addNote = useCallback(
    (input: { title: string; content: string; topicId?: string }) => {
      const now = new Date().toISOString();
      const note: Note = {
        id: uid("note"),
        title: input.title.trim() || "Untitled note",
        content: input.content,
        topicId: input.topicId || undefined,
        createdAt: now,
        updatedAt: now,
      };
      setState((current) => ({ ...current, notes: [note, ...current.notes] }));
      return note;
    },
    [],
  );

  const updateNote = useCallback(
    (id: string, input: { title: string; content: string; topicId?: string }) => {
      setState((current) => ({
        ...current,
        notes: current.notes.map((note) =>
          note.id === id
            ? {
                ...note,
                title: input.title.trim() || "Untitled note",
                content: input.content,
                topicId: input.topicId || undefined,
                updatedAt: new Date().toISOString(),
              }
            : note,
        ),
      }));
    },
    [],
  );

  const deleteNote = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.id !== id),
    }));
  }, []);

  const submitReview = useCallback(
    (topicId: string, rating: ReviewRating, answer: string) => {
      setState((current) => {
        const record = scheduleReview(
          current.reviews[topicId],
          topicId,
          rating,
          current.settings.reviewIntervals,
          new Date(),
          answer.trim() || undefined,
        );
        return {
          ...current,
          reviews: { ...current.reviews, [topicId]: record },
        };
      });
      toast("Review recorded.", "success");
    },
    [toast],
  );

  const toggleFavorite = useCallback((promptId: string) => {
    setState((current) => {
      const isFavorite = current.prompts.favorites.includes(promptId);
      return {
        ...current,
        prompts: {
          ...current.prompts,
          favorites: isFavorite
            ? current.prompts.favorites.filter((id) => id !== promptId)
            : [...current.prompts.favorites, promptId],
        },
      };
    });
  }, []);

  const recordPromptUse = useCallback((promptId: string) => {
    setState((current) => ({
      ...current,
      prompts: {
        ...current.prompts,
        recentIds: [
          promptId,
          ...current.prompts.recentIds.filter((id) => id !== promptId),
        ].slice(0, 10),
      },
    }));
  }, []);

  const saveCustomPrompt = useCallback((prompt: PromptTemplate) => {
    setState((current) => {
      const exists = current.prompts.custom.some((item) => item.id === prompt.id);
      return {
        ...current,
        prompts: {
          ...current.prompts,
          custom: exists
            ? current.prompts.custom.map((item) =>
                item.id === prompt.id ? prompt : item,
              )
            : [prompt, ...current.prompts.custom],
        },
      };
    });
  }, []);

  const deleteCustomPrompt = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      prompts: {
        ...current.prompts,
        custom: current.prompts.custom.filter((prompt) => prompt.id !== id),
        favorites: current.prompts.favorites.filter((promptId) => promptId !== id),
        recentIds: current.prompts.recentIds.filter((promptId) => promptId !== id),
      },
    }));
  }, []);

  const setPromptValues = useCallback(
    (promptId: string, values: Record<string, string>) => {
      setState((current) => ({
        ...current,
        prompts: {
          ...current.prompts,
          values: { ...current.prompts.values, [promptId]: values },
        },
      }));
    },
    [],
  );

  const importState = useCallback(
    (text: string): { ok: boolean; error?: string; state?: AppState } => {
      const result = parseStateJson(text);
      if (!result.ok) return { ok: false, error: result.error };
      setState(result.state);
      return { ok: true, state: result.state };
    },
    [],
  );

  const exportState = useCallback(() => serializeState(state), [state]);

  const resetAll = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    storageRef.current?.clear().catch(() => undefined);
    toast("All local learning data was reset.", "info");
    return fresh;
  }, [toast]);

  const dismissStorageError = useCallback(() => setStorageError(null), []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      ready,
      storageError,
      storageKind,
      dismissStorageError,
      updateSettings,
      setSidebarCollapsed,
      setConceptCompleted,
      setTopicStatus,
      setTopicExplanation,
      setQuizScore,
      toggleLesson,
      toggleAssessment,
      setExerciseStatus,
      setExerciseNotes,
      toggleMilestone,
      setProjectNotes,
      startSession,
      finishSession,
      cancelSession,
      deleteSession,
      addNote,
      updateNote,
      deleteNote,
      submitReview,
      toggleFavorite,
      recordPromptUse,
      saveCustomPrompt,
      deleteCustomPrompt,
      setPromptValues,
      importState,
      exportState,
      resetAll,
    }),
    [
      state,
      ready,
      storageError,
      storageKind,
      dismissStorageError,
      updateSettings,
      setSidebarCollapsed,
      setConceptCompleted,
      setTopicStatus,
      setTopicExplanation,
      setQuizScore,
      toggleLesson,
      toggleAssessment,
      setExerciseStatus,
      setExerciseNotes,
      toggleMilestone,
      setProjectNotes,
      startSession,
      finishSession,
      cancelSession,
      deleteSession,
      addNote,
      updateNote,
      deleteNote,
      submitReview,
      toggleFavorite,
      recordPromptUse,
      saveCustomPrompt,
      deleteCustomPrompt,
      setPromptValues,
      importState,
      exportState,
      resetAll,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppProvider>{children}</AppProvider>
    </ToastProvider>
  );
}
