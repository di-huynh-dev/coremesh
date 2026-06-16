// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { z } from "zod";

// lib/blog/rehype-shiki.ts
import { fromHtml } from "hast-util-from-html";
import { toString } from "hast-util-to-string";
import { codeToHtml } from "shiki";
import { visit } from "unist-util-visit";
function getLanguage(className) {
  const classNames = Array.isArray(className) ? className : typeof className === "string" ? className.split(" ") : [];
  const languageClass = classNames.find((name) => name.startsWith("language-"));
  return languageClass?.replace("language-", "") || "text";
}
function rehypeShiki() {
  return async function transformer(tree) {
    const tasks = [];
    visit(tree, "element", (node, index, parent) => {
      if (!parent || typeof index !== "number" || node.tagName !== "pre") {
        return;
      }
      const codeNode = node.children?.find((child) => child.tagName === "code");
      if (!codeNode) {
        return;
      }
      const language = getLanguage(codeNode.properties?.className);
      const source = toString(codeNode);
      tasks.push(
        codeToHtml(source, {
          lang: language,
          theme: "github-light"
        }).then((html) => {
          const fragment = fromHtml(html, { fragment: true });
          parent.children ??= [];
          parent.children.splice(index, 1, ...fragment.children);
        })
      );
    });
    await Promise.all(tasks);
  };
}

// content-collections.ts
var blogPosts = defineCollection({
  name: "posts",
  directory: "content/blog",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    excerpt: z.string(),
    category: z.enum(["Engineering", "Design", "Framework"]),
    content: z.string(),
    date: z.string(),
    readingTime: z.number().int().positive(),
    publishedAt: z.string(),
    author: z.object({
      name: z.string(),
      avatar: z.string().optional()
    }),
    tags: z.array(z.string()).default([]),
    level: z.enum(["Starter", "Intermediate", "Advanced"]).default("Intermediate"),
    image: z.string().optional()
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
            behavior: "append",
            properties: {
              className: ["anchor-link"],
              ariaLabel: "Link to section"
            },
            content: {
              type: "text",
              value: "#"
            }
          }
        ],
        [
          rehypeExternalLinks,
          {
            target: "_blank",
            rel: ["noopener", "noreferrer"]
          }
        ]
      ]
    });
    const plainContent = document.content.replace(/^---[\s\S]*?---/, "").replace(/`{1,3}[^`]*`{1,3}/g, " ").replace(/[#>*_\-\[\]()]/g, " ").replace(/\s+/g, " ").trim();
    return {
      ...document,
      slug: document.slug ?? document._meta.path,
      code: mdx,
      plainContent
    };
  }
});
var content_collections_default = defineConfig({
  content: [blogPosts]
});
export {
  content_collections_default as default
};
