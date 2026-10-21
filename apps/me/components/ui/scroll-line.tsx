"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

/** Vertical roadmap line that draws itself as the section scrolls into view. */
export function ScrollLine({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 55%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  return (
    <div ref={ref} className="relative pl-7">
      <span
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-[5px] w-px bg-edge"
      />
      <motion.span
        aria-hidden="true"
        style={{ scaleY }}
        className="absolute top-0 bottom-0 left-[4px] w-[3px] origin-top rounded-full bg-gradient-to-b from-brand to-bronze"
      />
      {children}
    </div>
  );
}
