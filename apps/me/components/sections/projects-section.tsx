"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ExternalLink, ChevronDown, Star, GitFork } from "lucide-react";
import Link from "next/link";

type GitHubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  homepage: string | null;
  private: boolean;
  fork: boolean;
};

type Project = {
  name: string;
  description: string;
  language: string | null;
  languageColor: string;
  stars: number;
  forks: number;
  href: string;
  homepage: string | null;
  isPrivate: boolean;
};

const GITHUB_USERNAME = "di-huynh-dev";
const GITHUB_REPOS_API = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100&direction=desc`;

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#f1e05a",
  Shell: "#89E051",
  CSS: "#1572B6",
  HTML: "#e34c26",
  Go: "#00ADD8",
  Python: "#3572A5",
  Rust: "#dea584",
};

function getLanguageColor(language: string | null) {
  if (!language) return "#8B949E";
  return LANGUAGE_COLORS[language] ?? "#8B949E";
}

function formatProjects(repos: GitHubRepo[]): Project[] {
  return repos.map((repo) => ({
    name: repo.name,
    description: repo.description ?? "No description provided on GitHub.",
    language: repo.language,
    languageColor: getLanguageColor(repo.language),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    href: repo.html_url,
    homepage: repo.homepage,
    isPrivate: repo.private,
  }));
}

export function ProjectsSection() {
  const [isOpen, setIsOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(GITHUB_REPOS_API, {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            Accept: "application/vnd.github+json",
          },
        });

        if (!response.ok) {
          throw new Error(`GitHub API responded with ${response.status}`);
        }

        const repos = (await response.json()) as GitHubRepo[];
        const visibleProjects = repos
          .filter((repo) => !repo.private)
          .filter((repo) => !repo.fork || repo.stargazers_count > 0)
          .slice(0, 6);

        setProjects(formatProjects(visibleProjects));
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        setError("Unable to load live GitHub projects right now.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProjects();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section id="projects" className="py-12 section-divider">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
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
                {isLoading ? (
                  <div className="rounded-xl border border-border px-4 py-6 text-sm text-muted-foreground">
                    Loading live GitHub projects...
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-border px-4 py-6 text-sm text-muted-foreground">
                    {error}
                  </div>
                ) : (
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
                                style={{
                                  backgroundColor: project.languageColor,
                                }}
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
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
