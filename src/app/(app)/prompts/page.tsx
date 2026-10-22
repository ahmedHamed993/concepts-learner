"use client";

import {
  Suspense,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Filter,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Variable,
  X,
} from "lucide-react";
import { useApp, useToast } from "@/components/providers";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";
import { getTopic } from "@/lib/curriculum";
import { seedPrompts } from "@/lib/prompts";
import {
  buildVariablesFromTemplate,
  defaultVariableValues,
  missingRequiredVariables,
  renderPrompt,
} from "@/lib/template";
import { PROMPT_CATEGORIES, type PromptCategory, type PromptTemplate } from "@/lib/types";
import { cn, copyText, uid } from "@/lib/utils";

function PromptLibrary() {
  const searchParams = useSearchParams();
  const { state, ready, toggleFavorite, recordPromptUse, saveCustomPrompt, deleteCustomPrompt, setPromptValues } = useApp();
  const { toast } = useToast();
  const initialPrompt = searchParams.get("prompt") ?? "";
  const initialTopic = searchParams.get("topic") ?? "";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [phase, setPhase] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(initialPrompt);
  const [valuesDraft, setValuesDraft] = useState<Record<string, string> | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<PromptCategory>("Learn a Concept");
  const [newDescription, setNewDescription] = useState("");
  const [newTemplate, setNewTemplate] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const deferredQuery = useDeferredValue(query);
  const detailRef = useRef<HTMLDivElement>(null);

  const prompts = useMemo(
    () => [...state.prompts.custom, ...seedPrompts],
    [state.prompts.custom],
  );

  const selected = prompts.find((prompt) => prompt.id === selectedId) ?? null;
  const recent = state.prompts.recentIds
    .map((id) => prompts.find((prompt) => prompt.id === id))
    .filter((prompt): prompt is PromptTemplate => Boolean(prompt))
    .slice(0, 4);

  const linkedTopic = initialTopic ? getTopic(initialTopic) : undefined;

  const initialValues = useMemo(() => {
    if (!selected) return {};
    const defaults = defaultVariableValues(selected.variables);
    const topicSeed: Record<string, string> = {};
    if (linkedTopic) {
      selected.variables.forEach((variable) => {
        if (["concept", "topic", "project", "workload"].includes(variable.key)) {
          topicSeed[variable.key] = linkedTopic.title;
        }
        if (variable.key === "code" && linkedTopic.codeExamples[0]) {
          topicSeed[variable.key] = linkedTopic.codeExamples[0].code;
        }
        if (variable.key === "difficulty") topicSeed[variable.key] = linkedTopic.difficulty;
      });
    }
    return {
      ...defaults,
      ...state.prompts.values[selected.id],
      ...topicSeed,
    };
  }, [selected, linkedTopic, state.prompts.values]);

  const values = valuesDraft ?? initialValues;

  const updateValue = (key: string, value: string) => {
    setValuesDraft({ ...values, [key]: value });
  };

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return prompts.filter((prompt) => {
      if (favoritesOnly && !state.prompts.favorites.includes(prompt.id)) return false;
      if (category !== "all" && prompt.category !== category) return false;
      if (phase !== "all" && !prompt.phases.includes(Number(phase))) return false;
      if (difficulty !== "all" && prompt.difficulty !== difficulty) return false;
      if (
        needle &&
        !prompt.title.toLowerCase().includes(needle) &&
        !prompt.description.toLowerCase().includes(needle) &&
        !prompt.category.toLowerCase().includes(needle) &&
        !prompt.keywords.some((keyword) => keyword.toLowerCase().includes(needle)) &&
        !prompt.template.toLowerCase().includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [prompts, favoritesOnly, category, phase, difficulty, deferredQuery, state.prompts.favorites]);

  const missing = selected ? missingRequiredVariables(selected, values) : [];
  const rendered = selected
    ? renderPrompt(selected.template, values)
    : "";
  const activeFilters = Boolean(query || category !== "all" || phase !== "all" || difficulty !== "all" || favoritesOnly);

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setPhase("all");
    setDifficulty("all");
    setFavoritesOnly(false);
  };

  const selectPrompt = (prompt: PromptTemplate) => {
    setSelectedId(prompt.id);
    setValuesDraft(null);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      window.setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  const copyConfiguredPrompt = async (prompt: PromptTemplate, filledValues: Record<string, string>) => {
    const requiredMissing = missingRequiredVariables(prompt, filledValues);
    if (requiredMissing.length > 0) {
      toast(`Fill in: ${requiredMissing.map((item) => item.label).join(", ")}.`, "error");
      selectPrompt(prompt);
      return;
    }
    const ok = await copyText(renderPrompt(prompt.template, filledValues));
    setPromptValues(prompt.id, filledValues);
    recordPromptUse(prompt.id);
    toast(ok ? "Prompt copied to clipboard." : "Could not copy the prompt.", ok ? "success" : "error");
  };

  const saveCurrentValues = () => {
    if (!selected) return;
    setPromptValues(selected.id, values);
    toast("Variable values saved for this prompt.", "success");
  };

  const createPrompt = () => {
    if (!newTitle.trim() || !newTemplate.trim()) {
      toast("A title and prompt template are required.", "error");
      return;
    }
    const prompt: PromptTemplate = {
      id: uid("prompt"),
      title: newTitle.trim(),
      description: newDescription.trim() || "Custom prompt.",
      category: newCategory,
      template: newTemplate,
      keywords: newKeywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      phases: [1, 2, 3, 4, 5, 6, 7, 8],
      difficulty: "intermediate",
      variables: buildVariablesFromTemplate(newTemplate),
      source: "user",
      createdAt: new Date().toISOString(),
    };
    saveCustomPrompt(prompt);
    setSelectedId(prompt.id);
    setValuesDraft(null);
    setCreatorOpen(false);
    setNewTitle("");
    setNewDescription("");
    setNewTemplate("");
    setNewKeywords("");
    toast("Custom prompt created.", "success");
  };

  if (!ready) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-surface-3" />
        <div className="h-14 animate-pulse rounded-xl bg-surface-3" />
        <div className="grid gap-3 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-xl bg-surface-3" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Toolkit"
        title="Prompt Library"
        description="Reusable prompts for learning, tracing, debugging, reviewing, and interviewing. Fill variables once, then copy anywhere."
        actions={
          <Button size="sm" onClick={() => setCreatorOpen((open) => !open)}>
            <Plus size={13} /> New prompt
          </Button>
        }
      />

      {creatorOpen ? (
        <Card className="mb-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Create a custom prompt</h2>
              <p className="mt-1 text-[11px] text-muted">
                Variables written as <code className="rounded bg-surface-2 px-1">{`{{name}}`}</code> are
                detected automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreatorOpen(false)}
              className="rounded p-1 text-subtle hover:text-foreground"
              aria-label="Close prompt creator"
            >
              <X size={14} />
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Title" htmlFor="new-prompt-title">
              <Input
                id="new-prompt-title"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="e.g. Explain a runtime trace"
              />
            </Field>
            <Field label="Category" htmlFor="new-prompt-category">
              <Select
                id="new-prompt-category"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value as PromptCategory)}
              >
                {PROMPT_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Description" htmlFor="new-prompt-description" className="sm:col-span-2">
              <Input
                id="new-prompt-description"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="What should this prompt help with?"
              />
            </Field>
            <Field label="Prompt template" htmlFor="new-prompt-template" className="sm:col-span-2">
              <Textarea
                id="new-prompt-template"
                value={newTemplate}
                onChange={(event) => setNewTemplate(event.target.value)}
                placeholder="Teach me {{concept}} starting from..."
                className="min-h-32 font-mono text-xs"
              />
            </Field>
            <Field label="Keywords (comma separated)" htmlFor="new-prompt-keywords" className="sm:col-span-2">
              <Input
                id="new-prompt-keywords"
                value={newKeywords}
                onChange={(event) => setNewKeywords(event.target.value)}
                placeholder="runtime, trace, scheduler"
              />
            </Field>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setCreatorOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={createPrompt}>
              <Check size={13} /> Create prompt
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="mb-4 rounded-xl border border-border bg-surface p-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search prompts by purpose, keyword, or text..."
              className="h-9 pl-9 pr-9 text-xs"
              aria-label="Search prompts"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-subtle hover:text-foreground"
                aria-label="Clear prompt search"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={favoritesOnly ? "primary" : "outline"}
              onClick={() => setFavoritesOnly((value) => !value)}
            >
              <Star size={12} className={favoritesOnly ? "fill-current" : ""} />
              Favorites
              {state.prompts.favorites.length > 0 ? (
                <span className="font-mono text-[9px] opacity-70">
                  {state.prompts.favorites.length}
                </span>
              ) : null}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters((value) => !value)}
              className="sm:hidden"
            >
              <Filter size={12} /> Filters
            </Button>
          </div>
        </div>
        <div className={cn("mt-2.5 gap-2 sm:flex", showFilters ? "flex flex-wrap" : "hidden sm:flex")}>
          <Select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-8 w-auto min-w-[160px] text-[11px]"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {PROMPT_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            value={phase}
            onChange={(event) => setPhase(event.target.value)}
            className="h-8 w-auto min-w-[130px] text-[11px]"
            aria-label="Filter by phase"
          >
            <option value="all">All phases</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
              <option key={number} value={number}>
                Phase {number}
              </option>
            ))}
          </Select>
          <Select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="h-8 w-auto min-w-[120px] text-[11px]"
            aria-label="Filter by difficulty"
          >
            <option value="all">Any level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
          {activeFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-1 text-[10px] text-muted hover:text-foreground"
            >
              <X size={11} /> Clear
            </button>
          ) : null}
        </div>
      </div>

      {recent.length > 0 && !activeFilters ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-subtle">Recent</span>
          {recent.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => selectPrompt(prompt)}
              className="rounded border border-border bg-surface px-2 py-1 text-[10px] text-muted transition hover:border-primary/40 hover:text-primary"
            >
              {prompt.title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            {filtered.length} prompt{filtered.length === 1 ? "" : "s"}
          </p>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={18} />}
              title="No matching prompts"
              description="Try another category, clear your filters, or create a custom prompt for your workflow."
              action={
                activeFilters ? (
                  <Button size="sm" variant="outline" onClick={resetFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setCreatorOpen(true)}>
                    <Plus size={12} /> New prompt
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid gap-2.5 md:grid-cols-2">
              {filtered.map((prompt) => {
                const favorite = state.prompts.favorites.includes(prompt.id);
                const isSelected = prompt.id === selectedId;
                return (
                  <Card
                    key={prompt.id}
                    className={cn(
                      "flex cursor-pointer flex-col p-4 transition",
                      isSelected
                        ? "border-primary/50 ring-1 ring-primary/15"
                        : "hover:border-border-strong",
                    )}
                    onClick={() => selectPrompt(prompt)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-xs font-semibold leading-5">{prompt.title}</h2>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-subtle">
                          {prompt.category}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        {prompt.source === "user" ? <Badge variant="outline">Custom</Badge> : null}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavorite(prompt.id);
                          }}
                          className={cn(
                            "rounded p-1.5 transition",
                            favorite
                              ? "text-warning"
                              : "text-subtle hover:text-foreground",
                          )}
                          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                          aria-pressed={favorite}
                        >
                          <Star size={13} className={favorite ? "fill-current" : ""} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 flex-1 text-[11px] leading-5 text-muted">{prompt.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5">
                      <Badge variant="neutral">{prompt.difficulty}</Badge>
                      <span className="inline-flex items-center gap-1 text-[9px] text-subtle">
                        <Variable size={9} /> {prompt.variables.length} variable
                        {prompt.variables.length === 1 ? "" : "s"}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                        Use <ArrowRight size={10} />
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div ref={detailRef} className="scroll-mt-20 xl:sticky xl:top-[76px]">
          {!selected ? (
            <Card className="p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-primary">
                <Sparkles size={16} />
              </div>
              <h2 className="mt-3 text-sm font-semibold">Choose a prompt</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted">
                Select a prompt to fill in its variables, preview the final text, and copy it into
                any AI assistant. Everything stays on this device.
              </p>
              <div className="mt-4 border-t border-border pt-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-subtle">Workflow</p>
                <ol className="mt-2 space-y-1.5 text-[11px] text-muted">
                  <li>1. Pick a prompt for the task.</li>
                  <li>2. Fill the required variables.</li>
                  <li>3. Copy and paste into your model.</li>
                </ol>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-primary">
                    {selected.category}
                  </p>
                  <h2 className="mt-1 text-sm font-semibold leading-5">{selected.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId("");
                    setValuesDraft(null);
                  }}
                  className="rounded p-1 text-subtle hover:text-foreground"
                  aria-label="Close prompt detail"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-muted">{selected.description}</p>

              {linkedTopic && selected.id === initialPrompt ? (
                <div className="mt-3 rounded-md border border-primary/20 bg-primary-soft/50 p-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-primary">Roadmap context</p>
                  <Link
                    href="/"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium hover:underline"
                  >
                    {linkedTopic.title} <ArrowRight size={10} />
                  </Link>
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                {selected.variables.length === 0 ? (
                  <p className="rounded-md border border-border bg-surface-2 p-2.5 text-[11px] text-muted">
                    This prompt has no variables. Copy it as-is.
                  </p>
                ) : (
                  selected.variables.map((variable) => (
                    <Field
                      key={variable.key}
                      label={`${variable.label}${variable.required ? "" : " (optional)"}`}
                      hint={`{{${variable.key}}}`}
                      htmlFor={`variable-${variable.key}`}
                    >
                      {variable.type === "textarea" ? (
                        <Textarea
                          id={`variable-${variable.key}`}
                          value={values[variable.key] ?? ""}
                          onChange={(event) => updateValue(variable.key, event.target.value)}
                          placeholder={variable.placeholder}
                          className="min-h-24 font-mono text-[11px]"
                        />
                      ) : variable.type === "select" ? (
                        <Select
                          id={`variable-${variable.key}`}
                          value={values[variable.key] ?? ""}
                          onChange={(event) => updateValue(variable.key, event.target.value)}
                        >
                          {variable.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          id={`variable-${variable.key}`}
                          value={values[variable.key] ?? ""}
                          onChange={(event) => updateValue(variable.key, event.target.value)}
                          placeholder={variable.placeholder}
                          className="h-9 text-xs"
                        />
                      )}
                    </Field>
                  ))
                )}
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-subtle">Preview</p>
                  {missing.length > 0 ? (
                    <span className="text-[9px] text-warning">
                      {missing.length} required field{missing.length === 1 ? "" : "s"} missing
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] text-success">
                      <Check size={9} /> Ready to copy
                    </span>
                  )}
                </div>
                <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-surface-2 p-3 font-mono text-[10px] leading-5 text-muted">
                  {rendered}
                </pre>
              </div>

              <div className="mt-3 grid gap-2">
                <Button size="sm" onClick={() => void copyConfiguredPrompt(selected, values)} disabled={missing.length > 0}>
                  <Copy size={12} /> Copy prompt
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={saveCurrentValues}>
                    Save values
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFavorite(selected.id)}
                  >
                    <Star
                      size={12}
                      className={state.prompts.favorites.includes(selected.id) ? "fill-current text-warning" : ""}
                    />
                    {state.prompts.favorites.includes(selected.id) ? "Favorited" : "Favorite"}
                  </Button>
                </div>
                {selected.source === "user" ? (
                  <button
                    type="button"
                    onClick={() => {
                      deleteCustomPrompt(selected.id);
                      setSelectedId("");
                      setValuesDraft(null);
                      toast("Custom prompt deleted.", "info");
                    }}
                    className="inline-flex items-center justify-center gap-1 py-1 text-[10px] text-subtle hover:text-danger"
                  >
                    <Trash2 size={10} /> Delete custom prompt
                  </button>
                ) : null}
              </div>

              <details className="mt-3 border-t border-border pt-2.5">
                <summary className="flex cursor-pointer list-none items-center gap-1 text-[10px] text-muted hover:text-foreground">
                  <ChevronDown size={11} /> Template source
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-[9px] leading-5 text-subtle">
                  {selected.template}
                </pre>
              </details>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PromptsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-surface-3" />
          <div className="h-14 animate-pulse rounded-xl bg-surface-3" />
          <div className="grid gap-3 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-xl bg-surface-3" />
            ))}
          </div>
        </div>
      }
    >
      <PromptLibrary />
    </Suspense>
  );
}
