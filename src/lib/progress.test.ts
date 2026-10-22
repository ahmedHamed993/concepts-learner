import { describe, expect, it } from "vitest";
import { allTopics, getPhase, getTopic } from "@/lib/curriculum";
import { seedProjects } from "@/lib/projects";
import {
  completedLessonCount,
  dashboardStats,
  emptyTopicProgress,
  evidenceForTopic,
  getTopicProgress,
  overallLessonCompletion,
  overallProgress,
  phaseProgress,
  projectPercent,
  projectStatusLabel,
  topicPercent,
} from "@/lib/progress";
import { createInitialState } from "@/lib/storage";
import type { AppState } from "@/lib/types";

describe("topic progress", () => {
  it("returns a safe empty state for untouched topics", () => {
    const state = createInitialState();
    const progress = getTopicProgress(state, "go-collections");
    expect(progress.status).toBe("unseen");
    expect(progress.lessons).toEqual({});
    expect(progress.assessments).toEqual({});
    expect(progress.evidence.exerciseIds).toEqual([]);
  });

  it("uses lesson completion and status weight without claiming mastery", () => {
    const topic = getTopic("go-collections");
    expect(topic).toBeDefined();
    if (!topic) return;

    const progress = emptyTopicProgress();
    for (const lesson of topic.lessons) {
      progress.lessons[lesson.id] = new Date().toISOString();
    }

    expect(completedLessonCount(progress)).toBe(topic.lessons.length);
    expect(topicPercent(topic, progress)).toBe(60);
    expect(topicPercent(topic, { ...progress, status: "mastered" })).toBe(100);
    expect(topicPercent(topic, undefined)).toBe(0);
  });

  it("reports phase and overall progress from saved state", () => {
    const state = createInitialState();
    const phase = getPhase("phase-1");
    expect(phase).toBeDefined();
    if (!phase) return;

    expect(phaseProgress(state, phase).percent).toBe(0);
    expect(overallProgress(state)).toBe(0);
    expect(overallLessonCompletion(state).completed).toBe(0);

    const topic = phase.topics[0];
    state.topics[topic.id] = {
      ...emptyTopicProgress(),
      status: "mastered",
    };

    expect(phaseProgress(state, phase).masteredTopics).toBe(1);
    expect(phaseProgress(state, phase).percent).toBeGreaterThan(0);
  });
});

describe("mastery evidence", () => {
  const topic = getTopic("go-collections");

  it("requires real evidence", () => {
    const state = createInitialState();
    expect(topic).toBeDefined();
    if (!topic) return;
    expect(evidenceForTopic(state, topic)).toEqual({
      hasEvidence: false,
      reasons: [],
    });
  });

  it("accepts an explanation, a linked exercise, or a quiz score", () => {
    const state = createInitialState();
    expect(topic).toBeDefined();
    if (!topic) return;

    state.topics[topic.id] = {
      ...emptyTopicProgress(),
      explanation: "A slice is a descriptor over a backing array with length and capacity.",
    };
    expect(evidenceForTopic(state, topic).reasons).toContain("Written explanation");

    const exerciseId = topic.exerciseIds[0];
    if (exerciseId) {
      state.exercises[exerciseId] = {
        status: "completed",
        notes: "",
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(evidenceForTopic(state, topic).reasons).toContain("Completed topic exercise");
    }

    state.topics[topic.id] = {
      ...state.topics[topic.id],
      evidence: { exerciseIds: [], quizScore: 80 },
    };
    expect(evidenceForTopic(state, topic).reasons).toContain("Quiz score ≥ 80%");
  });
});

describe("curriculum integrity", () => {
  it("contains no duplicate topic ids or broken relations", () => {
    const ids = allTopics.map((topic) => topic.id);
    expect(new Set(ids).size).toBe(ids.length);

    const idSet = new Set(ids);
    const broken = allTopics.flatMap((topic) =>
      [...topic.prerequisites, ...topic.related]
        .filter((id) => !idSet.has(id))
        .map((id) => `${topic.id} -> ${id}`),
    );
    expect(broken).toEqual([]);
  });

  it("has complete required content for every topic", () => {
    for (const topic of allTopics) {
      expect(topic.title.length, topic.id).toBeGreaterThan(0);
      expect(topic.definition.length, topic.id).toBeGreaterThan(20);
      expect(topic.content.what.length, topic.id).toBeGreaterThan(20);
      expect(topic.content.why.length, topic.id).toBeGreaterThan(20);
      expect(topic.lessons.length, topic.id).toBeGreaterThan(0);
      expect(topic.objectives.length, topic.id).toBeGreaterThan(0);
    }
  });
});

describe("dashboard aggregation", () => {
  it("counts sessions, notes, exercises, and mastered topics", () => {
    const state: AppState = createInitialState(new Date("2026-01-01T00:00:00.000Z"));
    const topic = getTopic("go-collections");
    expect(topic).toBeDefined();
    if (!topic) return;

    const now = new Date("2026-01-01T12:00:00.000Z");
    state.topics[topic.id] = { ...emptyTopicProgress(), status: "mastered" };
    state.notes.push({
      id: "note-1",
      title: "Note",
      content: "Body",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    state.sessions.push({
      id: "session-1",
      topicId: topic.id,
      objective: "Study",
      startedAt: "2026-01-01T10:00:00.000Z",
      endedAt: "2026-01-01T10:30:00.000Z",
      durationMinutes: 30,
      learned: "Something",
      questions: "",
      nextActions: "",
    });

    const stats = dashboardStats(state, now);
    expect(stats.mastered).toBe(1);
    expect(stats.notesCount).toBe(1);
    expect(stats.sessionsCount).toBe(1);
    expect(stats.totalMinutes).toBe(30);
    expect(stats.todayMinutes).toBe(30);
  });
});

describe("project progress", () => {
  it("counts only real milestone ids and reports status", () => {
    const project = seedProjects[0];
    expect(project).toBeDefined();
    if (!project) return;

    expect(projectPercent(project, undefined)).toBe(0);
    expect(projectStatusLabel(project, undefined)).toBe("Not started");
    expect(projectPercent(project, ["not-a-milestone"])).toBe(0);

    const first = project.milestones[0].id;
    expect(projectPercent(project, [first])).toBe(
      Math.round((1 / project.milestones.length) * 100),
    );
    expect(projectStatusLabel(project, [first])).toBe(
      `1/${project.milestones.length} milestones`,
    );

    const all = project.milestones.map((milestone) => milestone.id);
    expect(projectPercent(project, all)).toBe(100);
    expect(projectStatusLabel(project, all)).toBe("Complete");
  });
});
