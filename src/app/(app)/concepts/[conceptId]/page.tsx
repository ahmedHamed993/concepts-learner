import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FolderGit2,
  GitBranch,
  Lightbulb,
  ListChecks,
  Target,
} from "lucide-react";
import { CopyPromptButton } from "@/components/copy-prompt-button";
import { ConceptCompleteToggle } from "@/components/concept-complete-toggle";
import {
  Badge,
  Card,
  PageHeader,
  SectionHeading,
} from "@/components/ui";
import {
  categoryById,
  conceptsByCategory,
  getConcept,
  getProjectMilestone,
} from "@/lib/learning";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  const concept = getConcept(conceptId);
  return {
    title: concept ? `${concept.name} · Roadmap` : "Concept not found",
  };
}

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

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  const concept = getConcept(conceptId);

  if (!concept) notFound();

  const category = categoryById.get(concept.categoryId);
  const categoryConcepts = conceptsByCategory(concept.categoryId);
  const position = categoryConcepts.findIndex((item) => item.id === concept.id);
  const previous = position > 0 ? categoryConcepts[position - 1] : undefined;
  const next =
    position >= 0 && position < categoryConcepts.length - 1
      ? categoryConcepts[position + 1]
      : undefined;

  const prerequisites = concept.prerequisiteIds
    .map((id) => getConcept(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const related = concept.relatedIds
    .map((id) => getConcept(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const projectRefs = concept.projectRefs
    .map((reference) => {
      const resolved = getProjectMilestone(
        reference.projectId,
        reference.milestoneId,
      );
      return resolved ? { reference, ...resolved } : undefined;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft size={13} /> Learning roadmap
        </Link>
        <span className="text-border-strong">/</span>
        <Link
          href={`/roadmap?q=${encodeURIComponent(category?.title ?? "")}`}
          className="hover:text-foreground"
        >
          {category?.title}
        </Link>
        <span className="text-border-strong">/</span>
        <span className="font-mono">#{String(concept.order).padStart(2, "0")}</span>
      </div>

      <PageHeader
        eyebrow={`${category?.order}. ${category?.title} · Concept ${concept.order} of ${categoryConcepts.length}`}
        title={concept.name}
        description={concept.description}
        actions={
          <>
            <ConceptCompleteToggle
              conceptId={concept.id}
              conceptName={concept.name}
            />
            <Badge
              variant={difficultyVariant(concept.difficulty)}
              className="capitalize"
            >
              {concept.difficulty}
            </Badge>
          </>
        }
      />

      <section aria-labelledby="overview">
        <SectionHeading title="Overview" />
        <Card className="p-5">
          <p className="text-sm leading-7 text-muted">{concept.description}</p>
          <dl className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-subtle">
                Category
              </dt>
              <dd className="mt-1 text-xs font-medium">{category?.title}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-subtle">
                Position
              </dt>
              <dd className="mt-1 text-xs font-medium">
                {concept.order} of {categoryConcepts.length}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-subtle">
                Exercises
              </dt>
              <dd className="mt-1 text-xs font-medium">{concept.exercises.length}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-subtle">
                Linked projects
              </dt>
              <dd className="mt-1 text-xs font-medium">{projectRefs.length}</dd>
            </div>
          </dl>
        </Card>
      </section>

      <section aria-labelledby="prerequisites">
        <SectionHeading
          title="Prerequisites"
          description="Finish these concepts first so the new material has a foundation."
          action={<Badge variant="neutral">{prerequisites.length}</Badge>}
        />
        {prerequisites.length === 0 ? (
          <Card className="flex items-center gap-2.5 p-4 text-xs text-muted">
            <GitBranch size={14} className="text-success" />
            No prerequisites. This is a starting point for the curriculum.
          </Card>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {prerequisites.map((prerequisite) => (
              <Link key={prerequisite.id} href={`/concepts/${prerequisite.id}`}>
                <Card className="flex items-start gap-3 p-3.5 transition-colors hover:border-border-strong">
                  <span className="mt-0.5 flex h-6 w-7 shrink-0 items-center justify-center rounded border border-border bg-surface-2 font-mono text-[10px] text-subtle">
                    {String(prerequisite.order).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-5 text-foreground">
                      {prerequisite.name}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-muted">
                      {prerequisite.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="learning-prompt">
        <SectionHeading
          title="Learning Prompt"
          description="Paste this into an AI assistant and answer its questions before moving on."
          action={
            <CopyPromptButton
              prompt={concept.prompt}
              name={concept.name}
              label="Copy prompt"
            />
          }
        />
        <Card className="p-0">
          <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap p-4 font-mono text-[11px] leading-6 text-muted">
            {concept.prompt}
          </pre>
        </Card>
      </section>

      <section aria-labelledby="exercises">
        <SectionHeading
          title="Exercises"
          description="Complete both exercises with the acceptance criteria and tests, not just a working demo."
          action={<Badge variant="neutral">{concept.exercises.length}</Badge>}
        />
        <div className="space-y-4">
          {concept.exercises.map((exercise, index) => (
            <Card key={exercise.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary-soft font-mono text-[11px] text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                      {exercise.title}
                    </h3>
                    <p className="mt-1 text-xs leading-6 text-muted">
                      {exercise.problem}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={difficultyVariant(exercise.difficulty)}
                  className="shrink-0 capitalize"
                >
                  {exercise.difficulty}
                </Badge>
              </div>

              <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">
                    <Target size={12} /> Objectives
                  </h4>
                  <div className="mt-2">
                    <StringList items={exercise.objectives} />
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">
                    <ClipboardList size={12} /> Requirements
                  </h4>
                  <div className="mt-2">
                    <StringList items={exercise.requirements} />
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">
                    <CheckCircle2 size={12} /> Acceptance criteria
                  </h4>
                  <div className="mt-2">
                    <StringList items={exercise.acceptanceCriteria} />
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">
                    <ListChecks size={12} /> Tests and observations
                  </h4>
                  <div className="mt-2">
                    <StringList items={exercise.testCases} />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-3">
                <details className="group rounded-md border border-border bg-surface-2 px-3 py-2">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-medium text-muted hover:text-foreground">
                    <Lightbulb size={12} /> Hints ({exercise.hints.length})
                  </summary>
                  <div className="mt-2">
                    <StringList items={exercise.hints} />
                  </div>
                </details>
                <details className="group rounded-md border border-warning/25 bg-warning-soft px-3 py-2">
                  <summary className="cursor-pointer list-none text-[11px] font-medium text-warning">
                    Reveal solution explanation
                  </summary>
                  <p className="mt-2 text-xs leading-6 text-muted">
                    {exercise.solution}
                  </p>
                </details>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="projects">
        <SectionHeading
          title="Related Projects and Milestones"
          description="Apply the concept inside a larger build with explicit acceptance criteria."
          action={<Badge variant="neutral">{projectRefs.length}</Badge>}
        />
        <div className="space-y-3">
          {projectRefs.map(({ reference, project, milestone }) => (
            <Card key={`${project.id}-${milestone.id}`} className="p-5">
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
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="capitalize">
                    {project.difficulty}
                  </Badge>
                  <Badge variant="neutral">
                    {project.milestones.length} milestones
                  </Badge>
                </div>
              </div>

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
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="related-concepts">
        <SectionHeading
          title="Related Concepts"
          description="Follow these links to compare nearby ideas or continue the sequence."
          action={<Badge variant="neutral">{related.length}</Badge>}
        />
        {related.length === 0 ? (
          <Card className="p-4 text-xs text-muted">
            No related concepts are listed for this entry.
          </Card>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link key={item.id} href={`/concepts/${item.id}`}>
                <Card className="h-full p-3.5 transition-colors hover:border-border-strong">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-subtle">
                      {String(item.order).padStart(2, "0")}
                    </span>
                    <Badge variant="outline" className="px-1.5 text-[9px]">
                      {categoryById.get(item.categoryId)?.title}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold leading-5 text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted">
                    {item.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <nav className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        {previous ? (
          <Link
            href={`/concepts/${previous.id}`}
            className="group inline-flex items-center gap-2 text-xs text-muted hover:text-foreground"
          >
            <ArrowLeft size={13} className="text-subtle" />
            <span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-subtle">
                Previous
              </span>
              {previous.name}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/concepts/${next.id}`}
            className="group inline-flex items-center gap-2 text-right text-xs text-muted hover:text-foreground sm:ml-auto"
          >
            <span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-subtle">
                Next
              </span>
              {next.name}
            </span>
            <ArrowRight size={13} className="text-subtle" />
          </Link>
        ) : (
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline sm:ml-auto"
          >
            <BookOpen size={13} /> Back to learning roadmap
          </Link>
        )}
      </nav>
    </div>
  );
}
