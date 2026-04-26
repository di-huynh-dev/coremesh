"use client";

import { Github, Linkedin, Twitter, Mail } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border mt-12">
      <div className="container-tight">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <p>
              © {year} <span className="text-foreground">Huynh Tien Di</span>
            </p>
            <p className="text-xs mt-1">
              Inspired by clean mono portfolio aesthetics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://x.com/dihuynhdev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="X"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/di-huynh-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/huynh-tiendi/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="mailto:dihuynhdev.contact@gmail.com"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
