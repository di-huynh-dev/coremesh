import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { createHeadingIds } from "./text";
import type { BlogHeading } from "./types";

// Minimal hast shapes: enough for the plugins below without pulling in @types/hast.
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

/**
 * Gives h2/h3 the same slug ids as before the MDX move, collects the TOC outline and
 * appends a "#" link to each (components/blog/heading-anchors.tsx copies it on click).
 */
function rehypeHeadings(headings: BlogHeading[], anchorLabel: string) {
  return () => (tree: HastNode) => {
    const nextId = createHeadingIds();
    const visit = (node: HastNode) => {
      if (node.type === "element" && (node.tagName === "h2" || node.tagName === "h3")) {
        const text = textOf(node).trim();
        const id = (node.properties?.id as string | undefined) ?? nextId(text);
        node.properties = { ...node.properties, id };
        node.children = [
          ...(node.children ?? []),
          {
            type: "element",
            tagName: "a",
            properties: { className: ["heading-anchor"], href: `#${id}`, ariaLabel: anchorLabel },
            children: [{ type: "text", value: "#" }],
          },
        ];
        headings.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
        return;
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

const LANGUAGE_NAMES: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  bash: "Shell",
  sh: "Shell",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  css: "CSS",
  html: "HTML",
  sql: "SQL",
  http: "HTTP",
  diff: "Diff",
  md: "Markdown",
  mdx: "MDX",
};

/** A first line like `// app/layout.tsx` or `# deploy.yml (excerpt)` names the file. */
const FILE_COMMENT = /^\s*(?:\/\/|#|--)\s*((?:[\w@.[\]()-]+\/)*[\w@.[\]-]+\.[a-z0-9]+(?:\s+\([^)]*\))?)\s*$/i;

/**
 * Wraps fenced code in a titled block: the file name when the first line is a path
 * comment (moved out of the code), otherwise the language. Runs before highlighting,
 * while the code is still one text node. Plain `text` blocks stay untitled.
 */
function rehypeCodeBlocks() {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      node.children?.forEach((child, index) => {
        const code = child.tagName === "pre" ? child.children?.find((c) => c.tagName === "code") : undefined;
        if (!code) {
          visit(child);
          return;
        }

        const classes = (code.properties?.className as string[] | undefined) ?? [];
        const lang = classes.find((name) => name.startsWith("language-"))?.slice("language-".length);
        let label = lang ? (LANGUAGE_NAMES[lang] ?? (lang === "text" ? "" : lang.toUpperCase())) : "";

        const source = code.children?.length === 1 ? code.children[0] : undefined;
        if (source?.type === "text" && source.value) {
          const [first = "", ...rest] = source.value.split("\n");
          const file = first.match(FILE_COMMENT)?.[1];
          if (file && rest.join("").trim()) {
            label = file;
            source.value = rest.join("\n");
          }
        }
        if (!label) return;

        node.children![index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["code-block"] },
          children: [
            {
              type: "element",
              tagName: "div",
              properties: { className: ["code-head"] },
              children: [{ type: "text", value: label }],
            },
            child,
          ],
        };
      });
    };
    visit(tree);
  };
}

/** Compiles MDX on the server and returns the rendered body plus its heading outline. */
export async function renderMdx(
  source: string,
  components: MDXComponents,
  { anchorLabel = "Link to this section" }: { anchorLabel?: string } = {},
): Promise<{ content: ReactNode; headings: BlogHeading[] }> {
  const headings: BlogHeading[] = [];
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeCodeBlocks,
      [rehypeHighlight, { detect: false }],
      rehypeHeadings(headings, anchorLabel),
    ],
  });

  return { content: <Content components={components} />, headings };
}
