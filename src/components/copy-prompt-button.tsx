"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/components/providers";
import { cn, copyText } from "@/lib/utils";

export function CopyPromptButton({
  prompt,
  name,
  className,
  label = "Copy learning prompt",
  copiedLabel = "Copied",
}: {
  prompt: string;
  name: string;
  className?: string;
  label?: string;
  copiedLabel?: string;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    const ok = await copyText(prompt);
    if (!ok) {
      toast("Could not copy the learning prompt.", "error");
      return;
    }
    setCopied(true);
    toast(`Learning prompt for ${name} copied.`, "success");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors",
        copied
          ? "border-success/30 bg-success-soft text-success"
          : "border-primary bg-primary text-primary-foreground shadow-sm hover:border-primary-hover hover:bg-primary-hover",
        className,
      )}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? copiedLabel : label}
    </button>
  );
}
