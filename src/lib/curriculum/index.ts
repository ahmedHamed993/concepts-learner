import type { Phase, Topic } from "@/lib/types";
import { phase1 } from "./phase1";
import { phase2 } from "./phase2";
import { phase3 } from "./phase3";
import { phase4 } from "./phase4";
import { phase5 } from "./phase5";
import { phase6 } from "./phase6";
import { phase7 } from "./phase7";
import { phase8 } from "./phase8";

export const phases: Phase[] = [
  phase1,
  phase2,
  phase3,
  phase4,
  phase5,
  phase6,
  phase7,
  phase8,
];

export const allTopics: Topic[] = phases.flatMap((phase) => phase.topics);

const topicMap = new Map(allTopics.map((topic) => [topic.id, topic]));
const phaseMap = new Map(phases.map((phase) => [phase.id, phase]));

export function getTopic(id: string): Topic | undefined {
  return topicMap.get(id);
}

export function getPhase(id: string): Phase | undefined {
  return phaseMap.get(id);
}

export function getPhaseForTopic(topicId: string): Phase | undefined {
  const topic = topicMap.get(topicId);
  return topic ? phaseMap.get(topic.phaseId) : undefined;
}

export function getTopicTitle(id: string): string {
  return topicMap.get(id)?.title ?? id;
}

export function getRelatedTopics(topic: Topic): Topic[] {
  return topic.related
    .map((id) => topicMap.get(id))
    .filter((item): item is Topic => Boolean(item));
}

export function getPrerequisiteTopics(topic: Topic): Topic[] {
  return topic.prerequisites
    .map((id) => topicMap.get(id))
    .filter((item): item is Topic => Boolean(item));
}

export const totalLessons = allTopics.reduce(
  (sum, topic) => sum + topic.lessons.length,
  0,
);

export { phase1, phase2, phase3, phase4, phase5, phase6, phase7, phase8 };
