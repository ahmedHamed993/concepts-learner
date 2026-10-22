"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Search, Sparkles, X } from "lucide-react";
import { useApp } from "@/components/providers";
import { seedPrompts } from "@/lib/prompts";
import { searchPrompts } from "@/lib/search";
import {
  categoryById,
  filterConcepts,
} from "@/lib/learning-concepts";
import { Kbd } from "@/components/ui";
import { cn } from "@/lib/utils";

type Result = {
  id: string;
  type: "concept" | "prompt";
  title: string;
  description: string;
  href: string;
  meta: string;
};

export function GlobalSearch() {
  const { state } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const prompts = useMemo(
    () => [...state.prompts.custom, ...seedPrompts],
    [state.prompts.custom],
  );

  const results = useMemo<Result[]>(() => {
    const needle = query.trim();
    if (needle.length < 2) return [];

    const conceptResults = filterConcepts(needle, "all")
      .slice(0, 7)
      .map((concept) => ({
        id: concept.id,
        type: "concept" as const,
        title: concept.name,
        description: concept.description,
        href: `/#category-${concept.categoryId}`,
        meta: categoryById.get(concept.categoryId)?.title ?? "Concept",
      }));

    const promptResults = searchPrompts(prompts, needle)
      .slice(0, 3)
      .map((prompt) => ({
        id: prompt.id,
        type: "prompt" as const,
        title: prompt.title,
        description: prompt.description,
        href: `/prompts?prompt=${prompt.id}`,
        meta: prompt.category,
      }));

    return [...conceptResults, ...promptResults].slice(0, 10);
  }, [query, prompts]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    setActive(0);
    router.push(href);
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setActive(0);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) setOpen(true);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(results.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(0, current - 1));
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active].href);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[340px]">
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            updateQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search concepts and prompts"
          aria-label="Global search"
          className="h-9 w-full rounded-md border border-border bg-surface-2/70 pl-9 pr-16 text-xs text-foreground placeholder:text-subtle focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-[13px]"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              updateQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-subtle hover:text-foreground"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        ) : (
          <span className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        )}
      </div>

      {open && query.trim().length >= 2 ? (
        <div className="absolute right-0 top-11 z-50 w-[min(88vw,440px)] overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted">
              No matches for{" "}
              <span className="font-medium text-foreground">{query}</span>.
            </div>
          ) : (
            <ul className="max-h-[360px] overflow-y-auto py-1" role="listbox">
              {results.map((result, index) => (
                <li
                  key={`${result.type}-${result.id}`}
                  role="option"
                  aria-selected={index === active}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(result.href)}
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
                      index === active ? "bg-surface-2" : "hover:bg-surface-2/60",
                    )}
                  >
                    <span className="mt-0.5 text-subtle">
                      {result.type === "prompt" ? (
                        <Sparkles size={14} />
                      ) : (
                        <BookOpen size={14} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium text-foreground">
                          {result.title}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-subtle">
                          {result.meta}
                        </span>
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-[11px] text-muted">
                        {result.description}
                      </span>
                    </span>
                    <ArrowRight size={12} className="mt-1 shrink-0 text-subtle" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border bg-surface-2/50 px-3 py-2 text-[10px] text-subtle">
            ↑ ↓ to navigate · Enter to open · Esc to close
          </div>
        </div>
      ) : null}
    </div>
  );
}
