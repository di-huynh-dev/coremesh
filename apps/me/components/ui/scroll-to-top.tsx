"use client";

import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.button
      onClick={scrollToTop}
      whileTap={{ scale: 0.96 }}
      className={`fixed bottom-5 right-5 z-50 inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-edge bg-background text-foreground shadow-sm transition-all duration-300 hover:border-brand/50 hover:text-brand ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="relative z-10 size-[18px]" strokeWidth={1.8} />
    </motion.button>
  );
}
