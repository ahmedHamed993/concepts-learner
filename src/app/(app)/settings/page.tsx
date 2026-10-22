"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Database,
  Download,
  HardDrive,
  Laptop,
  Moon,
  RotateCcw,
  Save,
  Sun,
  Upload,
} from "lucide-react";
import { useApp, useToast } from "@/components/providers";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
} from "@/components/ui";
import { conceptCompletion } from "@/lib/concept-progress";
import type { AppSettings, ThemeMode } from "@/lib/types";
import { cn, downloadJson } from "@/lib/utils";

const THEMES: { value: ThemeMode; label: string; icon: typeof Sun; description: string }[] = [
  { value: "light", label: "Light", icon: Sun, description: "Warm paper-like surfaces." },
  { value: "dark", label: "Dark", icon: Moon, description: "Low-glare dark surfaces." },
  { value: "system", label: "System", icon: Laptop, description: "Follow the OS setting." },
];

function SettingsContent() {
  const {
    state,
    storageKind,
    storageError,
    dismissStorageError,
    updateSettings,
    exportState,
    importState,
    resetAll,
  } = useApp();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(state.settings.learnerName);
  const [platform, setPlatform] = useState(state.settings.platformName);
  const [pasteJson, setPasteJson] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const syncForm = (settings: AppSettings) => {
    setName(settings.learnerName);
    setPlatform(settings.platformName);
  };

  const saveProfile = () => {
    const learnerName = name.trim() || "Learner";
    const platformName = platform.trim() || "Deep Systems";
    updateSettings({ learnerName, platformName });
    setName(learnerName);
    setPlatform(platformName);
    toast("Profile saved.", "success");
  };

  const handleExport = () => {
    downloadJson(
      `deep-systems-backup-${new Date().toISOString().slice(0, 10)}.json`,
      exportState(),
    );
    toast("Backup downloaded.", "success");
  };

  const handleImportText = (text: string) => {
    const result = importState(text);
    if (!result.ok) {
      toast(result.error ?? "Could not import this backup.", "error");
      return;
    }
    setPasteJson("");
    if (result.state) syncForm(result.state.settings);
    toast("Backup imported. Your local state was replaced.", "success");
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      handleImportText(text);
    } catch {
      toast("Could not read the selected file.", "error");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const doReset = () => {
    const fresh = resetAll();
    syncForm(fresh.settings);
    setConfirmReset(false);
    toast("All local data was reset.", "info");
  };

  const completion = conceptCompletion(state);

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Tune the learning workflow and manage the data stored in this browser."
      />

      {storageError ? (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning-soft/50 p-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />
          <div className="flex-1">
            <p className="text-xs font-medium">Storage notice</p>
            <p className="mt-0.5 text-[11px] leading-5 text-muted">{storageError}</p>
          </div>
          <button
            type="button"
            onClick={dismissStorageError}
            className="text-[10px] text-muted hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold">Profile</h2>
            <p className="mt-1 text-[11px] text-muted">
              Used for personal labels only. Nothing is sent to a server.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Learner name" htmlFor="settings-name">
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              </Field>
              <Field label="Platform name" htmlFor="settings-platform">
                <Input
                  id="settings-platform"
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value)}
                  placeholder="Deep Systems"
                />
              </Field>
            </div>
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="secondary" onClick={saveProfile}>
                <Save size={12} /> Save profile
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold">Appearance</h2>
            <p className="mt-1 text-[11px] text-muted">
              Theme is applied immediately and remembered on this device.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {THEMES.map((theme) => {
                const Icon = theme.icon;
                const active = state.settings.theme === theme.value;
                return (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => {
                      updateSettings({ theme: theme.value });
                      toast(`Theme set to ${theme.label.toLowerCase()}.`, "info");
                    }}
                    className={cn(
                      "rounded-lg border p-3 text-left transition",
                      active
                        ? "border-primary/50 bg-primary-soft/50 ring-1 ring-primary/15"
                        : "border-border hover:border-border-strong",
                    )}
                    aria-pressed={active}
                  >
                    <div className="flex items-center justify-between">
                      <Icon size={15} className={active ? "text-primary" : "text-muted"} />
                      {active ? <Check size={12} className="text-primary" /> : null}
                    </div>
                    <p className="mt-2 text-xs font-medium">{theme.label}</p>
                    <p className="mt-0.5 text-[9px] leading-4 text-subtle">{theme.description}</p>
                  </button>
                );
              })}
            </div>
          </Card>

        </div>

        <div className="space-y-4 lg:sticky lg:top-[76px]">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-primary" />
              <h2 className="text-sm font-semibold">Your data</h2>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: "Completed", value: completion.completed },
                { label: "Remaining", value: completion.total - completion.completed },
                { label: "Concepts", value: completion.total },
                { label: "Prompts", value: state.prompts.custom.length },
              ].map((item) => (
                <div key={item.label} className="rounded-md border border-border bg-surface-2/50 p-2.5">
                  <p className="font-mono text-base font-semibold tabular-nums leading-none">{item.value}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-subtle">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
              <HardDrive size={11} className="text-subtle" />
              <p className="text-[10px] text-muted">
                Storage: <span className="font-mono text-foreground">{storageKind}</span>
              </p>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-subtle">
              Roadmap completion and custom prompts live in this browser. Export a backup before
              clearing site data.
            </p>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold">Backup and restore</h2>
            <div className="mt-3 grid gap-2">
              <Button size="sm" variant="secondary" onClick={handleExport}>
                <Download size={12} /> Export JSON
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload size={12} /> Import backup file
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => void handleFile(event.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => setShowPaste((value) => !value)}
                className="text-[10px] text-muted hover:text-foreground"
              >
                {showPaste ? "Hide JSON input" : "Or paste JSON instead"}
              </button>
              {showPaste ? (
                <div>
                  <textarea
                    value={pasteJson}
                    onChange={(event) => setPasteJson(event.target.value)}
                    placeholder='{"schemaVersion": 2, ...}'
                    className="min-h-28 w-full rounded-md border border-border bg-surface p-2 font-mono text-[10px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    aria-label="Paste backup JSON"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    disabled={!pasteJson.trim()}
                    onClick={() => handleImportText(pasteJson)}
                  >
                    Import pasted JSON
                  </Button>
                </div>
              ) : null}
            </div>
            <p className="mt-3 text-[9px] leading-4 text-subtle">
              Import validates the schema and replaces current local state. Invalid files are
              rejected before anything changes.
            </p>
          </Card>

          <Card className="border-danger/25 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-danger" />
              <h2 className="text-sm font-semibold">Reset local data</h2>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-muted">
              Deletes roadmap completion, custom prompts, and settings from this browser. Export a
              backup first.
            </p>
            {confirmReset ? (
              <div className="mt-3 grid gap-2">
                <p className="rounded-md border border-danger/25 bg-danger-soft p-2 text-[10px] font-medium text-danger">
                  This cannot be undone. Confirm reset.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="danger" onClick={doReset}>
                    <RotateCcw size={12} /> Reset
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="danger"
                className="mt-3 w-full"
                onClick={() => setConfirmReset(true)}
              >
                <RotateCcw size={12} /> Reset everything
              </Button>
            )}
          </Card>

          <div className="px-1 text-[9px] leading-5 text-subtle">
            <p className="font-mono uppercase tracking-wider">Deep Systems</p>
            <p>Local-first CS learning workspace. No accounts, telemetry, or AI calls.</p>
            <p className="mt-1">Schema v{state.schemaVersion} · Next.js · Go curriculum</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { ready } = useApp();
  if (!ready) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-surface-3" />
        <div className="h-56 animate-pulse rounded-xl bg-surface-3" />
      </div>
    );
  }
  return <SettingsContent />;
}
