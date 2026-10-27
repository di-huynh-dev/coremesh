import { education } from "@/lib/data/experience";
import { profile, SITE_URL, socials } from "@/lib/data/profile";
import type { Locale } from "@/lib/i18n";

/** schema.org Person, so search engines link the name, title and profiles together. */
export function PersonJsonLd({ locale }: { locale: Locale }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.englishName,
    jobTitle: profile.title,
    description: profile.description[locale],
    url: SITE_URL,
    image: `${SITE_URL}${profile.avatar}`,
    email: `mailto:${profile.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ho Chi Minh City",
      addressCountry: "VN",
    },
    worksFor: {
      "@type": "Organization",
      name: profile.company.name,
      url: profile.company.url,
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: education.school.en,
    },
    knowsAbout: ["React", "Next.js", "TypeScript", "JavaScript", "Frontend architecture", "Web performance", "AI-assisted development"],
    sameAs: [socials.github.href, socials.linkedin.href, socials.tiktok.href, socials.blog.href],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here: every value is static site data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
