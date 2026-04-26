"use client";

import { motion } from "framer-motion";
import { GithubCalendarSection } from "./github-calendar-section";

export function AboutSection() {
  return (
    <section id="about" className="py-12 section-divider">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-6 font-mono-data text-muted-foreground">Summary</h2>

          <div className="max-w-3xl text-lg leading-9 text-muted-foreground">
            <p>
              Dedicated Frontend Developer with{" "}
              <span className="font-semibold text-foreground">
                3+ years of experience
              </span>{" "}
              in building high-performance web applications. Proven expertise in
              developing and scaling{" "}
              <span className="font-semibold text-foreground">
                CMS and CRM platforms
              </span>{" "}
              serving over{" "}
              <span className="font-semibold text-foreground">
                30,000 monthly active users
              </span>
              .
            </p>

            <p className="mt-4">
              Specialized in{" "}
              <span className="font-semibold text-foreground">
                Monorepo and Micro-frontend architectures
              </span>
              , with a strong focus on performance optimization{" "}
              <span className="font-semibold text-foreground">
                (SSR, ISR, Core Web Vitals)
              </span>
              . Adept at creating smooth animations with{" "}
              <span className="font-semibold text-foreground">GSAP</span> and
              implementing real-time features using{" "}
              <span className="font-semibold text-foreground">WebSockets</span>.
            </p>

            <p className="mt-4">
              Committed to delivering pixel-perfect, responsive interfaces and{" "}
              <span className="font-semibold text-foreground">
                secure payment integrations
              </span>{" "}
              (Stripe, Nicepay, Sepay) at scale.
            </p>
          </div>
        </motion.div>
      </div>
      <GithubCalendarSection />
    </section>
  );
}
