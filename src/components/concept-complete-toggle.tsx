"use client";

import { useApp } from "@/components/providers";
import { isConceptComplete } from "@/lib/concept-progress";
import { cn } from "@/lib/utils";

export function ConceptCompleteToggle({
  conceptId,
  conceptName,
  className,
}: {
  conceptId: string;
  conceptName: string;
  className?: string;
}) {
  const { state, setConceptCompleted } = useApp();
  const completed = isConceptComplete(state, conceptId);

  return (
    <label
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors",
        completed
          ? "border-success/30 bg-success-soft text-success"
          : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={(event) => setConceptCompleted(conceptId, event.target.checked)}
        className="h-3.5 w-3.5 cursor-pointer accent-primary"
        aria-label={`Mark ${conceptName} as ${
          completed ? "incomplete" : "complete"
        }`}
      />
      {completed ? "Completed" : "Mark complete"}
    </label>
  );
}
