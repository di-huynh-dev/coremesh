import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMDX } from '@content-collections/mdx';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';
import { rehypeShiki } from './lib/blog/rehype-shiki';

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
    level: z.enum(['Starter', 'Intermediate', 'Advanced']).default('Intermediate'),
    image: z.string().optional(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
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
    });

    const plainContent = document.content
      .replace(/^---[\s\S]*?---/, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
      .replace(/[#>*_\-\[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      ...document,
      slug: document.slug ?? document._meta.path,
      code: mdx,
      plainContent,
    };
  },
});

export default defineConfig({
  content: [blogPosts],
});
