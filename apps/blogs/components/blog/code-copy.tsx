"use client";

import { useEffect } from "react";

/**
 * Adds a copy button to every <pre> inside `targetId`. The markup comes from
 * dangerouslySetInnerHTML, so React never reconciles these nodes.
 */
export function CodeCopy({
  targetId,
  label,
  copiedLabel,
}: {
  targetId: string;
  label: string;
  copiedLabel: string;
}) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;

    const timers: number[] = [];
    const buttons = [...root.querySelectorAll("pre")].map((pre) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = label;
      button.addEventListener("click", async () => {
        const code = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = copiedLabel;
          button.dataset.copied = "";
          timers.push(
            window.setTimeout(() => {
              button.textContent = label;
              delete button.dataset.copied;
            }, 1600),
          );
        } catch {
          // Clipboard blocked (permissions / insecure origin); leave the button as is.
        }
      });
      // Titled blocks (lib/content/mdx.tsx) keep the button in their header bar.
      (pre.closest(".code-block") ?? pre).append(button);
      return button;
    });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      buttons.forEach((button) => button.remove());
    };
  }, [targetId, label, copiedLabel]);

  return null;
}
