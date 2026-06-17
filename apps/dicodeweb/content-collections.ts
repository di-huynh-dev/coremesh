import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMDX } from '@content-collections/mdx';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';

import { rehypeShiki } from './lib/blog/rehype-shiki';

const postLevelSchema = z.enum(['Starter', 'Intermediate', 'Advanced']);

const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    rehypeShiki,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'append',
        properties: {
          className: ['anchor-link'],
          ariaLabel: 'Link to section',
        },
        content: {
          type: 'text',
          value: '#',
        },
      },
    ],
    [
      rehypeExternalLinks,
      {
        target: '_blank',
        rel: ['noopener', 'noreferrer'],
      },
    ],
  ],
} satisfies Parameters<typeof compileMDX>[2];

function createPlainContent(content: string) {
  return content
    .replace(/^---[\s\S]*?---/, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/[#>*_\-\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const blogPosts = defineCollection({
  name: 'posts',
  directory: 'content/blog',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    excerpt: z.string(),
    category: z.enum(['Engineering', 'Design', 'Framework']),
    content: z.string(),
    date: z.string(),
    readingTime: z.number().int().positive(),
    publishedAt: z.string(),
    author: z.object({
      name: z.string(),
      avatar: z.string().optional(),
    }),
    tags: z.array(z.string()).default([]),
    level: postLevelSchema.default('Intermediate'),
    image: z.string().optional(),
    series: z
      .object({
        slug: z.string(),
        position: z.number().int().positive().optional(),
      })
      .optional(),
  }),
  transform: async (document, context) => {
    const code = await compileMDX(context, document, mdxOptions);

    return {
      ...document,
      slug: document.slug ?? document._meta.path,
      code,
      plainContent: createPlainContent(document.content),
    };
  },
});

const blogSeries = defineCollection({
  name: 'series',
  directory: 'content/series',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    description: z.string(),
    level: postLevelSchema.default('Intermediate'),
    order: z.number().int().positive().default(1),
    updatedAt: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const code = await compileMDX(context, document, mdxOptions);

    return {
      ...document,
      slug: document.slug ?? document._meta.path,
      code,
      plainContent: createPlainContent(document.content),
    };
  },
});

export default defineConfig({
  content: [blogPosts, blogSeries],
});
