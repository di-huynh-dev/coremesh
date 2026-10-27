import { I18nProvider } from "@/components/i18n-provider";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AboutSection } from "@/components/sections/about-section";
import { BlogSection } from "@/components/sections/blog-section";
import { ContactSection } from "@/components/sections/contact-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { OverviewSection } from "@/components/sections/overview-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { StackSection } from "@/components/sections/stack-section";
import { StoryTeaser } from "@/components/sections/story-teaser";
import { CommandPalette } from "@/components/ui/command-palette";
import { ConsoleGreeting } from "@/components/ui/console-greeting";
import { CursorLabel } from "@/components/ui/cursor-label";
import { DrumGame } from "@/components/ui/drum-game";
import { EasterEgg } from "@/components/ui/easter-egg";
import { PersonJsonLd } from "@/components/ui/person-json-ld";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { getLatestPosts } from "@/lib/blog";
import { htmlLang, type Locale } from "@/lib/i18n";

export function HomePage({ locale }: { locale: Locale }) {
  const posts = getLatestPosts(locale);

  return (
    <I18nProvider locale={locale}>
      <main
        lang={htmlLang[locale]}
        className="min-h-screen max-w-screen overflow-x-hidden bg-background px-2 pt-14 text-foreground"
      >
        <PersonJsonLd locale={locale} />
        <ScrollProgress />
        <Navbar />
        <OverviewSection
          latestPost={
            posts[0] ? { slug: posts[0].slug, title: posts[0].title } : undefined
          }
        />
        <StoryTeaser locale={locale} />
        <AboutSection locale={locale} />
        <StackSection />
        <ExperienceSection locale={locale} />
        <ProjectsSection locale={locale} />
        <BlogSection locale={locale} posts={posts} />
        <ContactSection locale={locale} />
        <Footer locale={locale} />
        <ScrollToTop />
        <CommandPalette />
        <CursorLabel />
        <EasterEgg />
        <DrumGame />
        <ConsoleGreeting />
      </main>
    </I18nProvider>
  );
}
