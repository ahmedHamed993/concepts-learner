import { allTopics, phases } from "@/lib/curriculum";
import { dueReviews, upcomingReviews } from "@/lib/review";
import type {
  AppState,
  Exercise,
  ExerciseStatus,
  Mastery,
  NextLesson,
  Phase,
  PhaseProgress,
  Project,
  Topic,
  TopicProgress,
} from "@/lib/types";

export const MASTERY_WEIGHT: Record<Mastery, number> = {
  unseen: 0,
  learning: 0.25,
  practicing: 0.5,
  understood: 0.8,
  mastered: 1,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function emptyTopicProgress(now = new Date().toISOString()): TopicProgress {
  return {
    status: "unseen",
    lessons: {},
    assessments: {},
    explanation: "",
    evidence: { exerciseIds: [] },
    manualOverride: false,
    updatedAt: now,
  };
}

export function getTopicProgress(
  state: AppState,
  topicId: string,
): TopicProgress {
  return state.topics[topicId] ?? emptyTopicProgress();
}

export function completedLessonCount(progress: TopicProgress | undefined): number {
  return progress ? Object.keys(progress.lessons).length : 0;
}

export function topicPercent(topic: Topic, progress: TopicProgress | undefined): number {
  const total = topic.lessons.length;
  const completed = completedLessonCount(progress);
  const lessonRatio = total === 0 ? 0 : completed / total;
  const status = progress?.status ?? "unseen";
  const weighted = lessonRatio * 0.6 + MASTERY_WEIGHT[status] * 0.4;
  return Math.round(Math.min(1, weighted) * 100);
}

export function phaseProgress(state: AppState, phase: Phase): PhaseProgress {
  const totalLessons = phase.topics.reduce(
    (sum, topic) => sum + topic.lessons.length,
    0,
  );
  const completedLessons = phase.topics.reduce(
    (sum, topic) => sum + completedLessonCount(state.topics[topic.id]),
    0,
  );
  const score = phase.topics.reduce((sum, topic) => {
    const progress = state.topics[topic.id];
    const total = topic.lessons.length;
    const lessons = completedLessonCount(progress);
    const lessonRatio = total === 0 ? 0 : lessons / total;
    const status = progress?.status ?? "unseen";
    return sum + lessonRatio * 0.6 + MASTERY_WEIGHT[status] * 0.4;
  }, 0);
  const percent =
    phase.topics.length === 0
      ? 0
      : Math.round((score / phase.topics.length) * 100);

  return {
    phaseId: phase.id,
    percent,
    completedLessons,
    totalLessons,
    startedTopics: phase.topics.filter(
      (topic) => (state.topics[topic.id]?.status ?? "unseen") !== "unseen",
    ).length,
    masteredTopics: phase.topics.filter(
      (topic) => state.topics[topic.id]?.status === "mastered",
    ).length,
    totalTopics: phase.topics.length,
  };
}

export function overallProgress(state: AppState): number {
  if (phases.length === 0) return 0;
  return Math.round(
    phases.reduce((sum, phase) => sum + phaseProgress(state, phase).percent, 0) /
      phases.length,
  );
}

export function overallLessonCompletion(state: AppState): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = allTopics.reduce((sum, topic) => sum + topic.lessons.length, 0);
  const completed = allTopics.reduce(
    (sum, topic) => sum + completedLessonCount(state.topics[topic.id]),
    0,
  );
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function activePhase(state: AppState): Phase {
  return (
    phases.find((phase) => phaseProgress(state, phase).percent < 100) ??
    phases[phases.length - 1]
  );
}

export function nextLesson(state: AppState): NextLesson {
  const candidates = [
    activePhase(state),
    ...phases.filter((phase) => phase.id !== activePhase(state).id),
  ];
  for (const phase of candidates) {
    for (const topic of phase.topics) {
      const progress = state.topics[topic.id];
      const lesson = topic.lessons.find((item) => !progress?.lessons[item.id]);
      if (lesson) return { phase, topic, lesson };
    }
  }
  return null;
}

export function nextTopicWithoutLesson(state: AppState): Topic | null {
  const next = nextLesson(state);
  if (next) return next.topic;
  return allTopics.find((topic) => !state.topics[topic.id]) ?? null;
}

export type DashboardStats = {
  overall: number;
  lessonCompletion: ReturnType<typeof overallLessonCompletion>;
  phases: PhaseProgress[];
  currentPhase: Phase;
  learned: number;
  inProgress: number;
  mastered: number;
  needsRevision: number;
  upcomingRevision: number;
  totalMinutes: number;
  todayMinutes: number;
  weekMinutes: number;
  notesCount: number;
  sessionsCount: number;
  completedExercises: number;
  activeProjects: number;
};

export function dashboardStats(state: AppState, now: Date = new Date()): DashboardStats {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const weekStart = new Date(now.getTime() - 7 * DAY_MS);
  const sessions = state.sessions;

  return {
    overall: overallProgress(state),
    lessonCompletion: overallLessonCompletion(state),
    phases: phases.map((phase) => phaseProgress(state, phase)),
    currentPhase: activePhase(state),
    learned: allTopics.filter(
      (topic) => (state.topics[topic.id]?.status ?? "unseen") !== "unseen",
    ).length,
    inProgress: allTopics.filter((topic) => {
      const status = state.topics[topic.id]?.status;
      return status === "learning" || status === "practicing";
    }).length,
    mastered: allTopics.filter(
      (topic) => state.topics[topic.id]?.status === "mastered",
    ).length,
    needsRevision: dueReviews(state.reviews, now).length,
    upcomingRevision: upcomingReviews(state.reviews, 7, now).length,
    totalMinutes: sessions.reduce((sum, session) => sum + session.durationMinutes, 0),
    todayMinutes: sessions
      .filter((session) => new Date(session.endedAt) >= startOfToday)
      .reduce((sum, session) => sum + session.durationMinutes, 0),
    weekMinutes: sessions
      .filter((session) => new Date(session.endedAt) >= weekStart)
      .reduce((sum, session) => sum + session.durationMinutes, 0),
    notesCount: state.notes.length,
    sessionsCount: sessions.length,
    completedExercises: Object.values(state.exercises).filter(
      (exercise) => exercise.status === "completed",
    ).length,
    activeProjects: seedProjectsInProgress(state),
  };
}

function seedProjectsInProgress(state: AppState): number {
  return Object.values(state.projects).filter(
    (progress) => progress.completedMilestones.length > 0,
  ).length;
}

export function evidenceForTopic(
  state: AppState,
  topic: Topic,
): { hasEvidence: boolean; reasons: string[] } {
  const progress = getTopicProgress(state, topic.id);
  const reasons: string[] = [];
  if (progress.explanation.trim().length >= 40) {
    reasons.push("Written explanation");
  }
  const completedLinked = topic.exerciseIds.some(
    (id) => state.exercises[id]?.status === "completed",
  );
  if (completedLinked) reasons.push("Completed topic exercise");
  if ((progress.evidence.quizScore ?? 0) >= 80) reasons.push("Quiz score ≥ 80%");
  return { hasEvidence: reasons.length > 0, reasons };
}

export function exerciseStatus(
  state: AppState,
  exerciseId: string,
): ExerciseStatus {
  return state.exercises[exerciseId]?.status ?? "not-started";
}

export function projectPercent(
  project: Project,
  completed: string[] | undefined,
): number {
  if (project.milestones.length === 0) return 0;
  const done = (completed ?? []).filter((id) =>
    project.milestones.some((milestone) => milestone.id === id),
  ).length;
  return Math.round((done / project.milestones.length) * 100);
}

export function projectStatusLabel(project: Project, completed: string[] | undefined): string {
  const done = (completed ?? []).filter((id) =>
    project.milestones.some((milestone) => milestone.id === id),
  ).length;
  if (done === 0) return "Not started";
  if (done === project.milestones.length) return "Complete";
  return `${done}/${project.milestones.length} milestones`;
}

export function linkedExercises(
  exercises: Exercise[],
  topicId: string,
): Exercise[] {
  return exercises.filter((exercise) => exercise.concepts.includes(topicId));
}
