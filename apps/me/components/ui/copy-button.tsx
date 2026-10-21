"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${value}`;
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={label}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-edge bg-background px-4 font-mono text-xs text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "ok" : "copy"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.14 }}
          className="inline-flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-brand" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copy email
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
