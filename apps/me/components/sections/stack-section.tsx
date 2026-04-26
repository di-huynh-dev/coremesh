"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const technologies = [
  { name: "JavaScript", iconUrl: "https://svgl.app/library/javascript.svg" },
  { name: "TypeScript", iconUrl: "https://svgl.app/library/typescript.svg" },
  { name: "React", iconUrl: "https://svgl.app/library/react_light.svg" },
  { name: "Next.js", iconUrl: "https://svgl.app/library/nextjs_icon_dark.svg" },
  { name: "Vue.js", iconUrl: "https://svgl.app/library/vue.svg" },
  { name: "NestJS", iconUrl: "https://svgl.app/library/nestjs.svg" },
  { name: "Tailwind CSS", iconUrl: "https://svgl.app/library/tailwindcss.svg" },
  { name: "Bootstrap", iconUrl: "https://svgl.app/library/bootstrap.svg" },
  {
    name: "Ant Design",
    iconUrl: "https://svgl.app/library/ant-design-dark-theme.svg",
  },
  { name: "Redux", iconUrl: "https://svgl.app/library/redux.svg" },
  { name: "Zustand", iconUrl: "https://svgl.app/library/svgl.svg" },
  {
    name: "TanStack Query",
    iconUrl: "https://svgl.app/library/reactquery.svg",
  },
  { name: "GSAP", iconUrl: "https://svgl.app/library/svgl.svg" },
  { name: "Firebase", iconUrl: "https://svgl.app/library/firebase.svg" },
  { name: "Docker", iconUrl: "https://svgl.app/library/docker.svg" },
  { name: "AWS", iconUrl: "https://svgl.app/library/aws_light.svg" },
  { name: "Azure", iconUrl: "https://svgl.app/library/azure.svg" },
  { name: "Git", iconUrl: "https://svgl.app/library/git.svg" },
  { name: "GitHub", iconUrl: "https://svgl.app/library/github_light.svg" },
  { name: "GitLab", iconUrl: "https://svgl.app/library/gitlab.svg" },
  { name: "Vite", iconUrl: "https://svgl.app/library/vite.svg" },
  { name: "Jest", iconUrl: "https://svgl.app/library/jest.svg" },
  { name: "Cypress", iconUrl: "https://svgl.app/library/cypress.svg" },
  { name: "Figma", iconUrl: "https://svgl.app/library/figma.svg" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

export function StackSection() {
  return (
    <section id="techstack" className="py-12 section-divider">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-mono-data text-muted-foreground mb-6">Stack</h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap gap-3"
          >
            {technologies.map((tech) => (
              <motion.div
                key={tech.name}
                variants={itemVariants}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-muted-foreground/30 transition-colors"
                title={tech.name}
              >
                <Image
                  src={tech.iconUrl}
                  alt={tech.name}
                  width={18}
                  height={18}
                  unoptimized
                  className="shrink-0 dark:brightness-90"
                />
                <span className="text-sm text-foreground">{tech.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
