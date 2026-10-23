import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { createHeadingIds } from "./text";
import type { BlogHeading } from "./types";

// Minimal hast shapes: enough for the heading plugin without pulling in @types/hast.
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

/** Gives h2/h3 the same slug ids as before the MDX move and collects the TOC outline. */
function rehypeHeadings(headings: BlogHeading[]) {
  return () => (tree: HastNode) => {
    const nextId = createHeadingIds();
    const visit = (node: HastNode) => {
      if (node.type === "element" && (node.tagName === "h2" || node.tagName === "h3")) {
        const text = textOf(node).trim();
        const id = (node.properties?.id as string | undefined) ?? nextId(text);
        node.properties = { ...node.properties, id };
        headings.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

/** Compiles MDX on the server and returns the rendered body plus its heading outline. */
export async function renderMdx(
  source: string,
  components: MDXComponents,
): Promise<{ content: ReactNode; headings: BlogHeading[] }> {
  const headings: BlogHeading[] = [];
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [[rehypeHighlight, { detect: false }], rehypeHeadings(headings)],
  });

  return { content: <Content components={components} />, headings };
}
