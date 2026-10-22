import type { Lesson, Topic, TopicContent } from "@/lib/types";

export function lesson(
  id: string,
  title: string,
  summary: string,
  estimatedMinutes: number,
): Lesson {
  return { id, title, summary, estimatedMinutes };
}

export function content(input: TopicContent): TopicContent {
  return input;
}

type DefaultedKeys =
  | "aliases"
  | "prerequisites"
  | "related"
  | "objectives"
  | "lessons"
  | "codeExamples"
  | "exerciseIds"
  | "promptIds";

type TopicInput = Omit<Topic, DefaultedKeys | "order"> &
  Partial<Pick<Topic, DefaultedKeys>> & { order?: number };

export function topic(input: TopicInput): Topic {
  return {
    aliases: [],
    prerequisites: [],
    related: [],
    objectives: [],
    lessons: [],
    codeExamples: [],
    exerciseIds: [],
    promptIds: [],
    order: 0,
    ...input,
  };
}
