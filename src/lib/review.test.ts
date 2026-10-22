import { describe, expect, it } from "vitest";
import {
  createReviewRecord,
  daysUntil,
  dueReviews,
  isDue,
  normalizeIntervals,
  scheduleReview,
  upcomingReviews,
} from "@/lib/review";
import type { ReviewRecord } from "@/lib/types";

const now = new Date("2026-01-01T00:00:00.000Z");

function rated(
  record: ReviewRecord | undefined,
  rating: "again" | "hard" | "good" | "easy",
): ReviewRecord {
  return scheduleReview(record, "go-basics", rating, [1, 3, 7, 14, 30], now);
}

describe("review scheduling", () => {
  it("creates a first review one day after scheduling", () => {
    const record = createReviewRecord("go-basics", [1, 3, 7], now);
    expect(record.stage).toBe(0);
    expect(record.intervalDays).toBe(1);
    expect(record.dueAt).toBe("2026-01-02T00:00:00.000Z");
    expect(record.history).toEqual([]);
    expect(isDue(record, now)).toBe(false);
  });

  it("advances one stage for good and two for easy", () => {
    const good = rated(undefined, "good");
    expect(good.stage).toBe(1);
    expect(good.intervalDays).toBe(3);
    expect(good.successfulReviews).toBe(1);

    const easy = rated(good, "easy");
    expect(easy.stage).toBe(3);
    expect(easy.intervalDays).toBe(14);
    expect(easy.successfulReviews).toBe(2);

    const capped = rated(rated(easy, "easy"), "easy");
    expect(capped.stage).toBe(4);
    expect(capped.intervalDays).toBe(30);
  });

  it("resets on again and records a lapse", () => {
    const record = rated(rated(undefined, "good"), "again");
    expect(record.stage).toBe(0);
    expect(record.intervalDays).toBe(1);
    expect(record.lapses).toBe(1);
    expect(record.successfulReviews).toBe(1);
    expect(record.history).toHaveLength(2);
  });

  it("does not advance on hard", () => {
    const record = rated(rated(undefined, "good"), "hard");
    expect(record.stage).toBe(1);
    expect(record.intervalDays).toBe(3);
    expect(record.lapses).toBe(0);
  });

  it("keeps history bounded and stores answers", () => {
    let record: ReviewRecord | undefined;
    for (let index = 0; index < 60; index += 1) {
      record = scheduleReview(record, "go-basics", "good", [1, 3], now, `answer-${index}`);
    }
    expect(record?.history).toHaveLength(50);
    expect(record?.history[49].answer).toBe("answer-59");
  });

  it("sorts due reviews oldest first and respects upcoming window", () => {
    const records = {
      later: createReviewRecord("later", [3], now),
      due: createReviewRecord("due", [1], now),
      upcoming: createReviewRecord("upcoming", [7], now),
    };
    records.due.dueAt = "2025-12-31T00:00:00.000Z";

    expect(dueReviews(records, now).map((record) => record.topicId)).toEqual(["due"]);
    expect(upcomingReviews(records, 7, now).map((record) => record.topicId)).toEqual([
      "later",
      "upcoming",
    ]);
    expect(daysUntil("2026-01-08T00:00:00.000Z", now)).toBe(7);
  });

  it("normalizes intervals and handles empty input", () => {
    expect(normalizeIntervals([7, -1, 3, 3, 1])).toEqual([1, 3, 7]);
    expect(normalizeIntervals([])).toEqual([1, 3, 7, 14, 30]);
  });
});
