import type { ReviewRating, ReviewRecord } from "@/lib/types";

export const DEFAULT_REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export const REVIEW_RATINGS: {
  value: ReviewRating;
  label: string;
  description: string;
}[] = [
  { value: "again", label: "Again", description: "Could not explain it; restart the schedule." },
  { value: "hard", label: "Hard", description: "Recalled with effort; repeat the same interval." },
  { value: "good", label: "Good", description: "Explained correctly; advance one step." },
  { value: "easy", label: "Easy", description: "Fluent explanation; advance two steps." },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function createReviewRecord(
  topicId: string,
  intervals: number[] = DEFAULT_REVIEW_INTERVALS,
  now: Date = new Date(),
): ReviewRecord {
  const safe = normalizeIntervals(intervals);
  return {
    topicId,
    stage: 0,
    intervalDays: safe[0],
    dueAt: addDays(now, safe[0]).toISOString(),
    lapses: 0,
    successfulReviews: 0,
    history: [],
  };
}

export function normalizeIntervals(intervals: number[]): number[] {
  const cleaned = intervals
    .map((value) => Math.round(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
  const unique = [...new Set(cleaned)];
  return unique.length > 0 ? unique : [...DEFAULT_REVIEW_INTERVALS];
}

export function scheduleReview(
  existing: ReviewRecord | undefined,
  topicId: string,
  rating: ReviewRating,
  intervals: number[] = DEFAULT_REVIEW_INTERVALS,
  now: Date = new Date(),
  answer?: string,
): ReviewRecord {
  const safe = normalizeIntervals(intervals);
  const current =
    existing ?? createReviewRecord(topicId, safe, now);
  const maxStage = safe.length - 1;
  let stage = current.stage;
  let lapses = current.lapses;
  let successfulReviews = current.successfulReviews;

  switch (rating) {
    case "again":
      stage = 0;
      lapses += 1;
      break;
    case "hard":
      stage = Math.max(0, stage);
      break;
    case "good":
      stage = Math.min(maxStage, stage + 1);
      successfulReviews += 1;
      break;
    case "easy":
      stage = Math.min(maxStage, stage + 2);
      successfulReviews += 1;
      break;
  }

  const intervalDays = safe[stage];
  return {
    ...current,
    stage,
    intervalDays,
    dueAt: addDays(now, intervalDays).toISOString(),
    lastReviewedAt: now.toISOString(),
    lapses,
    successfulReviews,
    history: [
      ...current.history,
      { at: now.toISOString(), rating, answer },
    ].slice(-50),
  };
}

export function isDue(record: ReviewRecord, now: Date = new Date()): boolean {
  return new Date(record.dueAt).getTime() <= now.getTime();
}

export function dueReviews(
  reviews: Record<string, ReviewRecord>,
  now: Date = new Date(),
): ReviewRecord[] {
  return Object.values(reviews)
    .filter((record) => isDue(record, now))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export function upcomingReviews(
  reviews: Record<string, ReviewRecord>,
  withinDays = 7,
  now: Date = new Date(),
): ReviewRecord[] {
  const limit = addDays(now, withinDays).getTime();
  return Object.values(reviews)
    .filter((record) => {
      const due = new Date(record.dueAt).getTime();
      return due > now.getTime() && due <= limit;
    })
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / DAY_MS);
}

export function reviewPrompt(topicTitle: string): string {
  return `Without looking anything up, explain ${topicTitle} in your own words. Include a concrete example, one common misconception, and one connection to memory, the compiler, the OS, or the hardware.`;
}
