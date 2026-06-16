import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import * as pagefind from 'pagefind';
import { getAllPosts } from '../lib/blog';

async function buildPagefind() {
  const posts = getAllPosts();
  const outputPath = path.join(process.cwd(), 'public', 'pagefind');

  await rm(outputPath, { recursive: true, force: true });
  await mkdir(outputPath, { recursive: true });

  const { index } = await pagefind.createIndex();
  if (!index) {
    throw new Error('Pagefind index could not be created.');
  }

  for (const post of posts) {
    await index.addCustomRecord({
      url: `/blog/${post.slug}`,
      language: 'en',
      content: [post.title, post.excerpt, post.category, ...post.tags, post.plainContent].join(
        '\n',
      ),
    });
  }

  await index.writeFiles({ outputPath });
}

await buildPagefind();
