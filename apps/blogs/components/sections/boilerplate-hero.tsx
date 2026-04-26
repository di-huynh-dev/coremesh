"use client";

import { motion } from "framer-motion";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { ArrowRight, Zap, Shield, Palette } from "lucide-react";
import { useTranslations } from "next-intl";

export function BoilerplateHero() {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-24 md:pt-20 px-4 bg-gradient-to-b from-[#FFF5F8] via-background to-background dark:from-[#1C1C1E] dark:via-[#1C1C1E] dark:to-[#1C1C1E]">
      {/* ============ GRADIENT GLOW ORBS ============ */}

      <motion.div
        className="absolute top-0 left-[5%] w-[250px] md:w-[400px] lg:w-[600px] h-[250px] md:h-[400px] lg:h-[600px] rounded-full pointer-events-none opacity-60 md:opacity-70 dark:opacity-40 md:dark:opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 77, 142, 0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute top-[10%] right-[5%] w-[200px] md:w-[350px] lg:w-[500px] h-[200px] md:h-[350px] lg:h-[500px] rounded-full pointer-events-none opacity-50 md:opacity-60 dark:opacity-30 md:dark:opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 194, 255, 0.35) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.15, 1], x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute bottom-[10%] left-[20%] md:left-[30%] w-[180px] md:w-[300px] lg:w-[400px] h-[180px] md:h-[300px] lg:h-[400px] rounded-full pointer-events-none opacity-40 md:opacity-50 dark:opacity-25 md:dark:opacity-35"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 145, 0, 0.3) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.2, 1], x: [0, 25, 0], y: [0, -10, 0] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      <motion.div
        className="absolute bottom-0 right-[10%] w-[200px] md:w-[350px] lg:w-[450px] h-[200px] md:h-[350px] lg:h-[450px] rounded-full pointer-events-none opacity-30 md:opacity-40 dark:opacity-20 md:dark:opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 77, 142, 0.3) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ scale: [1, 1.1, 1], x: [0, -20, 0], y: [0, -25, 0] }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6,
        }}
      />

      {/* ============ CONTENT ============ */}
      <div className="relative z-10 container mx-auto px-2 md:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-[#1C1C1E]/80 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow text-xs md:text-sm font-medium text-white mb-4 md:mb-6"
        >
          {t("badge")}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-4 md:mb-6 max-w-4xl mx-auto"
        >
          {t("headlinePrefix")}
          <br />
          <span className="text-[#FF4D8E]">{t("headlineHighlight")}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6 md:mb-8 px-2"
        >
          {t("subtitle")}
          <br className="hidden sm:block" />
          <span className="block mt-2 font-semibold text-foreground">
            {t("subtitleHighlight")}
          </span>
        </motion.p>

        {/* Value Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 mb-6 md:mb-8 text-xs md:text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-[#FF9100]" />
            <span>{t("value1")}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-[#00C2FF]" />
            <span>{t("value2")}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Palette className="w-4 h-4 text-[#FF4D8E]" />
            <span>{t("value3")}</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 sm:px-0"
        >
          <ButtonPrimary
            size="lg"
            className="group w-full sm:w-auto"
            onClick={() =>
              document
                .getElementById("articles")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {t("readArticles")}
            <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
          </ButtonPrimary>

          <ButtonPrimary
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() =>
              document
                .getElementById("topics")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {t("exploreTopics")}
          </ButtonPrimary>
        </motion.div>
      </div>
    </section>
  );
}
