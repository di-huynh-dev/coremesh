"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ExternalLink, ChevronDown, Star, GitFork } from "lucide-react";
import Link from "next/link";

const projects = [
  {
    name: "coremesh",
    description:
      "A modern blogging platform and content management system built with Next.js.",
    language: "TypeScript",
    languageColor: "#3178C6",
    stars: 0,
    forks: 0,
    href: "https://github.com/di-huynh-dev/coremesh",
    homepage: "https://coremesh-blogs.vercel.app",
    isPrivate: false,
  },
  {
    name: "nextjs16-starter",
    description:
      "The ultimate Next.js 16 starter kit with Bun, Shadcn/ui, Tailwind CSS. Production-ready boilerplate that ships faster.",
    language: "TypeScript",
    languageColor: "#3178C6",
    stars: 0,
    forks: 0,
    href: "https://github.com/di-huynh-dev/nextjs16-starter",
    homepage: "https://nextjs16-starter.vercel.app",
    isPrivate: false,
  },
  {
    name: "create-nextdi-bun-app",
    description:
      "Create a new Next.js 16 Start Kit app with one command. Published on npm.",
    language: "TypeScript",
    languageColor: "#3178C6",
    stars: 0,
    forks: 0,
    href: "https://github.com/di-huynh-dev/create-nextdi-bun-app",
    homepage: "https://www.npmjs.com/package/create-nextdi-bun-app",
    isPrivate: false,
  },
  {
    name: "next-ai-draw-io",
    description:
      "A Next.js web application that integrates AI capabilities with draw.io diagrams through natural language commands.",
    language: "TypeScript",
    languageColor: "#3178C6",
    stars: 0,
    forks: 0,
    href: "https://github.com/di-huynh-dev/next-ai-draw-io",
    homepage: "https://next-ai-drawio.jiang.jp/",
    isPrivate: false,
  },
  {
    name: "bing-images",
    description:
      "Shell scripts for automated image processing and management workflows.",
    language: "Shell",
    languageColor: "#89E051",
    stars: 0,
    forks: 0,
    href: "https://github.com/di-huynh-dev/bing-images",
    homepage: null,
    isPrivate: false,
  },
  {
    name: "autogreen",
    description:
      "Automation tool for keeping GitHub contribution graphs green. MIT Licensed.",
    language: null,
    languageColor: "#8B949E",
    stars: 0,
    forks: 0,
    href: "https://github.com/di-huynh-dev/autogreen",
    homepage: null,
    isPrivate: false,
  },
];

export function ProjectsSection() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section id="projects" className="py-12 section-divider">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full mb-6 group"
          >
            <h2 className="font-mono-data text-muted-foreground group-hover:text-foreground transition-colors">
              Projects
            </h2>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group border border-border rounded-xl p-4 hover:bg-muted/30 hover:border-muted-foreground/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground group-hover:underline decoration-muted-foreground/50">
                            <Link
                              href={project.href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {project.name}
                            </Link>
                          </h3>
                          {project.isPrivate && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono-data border border-border rounded text-muted-foreground">
                              Private
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            href={project.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                          >
                            <Github className="w-4 h-4" />
                          </Link>
                          {project.homepage && (
                            <Link
                              href={project.homepage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {project.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {project.language && (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: project.languageColor }}
                            />
                            <span>{project.language}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" />
                          <span>{project.stars}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5" />
                          <span>{project.forks}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
