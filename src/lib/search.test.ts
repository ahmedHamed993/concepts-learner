import { describe, expect, it } from "vitest";
import { allTopics } from "@/lib/curriculum";
import { seedPrompts } from "@/lib/prompts";
import {
  filterPrompts,
  filterTopics,
  searchNotes,
  searchPrompts,
  searchTopics,
} from "@/lib/search";
import type { Note } from "@/lib/types";

const notes: Note[] = [
  {
    id: "note-slices",
    title: "Slice aliasing",
    content: "Appending within capacity can mutate the original backing array.",
    topicId: "go-collections",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "note-cache",
    title: "Cache lines",
    content: "Spatial locality makes array traversal faster than pointer chasing.",
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
  },
];

describe("topic search", () => {
  it("ranks title matches above body matches", () => {
    const results = searchTopics("escape analysis", allTopics);
    expect(results[0]?.id).toBe("escape-analysis-gc");
  });

  it("supports aliases and keywords", () => {
    expect(searchTopics("GC", allTopics).some((topic) => topic.id === "escape-analysis-gc")).toBe(true);
    expect(searchTopics("L1", allTopics).some((topic) => topic.id === "cache-memory")).toBe(true);
  });

  it("filters by phase and difficulty", () => {
    const results = filterTopics(allTopics, {
      phaseId: "phase-1",
      difficulty: "beginner",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((topic) => topic.phaseId === "phase-1")).toBe(true);
    expect(results.every((topic) => topic.difficulty === "beginner")).toBe(true);
  });

  it("returns all topics for an empty query", () => {
    expect(searchTopics("   ", allTopics)).toHaveLength(allTopics.length);
  });
});

describe("prompt search", () => {
  it("finds prompts by category and template text", () => {
    expect(searchPrompts(seedPrompts, "concurrency").length).toBeGreaterThan(0);
    expect(searchPrompts(seedPrompts, "Socratic").length).toBeGreaterThan(0);
  });

  it("filters by category, difficulty, and favorites", () => {
    const favorites = [seedPrompts[0].id];
    expect(
      filterPrompts(seedPrompts, {
        category: seedPrompts[0].category,
        favoriteIds: favorites,
        favoritesOnly: true,
      }),
    ).toEqual([seedPrompts[0]]);
  });
});

describe("note search", () => {
  it("searches note title and content, newest first", () => {
    expect(searchNotes(notes, "aliasing").map((note) => note.id)).toEqual(["note-slices"]);
    expect(searchNotes(notes, "spatial").map((note) => note.id)).toEqual(["note-cache"]);
    expect(searchNotes(notes, "").map((note) => note.id)).toEqual(["note-cache", "note-slices"]);
  });
});
