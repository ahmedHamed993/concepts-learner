"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type LucideIcon,
  BookOpen,
  Braces,
  ChevronLeft,
  Menu,
  MessageSquareCode,
  Moon,
  Route,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { GlobalSearch } from "@/components/global-search";
import { ProgressBar } from "@/components/ui";
import { conceptCompletion } from "@/lib/concept-progress";
import { conceptCategories } from "@/lib/learning-concepts";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: { href: string; label: string }[];
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Learn",
    items: [
      {
        href: "/",
        label: "Learning Roadmap",
        icon: Route,
        children: conceptCategories.map((category) => ({
          href: `/#category-${category.id}`,
          label: category.title,
        })),
      },
      { href: "/prompts", label: "AI Prompt Library", icon: MessageSquareCode },
    ],
  },
  {
    label: "System",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

const pageTitles: { match: (path: string) => boolean; title: string }[] = [
  { match: (path) => path === "/", title: "Learning Roadmap" },
  { match: (path) => path === "/roadmap", title: "Learning Roadmap" },
  { match: (path) => path.startsWith("/prompts"), title: "AI Prompt Library" },
  { match: (path) => path.startsWith("/settings"), title: "Settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state, ready, storageError, storageKind, dismissStorageError, updateSettings } =
    useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = state.settings.sidebarCollapsed;

  useEffect(() => {
    // Navigation is an external event; close the mobile drawer when the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const progress = useMemo(() => conceptCompletion(state), [state]);
  const pageTitle =
    pageTitles.find((item) => item.match(pathname))?.title ?? "Deep Systems";

  const toggleTheme = () => {
    updateSettings({
      theme: state.settings.theme === "dark" ? "light" : "dark",
    });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-[60px] shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex min-w-0 items-center gap-2.5 text-foreground",
            collapsed && "justify-center",
          )}
          aria-label={`${state.settings.platformName} learning roadmap`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Braces size={17} strokeWidth={2.4} />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight">
                {state.settings.platformName}
              </span>
              <span className="block truncate font-mono text-[9px] uppercase tracking-[0.14em] text-subtle">
                Personal CS workspace
              </span>
            </span>
          ) : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={() => updateSettings({ sidebarCollapsed: true })}
            className="hidden rounded p-1.5 text-subtle transition hover:bg-surface-2 hover:text-foreground lg:block"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={15} />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Primary">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            {!collapsed ? (
              <p className="mb-1.5 px-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-subtle">
                {group.label}
              </p>
            ) : (
              <div className="mx-auto mb-2 h-px w-6 bg-border" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/" ||
                      pathname === "/roadmap"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center rounded-md text-[13px] transition-colors",
                        collapsed
                          ? "mx-auto h-9 w-9 justify-center"
                          : "gap-2.5 px-2.5 py-2",
                        active
                          ? "bg-primary-soft font-medium text-primary"
                          : "text-muted hover:bg-surface-2 hover:text-foreground",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon
                        size={16}
                        strokeWidth={active ? 2.2 : 1.8}
                        className="shrink-0"
                      />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      {active && !collapsed ? (
                        <span className="absolute right-2 h-1 w-1 rounded-full bg-primary" />
                      ) : null}
                    </Link>
                    {!collapsed && item.children?.length ? (
                      <ul className="ml-[22px] mt-0.5 space-y-0.5 border-l border-border pl-2.5">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              title={child.label}
                              className="block rounded-md px-2 py-1 text-[11px] leading-4 text-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
                            >
                              <span className="block truncate">{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed ? (
        <div className="shrink-0 space-y-2 border-t border-border p-3">
          <Link
            href="/"
            className="block rounded-lg border border-border bg-surface-2/60 p-3 transition hover:border-border-strong"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-subtle">
                Roadmap progress
              </span>
              <span className="font-mono text-[10px] text-muted">
                {progress.percent}%
              </span>
            </div>
            <p className="mt-1.5 truncate text-xs font-medium text-foreground">
              {progress.completed} of {progress.total} concepts
            </p>
            <ProgressBar value={progress.percent} className="mt-2.5 h-1" />
          </Link>
          <button
            type="button"
            onClick={() => updateSettings({ sidebarCollapsed: true })}
            className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] text-subtle transition hover:bg-surface-2 hover:text-foreground lg:hidden"
          >
            <ChevronLeft size={12} /> Collapse sidebar
          </button>
        </div>
      ) : (
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={() => updateSettings({ sidebarCollapsed: false })}
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <ChevronLeft size={16} className="rotate-180" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-surface transition-[width] duration-200 ease-out lg:block",
          collapsed ? "w-[68px]" : "w-[248px]",
        )}
      >
        {sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="relative h-full w-[280px] max-w-[86vw] border-r border-border bg-surface shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-3 z-10 rounded p-2 text-muted hover:bg-surface-2"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[68px]" : "lg:pl-[248px]",
        )}
      >
        <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-muted transition hover:bg-surface-2 hover:text-foreground lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>

          <div className="hidden min-w-0 flex-1 sm:block">
            <div className="flex items-center gap-2 text-[11px] text-subtle">
              <span className="hidden font-mono uppercase tracking-[0.14em] md:inline">
                Deep Systems / Learn
              </span>
              <span className="hidden text-border-strong md:inline">/</span>
              <span className="truncate font-medium text-muted">{pageTitle}</span>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-1.5 sm:flex-none">
            <div className="w-full max-w-[240px] sm:w-64">
              <GlobalSearch />
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-foreground"
              aria-label={
                state.settings.theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
            >
              {state.settings.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              href="/settings"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-foreground"
              aria-label="Settings"
            >
              <Settings size={16} />
            </Link>
          </div>
        </header>

        {storageError ? (
          <div className="border-b border-danger/25 bg-danger-soft px-4 py-2.5 sm:px-6">
            <div className="mx-auto flex max-w-[1280px] items-start justify-between gap-3">
              <p className="text-xs leading-5 text-danger">{storageError}</p>
              <button
                type="button"
                onClick={dismissStorageError}
                className="shrink-0 rounded p-0.5 text-danger/70 hover:text-danger"
                aria-label="Dismiss storage error"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : null}

        {!ready ? (
          <div className="flex items-center gap-2 border-b border-border bg-surface-2/50 px-4 py-1.5 text-[10px] text-subtle sm:px-6">
            <BookOpen size={11} /> Loading your local workspace from {storageKind}…
          </div>
        ) : null}

        <main id="main-content" className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-7 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-border px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-1 text-[10px] text-subtle sm:flex-row sm:items-center sm:justify-between">
            <span>
              {state.settings.platformName} · ordered CS learning roadmap
            </span>
            <span className="font-mono">
              data: {storageKind} · schema v{state.schemaVersion}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
