"use client";

import React, { useState, useEffect } from "react";
import { FiList, FiX, FiChevronRight } from "react-icons/fi";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TOCSidebarProps {
  items: TocItem[];
  isOpen: boolean;
  onClose: () => void;
}

const TOCSidebar: React.FC<TOCSidebarProps> = ({ items, isOpen, onClose }) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0% -70% 0%", threshold: 0 },
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // On mobile close the sidebar after clicking
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 z-40
          flex flex-col
          bg-background/95 backdrop-blur-xl
          border-l border-card-border
          transition-transform duration-300 ease-in-out
          lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:w-56 lg:flex-shrink-0
          lg:border lg:border-card-border lg:rounded-2xl lg:bg-card-bg/60
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-card-border lg:border-none lg:pt-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
            <FiList className="w-3.5 h-3.5" />
            On this page
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
            aria-label="Close table of contents"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin">
          {items.length === 0 ? (
            <p className="text-xs text-text-muted px-2 py-2">
              No headings found.
            </p>
          ) : (
            items.map((item, index) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id + index}
                  onClick={() => handleClick(item.id)}
                  className={`
                    w-full text-left flex items-start gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer
                    ${item.level === 3 ? "pl-5" : ""}
                    ${
                      isActive
                        ? "text-foreground font-semibold bg-foreground/5"
                        : "text-text-muted hover:text-foreground hover:bg-foreground/5 font-normal"
                    }
                  `}
                >
                  {isActive && (
                    <FiChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-sky-500" />
                  )}
                  <span className="leading-relaxed">{item.text}</span>
                </button>
              );
            })
          )}
        </nav>
      </aside>
    </>
  );
};

export default TOCSidebar;
