"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Palette,
  Shield,
  Sparkles,
  Box,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface StackItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  tag: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  },
};

export function ThinkingSection() {
  const t = useTranslations("thinking");

  const principles: StackItem[] = [
    {
      icon: Zap,
      title: t("item1Title"),
      description: t("item1Desc"),
      color: "#FF9100",
      tag: t("item1Tag"),
    },
    {
      icon: Box,
      title: t("item2Title"),
      description: t("item2Desc"),
      color: "#000000",
      tag: t("item2Tag"),
    },
    {
      icon: Palette,
      title: t("item3Title"),
      description: t("item3Desc"),
      color: "#FF4D8E",
      tag: t("item3Tag"),
    },
    {
      icon: Sparkles,
      title: t("item4Title"),
      description: t("item4Desc"),
      color: "#00C2FF",
      tag: t("item4Tag"),
    },
    {
      icon: Shield,
      title: t("item5Title"),
      description: t("item5Desc"),
      color: "#34A853",
      tag: t("item5Tag"),
    },
    {
      icon: Moon,
      title: t("item6Title"),
      description: t("item6Desc"),
      color: "#6366F1",
      tag: t("item6Tag"),
    },
  ];

  return (
    <section
      id="thinking"
      className="py-24 px-6 bg-[#F2F2F7] dark:bg-[#2C2C2E]"
    >
      <div className="max-w-6xl mx-auto">
        {/* ===== Header ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("title")}
          </h2>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* ===== Grid ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {principles.map((item, index) => {
            const IconComponent = item.icon;

            return (
              <motion.div key={index} variants={itemVariants}>
                <div className="relative overflow-hidden rounded-2xl p-6 h-full transition-all duration-300 hover:scale-[1.02] bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] group">
                  {/* Icon + Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <IconComponent
                        className="w-6 h-6"
                        style={{ color: item.color }}
                      />
                    </div>

                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ===== Footer ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            {t("footerText")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
