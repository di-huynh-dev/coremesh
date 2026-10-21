"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Cluster = { base: string; full: string };

/** Splits into [base letter + its Vietnamese tone/vowel marks] clusters. */
function toClusters(text: string): Cluster[] {
  const clusters: Cluster[] = [];
  for (const ch of text.normalize("NFD")) {
    if (/[̀-ͯ]/.test(ch) && clusters.length > 0) {
      clusters[clusters.length - 1].full += ch;
    } else {
      clusters.push({ base: ch, full: ch });
    }
  }
  return clusters.map((c) => ({ ...c, full: c.full.normalize("NFC") }));
}

/** Letters appear plain, then their diacritics "drop in" one by one. */
export function AnimatedName({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const clusters = useMemo(() => toClusters(text), [text]);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setArmed(true), 650);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {clusters.map((cluster, index) => {
          const accented = cluster.base !== cluster.full;
          const show = reduce || armed;
          if (!accented) {
            return <span key={index}>{cluster.base}</span>;
          }
          return (
            <motion.span
              key={`${index}-${show ? "full" : "base"}`}
              className="inline-block"
              initial={show && !reduce ? { y: -7, scale: 1.18 } : false}
              animate={{ y: 0, scale: 1 }}
              transition={{
                delay: reduce ? 0 : index * 0.12,
                type: "spring",
                stiffness: 520,
                damping: 14,
              }}
            >
              {show ? cluster.full : cluster.base}
            </motion.span>
          );
        })}
      </span>
    </>
  );
}
