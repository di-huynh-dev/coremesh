"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

const socialLinks = [
  {
    name: "GitHub",
    handle: "@di-huynh-dev",
    href: "https://github.com/di-huynh-dev",
    icon: Github,
    color: "#333",
  },
  {
    name: "LinkedIn",
    handle: "DiCodeWeb",
    href: "https://www.linkedin.com/feed/",
    icon: Linkedin,
    color: "#0A66C2",
  },
  {
    name: "TikTok",
    handle: "@dicodeweb",
    href: "https://www.tiktok.com/@dicodeweb",
    icon: ExternalLink,
    color: "#000000",
  },
];

export function CTASection() {
  const t = useTranslations("cta");

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#1C1C1E] to-[#0C0C0E] text-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* ===== Header ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF4D8E]/20 text-[#FF4D8E] text-sm font-medium mb-6">
            {t("badge")}
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t("title")}
          </h2>

          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* ===== Social Links ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 hover:border-white/20 shadow transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${social.color}20` }}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: social.color }}
                    />
                  </div>

                  <span className="text-sm font-medium text-white/80 group-hover:text-white">
                    {social.name}
                  </span>

                  <span className="text-xs text-white/40">{social.handle}</span>
                </motion.a>
              );
            })}
          </div>

          {/* ===== Optional CTA ===== */}
          <motion.a
            href="https://github.com/di-huynh-dev"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#FF4D8E] to-[#FF9100] text-white font-medium hover:opacity-90 transition-opacity"
          >
            {t("button")}
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </motion.div>

        {/* ===== About ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-16 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <img
              src="/avatar.png"
              alt="DiCodeWeb"
              className="w-20 h-20 rounded-full border-2 border-[#FF4D8E]/50"
            />

            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold mb-1">DiCodeWeb</h4>

              <p className="text-white/60 mb-2">
                {t("aboutSubtitle")}
              </p>

              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="px-2 py-1 rounded-full bg-[#FF4D8E]/20 text-[#FF4D8E] text-xs font-medium">
                  {t("tag1")}
                </span>
                <span className="px-2 py-1 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] text-xs font-medium">
                  {t("tag2")}
                </span>
                <span className="px-2 py-1 rounded-full bg-[#FF9100]/20 text-[#FF9100] text-xs font-medium">
                  {t("tag3")}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
