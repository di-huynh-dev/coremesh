import { defaultLocale, locales } from "@/intl.config";
import type { BlogLocale } from "@/lib/content/types";
import { getPostBySlug } from "@repo/content/posts";
import type { Metadata } from "next";
import { AUTHOR, OG_IMAGE_SIZE, SITE_NAME, SITE_TITLE, SITE_URL, TWITTER_HANDLE } from "./site";

export const ogLocale: Record<BlogLocale, string> = { en: "en_US", vi: "vi_VN" };
export const contentLanguage: Record<BlogLocale, string> = { en: "en-US", vi: "vi-VN" };

/** Locales a post is published in (posts without en.mdx have no /en page). */
export function postLocales(slug: string): BlogLocale[] {
  return locales.filter((locale) => getPostBySlug(slug, locale) !== undefined);
}

/**
 * Canonical + hreflang for a page served at `/${locale}${path}`. `available` lists the locales
 * that really have the page (a Vietnamese-only post has no /en twin), so no alternate 404s.
 */
export function localizedAlternates(
  locale: BlogLocale,
  path: string,
  available: readonly BlogLocale[] = locales,
): NonNullable<Metadata["alternates"]> {
  const self = available.includes(locale) ? locale : (available[0] ?? defaultLocale);
  const fallback = available.includes(defaultLocale) ? defaultLocale : self;

  return {
    canonical: `/${self}${path}`,
    languages: {
      ...Object.fromEntries(available.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${fallback}${path}`,
    },
    types: { "application/rss+xml": `/${locale}/rss.xml` },
  };
}

interface PageMetadataInput {
  locale: BlogLocale;
  /** Path after the locale prefix; "" for the locale home. */
  path: string;
  /** Omit to keep the layout's default title. */
  title?: string;
  description: string;
  keywords?: string[];
  available?: readonly BlogLocale[];
  /** Absolute canonical elsewhere (republished guides); hreflang is dropped then. */
  canonical?: string;
  /**
   * The route has its own opengraph-image.tsx (locale home, posts). Otherwise the site card is
   * set explicitly: a page's own `openGraph` hides the parent segment's file-based image.
   */
  ownImage?: boolean;
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    tags?: string[];
    section?: string;
  };
}

/**
 * Title, description, canonical/hreflang, Open Graph and Twitter for one page. Metadata merges
 * shallowly, so every page sets the full objects. Twitter falls back to the Open Graph image.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  keywords,
  available,
  canonical,
  ownImage = false,
  article,
}: PageMetadataInput): Metadata {
  const alternates = canonical
    ? { canonical, types: { "application/rss+xml": `/${locale}/rss.xml` } }
    : localizedAlternates(locale, path, available);
  const socialTitle = title ?? SITE_TITLE;
  const base = {
    siteName: SITE_NAME,
    locale: ogLocale[locale],
    url: `/${locale}${path}`,
    title: socialTitle,
    description,
    ...(ownImage
      ? {}
      : { images: [{ url: `/${locale}/opengraph-image`, ...OG_IMAGE_SIZE, alt: SITE_TITLE }] }),
  };

  return {
    ...(title ? { title } : {}),
    description,
    keywords,
    alternates,
    openGraph: article
      ? { ...base, type: "article", authors: [AUTHOR.url], ...article }
      : { ...base, type: "website" },
    twitter: {
      card: "summary_large_image",
      creator: TWITTER_HANDLE,
      title: socialTitle,
      description,
    },
  };
}

/** schema.org author/publisher of everything on the blog. */
export const authorJsonLd = {
  "@type": "Person",
  "@id": `${AUTHOR.url}/#person`,
  name: AUTHOR.name,
  url: AUTHOR.url,
  image: `${SITE_URL}${AUTHOR.avatar}`,
  sameAs: AUTHOR.sameAs,
} as const;
