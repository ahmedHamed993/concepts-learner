import { describe, expect, it } from "vitest";
import {
  createInitialState,
  migrateRaw,
  parseStateJson,
  SCHEMA_VERSION,
  serializeState,
} from "@/lib/storage";

describe("initial state", () => {
  it("uses a versioned schema and safe defaults", () => {
    const state = createInitialState(new Date("2026-01-01T00:00:00.000Z"));
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.settings.theme).toBe("system");
    expect(state.settings.reviewIntervals).toEqual([1, 3, 7, 14, 30]);
    expect(state.topics).toEqual({});
    expect(state.conceptProgress).toEqual({});
    expect(state.activeSession).toBeNull();
    expect(state.prompts.custom).toEqual([]);
  });
});

describe("serialization and validation", () => {
  it("round-trips a valid state", () => {
    const state = createInitialState(new Date("2026-01-01T00:00:00.000Z"));
    state.settings.learnerName = "Ada";
    state.notes.push({
      id: "note-1",
      title: "Slices",
      content: "A descriptor over an array.",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const result = parseStateJson(serializeState(state));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.settings.learnerName).toBe("Ada");
    expect(result.state.notes).toHaveLength(1);
    expect(result.state.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it("rejects malformed JSON and non-objects", () => {
    expect(parseStateJson("{nope").ok).toBe(false);
    expect(parseStateJson("[]").ok).toBe(false);
    expect(parseStateJson("null").ok).toBe(false);
    expect(parseStateJson("{}").ok).toBe(true);
  });

  it("rejects data from a newer schema", () => {
    const result = migrateRaw({ schemaVersion: SCHEMA_VERSION + 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("newer version");
  });

  it("sanitizes invalid progress values", () => {
    const result = migrateRaw({
      schemaVersion: 1,
      topics: {
        "go-basics": {
          status: "legendary",
          lessons: { intro: "not-a-date" },
          assessments: { "What is it?": true, "Bad value": "yes" },
          explanation: 42,
          evidence: { exerciseIds: ["ex-1", 7], quizScore: 150 },
          manualOverride: "true",
        },
      },
      settings: {
        theme: "neon",
        dailyGoalMinutes: -5,
        reviewIntervals: [7, -1, 3],
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const progress = result.state.topics["go-basics"];
    expect(progress.status).toBe("unseen");
    expect(progress.explanation).toBe("");
    expect(progress.assessments).toEqual({ "What is it?": true });
    expect(progress.evidence.exerciseIds).toEqual(["ex-1"]);
    expect(progress.evidence.quizScore).toBe(100);
    expect(progress.manualOverride).toBe(false);
    expect(result.state.settings.theme).toBe("system");
    expect(result.state.settings.dailyGoalMinutes).toBe(1);
    expect(result.state.settings.reviewIntervals).toEqual([3, 7]);
  });

  it("filters invalid sessions and notes while keeping valid records", () => {
    const result = migrateRaw({
      schemaVersion: 1,
      sessions: [
        { id: "s1", topicId: "go-basics", durationMinutes: -10 },
        { id: "bad" },
        "not-an-object",
      ],
      notes: [
        { id: "n1", title: "Valid", content: "Body" },
        { id: "n2", content: "Missing title" },
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.sessions).toHaveLength(1);
    expect(result.state.sessions[0].durationMinutes).toBe(0);
    expect(result.state.notes).toHaveLength(1);
    expect(result.state.notes[0].title).toBe("Valid");
  });

  it("preserves legacy topic progress while adding concept completion", () => {
    const result = migrateRaw({
      schemaVersion: 1,
      topics: {
        "go-collections": {
          status: "mastered",
          lessons: { "array-model": "2026-01-01T00:00:00.000Z" },
        },
      },
      conceptProgress: {
        "go-slices": {
          completedAt: "2026-01-02T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
        "go-maps": true,
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.topics["go-collections"].status).toBe("mastered");
    expect(result.state.topics["go-collections"].lessons["array-model"]).toBe(
      "2026-01-01T00:00:00.000Z",
    );
    expect(result.state.conceptProgress["go-slices"].completedAt).toBe(
      "2026-01-02T00:00:00.000Z",
    );
    expect(result.state.conceptProgress["go-maps"]).toBeDefined();
    expect(result.migratedFrom).toBe(1);
  });

  it("reports an older schema as migrated", () => {
    const result = migrateRaw({ schemaVersion: 0, settings: {} });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.migratedFrom).toBe(0);
  });
});
