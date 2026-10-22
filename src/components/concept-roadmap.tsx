"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  ClipboardList,
  FolderGit2,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";
import { Modal } from "@/components/modal";
import { CopyPromptButton } from "@/components/copy-prompt-button";
import { useApp } from "@/components/providers";
import {
  Badge,
  buttonClass,
  Card,
  PageHeader,
  ProgressBar,
} from "@/components/ui";
import {
  categoryCompletion,
  conceptCompletion,
  isConceptComplete,
} from "@/lib/concept-progress";
import {
  categoryById,
  conceptCategories,
  concepts,
  getConcept,
  getProjectMilestone,
  type LearningConcept,
} from "@/lib/learning-concepts";
import { cn } from "@/lib/utils";

type ResourceKind = "prompt" | "exercises" | "projects";
type ResourceState = { kind: ResourceKind; conceptId: string } | null;

function difficultyVariant(difficulty: string) {
  if (difficulty === "foundational") return "success" as const;
  if (difficulty === "intermediate") return "accent" as const;
  return "danger" as const;
}

function StringList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-xs leading-5 text-muted">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-subtle" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ConceptRow({
  concept,
  completed,
  onToggle,
  onOpen,
}: {
  concept: LearningConcept;
  completed: boolean;
  onToggle: (completed: boolean) => void;
  onOpen: (kind: ResourceKind) => void;
}) {
  const exercises = concept.exercises.length;
  const projects = concept.projectRefs.length;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-3.5 py-3 transition-colors sm:flex-row sm:items-start sm:px-4",
        completed && "bg-success-soft/20",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        <input
          type="checkbox"
          checked={completed}
          onChange={(event) => onToggle(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
          aria-label={`Mark ${concept.name} as ${
            completed ? "incomplete" : "complete"
          }`}
        />
        <span
          className="mt-0.5 shrink-0 font-mono text-[10px] text-subtle"
          aria-hidden="true"
        >
          {String(concept.order).padStart(2, "0")}.
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "text-[13px] font-semibold leading-5",
                completed ? "text-muted line-through" : "text-foreground",
              )}
            >
              {concept.name}
            </span>
            <Badge
              variant={difficultyVariant(concept.difficulty)}
              className="px-1.5 text-[9px] capitalize"
            >
              {concept.difficulty}
            </Badge>
            {completed ? (
              <Badge variant="success" className="px-1.5 text-[9px]">
                Completed
              </Badge>
            ) : null}
          </div>
          <p
            className={cn(
              "mt-1 text-xs leading-5",
              completed ? "text-subtle" : "text-muted",
            )}
          >
            {concept.description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-1.5 pl-6 sm:justify-end sm:pl-0">
        <button
          type="button"
          onClick={() => onOpen("prompt")}
          className={buttonClass("secondary", "sm", "h-7 px-2 text-[10px]")}
        >
          <Sparkles size={11} /> Learn
        </button>
        {exercises > 0 ? (
          <button
            type="button"
            onClick={() => onOpen("exercises")}
            className={buttonClass("ghost", "sm", "h-7 px-2 text-[10px]")}
          >
            <ClipboardList size={11} /> Exercises ({exercises})
          </button>
        ) : null}
        {projects > 0 ? (
          <button
            type="button"
            onClick={() => onOpen("projects")}
            className={buttonClass("ghost", "sm", "h-7 px-2 text-[10px]")}
          >
            <FolderGit2 size={11} /> Projects ({projects})
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PromptBody({ concept }: { concept: LearningConcept }) {
  return (
    <>
      <p className="mb-3 text-xs leading-5 text-muted">
        Paste this into an AI tutor and answer its questions before revealing the
        next section. The prompt is tailored to this concept.
      </p>
      <pre className="whitespace-pre-wrap rounded-lg border border-border bg-code p-4 font-mono text-[11px] leading-6 text-muted">
        {concept.prompt}
      </pre>
    </>
  );
}

function ExercisesBody({ concept }: { concept: LearningConcept }) {
  return (
    <div className="space-y-4">
      {concept.exercises.map((exercise, index) => (
        <Card key={exercise.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary-soft font-mono text-[10px] text-primary">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {exercise.title}
                </h3>
                <p className="mt-1 text-xs leading-6 text-muted">
                  {exercise.problem}
                </p>
              </div>
            </div>
            <Badge
              variant={difficultyVariant(exercise.difficulty)}
              className="shrink-0 px-1.5 text-[9px] capitalize"
            >
              {exercise.difficulty}
            </Badge>
          </div>

          <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
            <div>
              <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
                <Target size={11} /> Requirements
              </h4>
              <div className="mt-2">
                <StringList items={exercise.requirements} />
              </div>
            </div>
            <div>
              <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
                <Check size={11} /> Acceptance criteria
              </h4>
              <div className="mt-2">
                <StringList items={exercise.acceptanceCriteria} />
              </div>
            </div>
          </div>

          {exercise.hints.length > 0 ? (
            <details className="mt-4 rounded-md border border-border bg-surface-2 px-3 py-2">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-medium text-muted hover:text-foreground">
                <Lightbulb size={12} /> Hints ({exercise.hints.length})
              </summary>
              <div className="mt-2">
                <StringList items={exercise.hints} />
              </div>
            </details>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

function ProjectsBody({ concept }: { concept: LearningConcept }) {
  const entries = concept.projectRefs
    .map((reference) => {
      const resolved = getProjectMilestone(
        reference.projectId,
        reference.milestoneId,
      );
      return resolved ? { reference, ...resolved } : undefined;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted">
        No related projects are listed for this concept.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(({ reference, project, milestone }) => {
        const related = project.conceptIds
          .map((id) => getConcept(id))
          .filter((item): item is LearningConcept => Boolean(item));
        return (
          <Card key={`${project.id}-${milestone.id}`} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <FolderGit2 size={16} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {project.summary}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="px-1.5 text-[9px] capitalize">
                {project.difficulty}
              </Badge>
            </div>

            <p className="mt-3 text-xs leading-5 text-muted">
              <span className="font-medium text-foreground">Purpose: </span>
              {project.purpose}
            </p>

            <div className="mt-4 rounded-lg border border-border bg-surface-2 p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">Milestone</Badge>
                <h4 className="text-xs font-semibold text-foreground">
                  {milestone.title}
                </h4>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-muted">
                {milestone.description}
              </p>
              {reference.note ? (
                <p className="mt-1.5 text-[11px] leading-5 text-subtle">
                  Why it matters here: {reference.note}
                </p>
              ) : null}
              <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
                <div>
                  <h5 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
                    Requirements
                  </h5>
                  <div className="mt-1.5">
                    <StringList items={milestone.requirements} />
                  </div>
                </div>
                <div>
                  <h5 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
                    Acceptance criteria
                  </h5>
                  <div className="mt-1.5">
                    <StringList items={milestone.acceptanceCriteria} />
                  </div>
                </div>
              </div>
            </div>

            {related.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
                  Related concepts
                </span>
                {related.map((item) => (
                  <span
                    key={item.id}
                    className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

export function ConceptRoadmap() {
  const { state, ready, setConceptCompleted } = useApp();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [resource, setResource] = useState<ResourceState>(null);

  const grouped = useMemo(
    () =>
      conceptCategories
        .map((group) => ({
          category: group,
          items: concepts.filter((concept) => concept.categoryId === group.id),
        }))
        .filter((group) => group.items.length > 0),
    [],
  );

  const overall = conceptCompletion(state);
  const activeConcept = resource ? getConcept(resource.conceptId) : undefined;
  const activeCategory = activeConcept
    ? categoryById.get(activeConcept.categoryId)
    : undefined;

  const closeResource = () => setResource(null);

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Ordered curriculum"
        title="Computer Science Learning Roadmap"
        description="One prerequisite-ordered path through Go, programming fundamentals, the machine, and production systems. Learn with a tailored prompt, use the linked exercises and projects, then check the concept off."
        actions={
          <Badge variant="primary">
            <BookOpen size={11} /> {overall.percent}% complete
          </Badge>
        }
      />

      {!ready ? (
        <div className="mb-4 rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-[10px] text-subtle">
          Loading saved completion state…
        </div>
      ) : null}

      <div className="space-y-4">
        {grouped.map(({ category: group, items }) => {
          const completion = categoryCompletion(state, group.id);
          const isCollapsed = Boolean(collapsed[group.id]);
          return (
            <section
              key={group.id}
              id={`category-${group.id}`}
              aria-labelledby={`category-${group.id}-title`}
              className="scroll-mt-24 overflow-hidden rounded-xl border border-border bg-surface"
            >
              <button
                type="button"
                onClick={() =>
                  setCollapsed((current) => ({
                    ...current,
                    [group.id]: !current[group.id],
                  }))
                }
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2/50"
                aria-expanded={!isCollapsed}
                aria-controls={`category-${group.id}-content`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 font-mono text-[10px] text-subtle">
                  {String(group.order).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id={`category-${group.id}-title`}
                      className="text-sm font-semibold tracking-tight text-foreground"
                    >
                      {group.title}
                    </h2>
                    <Badge
                      variant={completion.percent === 100 ? "success" : "neutral"}
                    >
                      {completion.completed} of {completion.total} completed
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {group.description}
                  </p>
                  <ProgressBar
                    value={completion.percent}
                    tone={completion.percent === 100 ? "success" : "primary"}
                    className="mt-2 h-1 max-w-xs"
                    label={`${group.title} completion`}
                  />
                </div>
                <ChevronDown
                  size={15}
                  className={cn(
                    "mt-1 shrink-0 text-subtle transition-transform",
                    !isCollapsed && "rotate-180",
                  )}
                />
              </button>

              {!isCollapsed ? (
                <div
                  id={`category-${group.id}-content`}
                  className="divide-y divide-border border-t border-border"
                >
                  {items.map((concept) => (
                    <ConceptRow
                      key={concept.id}
                      concept={concept}
                      completed={isConceptComplete(state, concept.id)}
                      onToggle={(completed) =>
                        setConceptCompleted(concept.id, completed)
                      }
                      onOpen={(kind) =>
                        setResource({ kind, conceptId: concept.id })
                      }
                    />
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <p className="mt-8 border-t border-border pt-4 text-[10px] leading-5 text-subtle">
        Work through the categories in order. Checking a concept only records your
        own completion; it does not change prerequisites or related concepts.
      </p>

      {activeConcept ? (
        <Modal
          open={resource !== null}
          onClose={closeResource}
          eyebrow={`${activeCategory?.order ?? ""}. ${activeCategory?.title ?? ""} · Concept ${activeConcept.order}`}
          title={activeConcept.name}
          footer={
            <>
              <button
                type="button"
                onClick={closeResource}
                className={buttonClass("ghost", "sm")}
              >
                Close
              </button>
              {resource?.kind === "prompt" ? (
                <CopyPromptButton
                  prompt={activeConcept.prompt}
                  name={activeConcept.name}
                  label="Copy learning prompt"
                />
              ) : null}
            </>
          }
        >
          {resource?.kind === "prompt" ? (
            <PromptBody concept={activeConcept} />
          ) : null}
          {resource?.kind === "exercises" ? (
            <ExercisesBody concept={activeConcept} />
          ) : null}
          {resource?.kind === "projects" ? (
            <ProjectsBody concept={activeConcept} />
          ) : null}
        </Modal>
      ) : null}
    </div>
  );
}
