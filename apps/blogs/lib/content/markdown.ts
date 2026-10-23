import hljs from "highlight.js/lib/common";
import apache from "highlight.js/lib/languages/apache";
import django from "highlight.js/lib/languages/django";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import groovy from "highlight.js/lib/languages/groovy";
import http from "highlight.js/lib/languages/http";
import nginx from "highlight.js/lib/languages/nginx";
import powershell from "highlight.js/lib/languages/powershell";
import properties from "highlight.js/lib/languages/properties";
import type { HLJSApi, Language } from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import sanitizeHtml from "sanitize-html";
import { withHeadingIds } from "./text";

// Terraform / HCL grammar from The DevOps Daily (MIT) — highlight.js has none built in.
function defineTerraform(api: HLJSApi): Language {
  const NUMBERS = { className: "number", begin: "\\b\\d+(\\.\\d+)?", relevance: 0 };
  const STRINGS = {
    className: "string",
    begin: '"',
    end: '"',
    contains: [
      {
        className: "variable",
        begin: "\\${",
        end: "\\}",
        relevance: 9,
        contains: [
          { className: "string", begin: '"', end: '"' },
          {
            className: "meta",
            begin: "[A-Za-z_0-9]*\\(",
            end: "\\)",
            contains: [
              NUMBERS,
              {
                className: "string",
                begin: '"',
                end: '"',
                contains: [
                  {
                    className: "variable",
                    begin: "\\${",
                    end: "\\}",
                    contains: [{ className: "string", begin: '"', end: '"' }],
                  },
                ],
              },
              "self",
            ],
          },
        ],
      },
    ],
  };

  return {
    aliases: ["tf", "hcl"],
    keywords: {
      keyword: "resource variable provider output locals module data terraform",
      literal: "false true null",
    },
    contains: [api.COMMENT("\\#", "$"), NUMBERS, STRINGS],
  } as Language;
}

hljs.registerLanguage("apache", apache);
hljs.registerLanguage("django", django);
hljs.registerLanguage("dockerfile", dockerfile);
hljs.registerLanguage("groovy", groovy);
hljs.registerLanguage("http", http);
hljs.registerLanguage("nginx", nginx);
hljs.registerLanguage("powershell", powershell);
hljs.registerLanguage("properties", properties);
hljs.registerLanguage("terraform", defineTerraform);

const LANGUAGE_ALIASES: Record<string, string> = {
  jinja2: "django",
  jinja: "django",
  rego: "plaintext",
  ql: "sql",
  txt: "plaintext",
  gitignore: "plaintext",
  mermaid: "plaintext",
};

const marked = new Marked(
  { gfm: true },
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const name = LANGUAGE_ALIASES[lang] ?? lang;
      if (name && hljs.getLanguage(name)) {
        return hljs.highlight(code, { language: name, ignoreIllegals: true }).value;
      }
      // Unlabelled fences are mostly ASCII diagrams: leave them as plain text
      // (returning the input unchanged makes marked-highlight escape it).
      return code;
    },
  }),
);

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "img",
    "details",
    "summary",
    "del",
    "input",
  ],
  allowedAttributes: {
    "*": ["class", "id"],
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    input: ["type", "checked", "disabled"],
    details: ["open"],
    th: ["align"],
    td: ["align"],
  },
  // External links open in a new tab; relative links stay in the app.
  transformTags: {
    a: (tagName, attribs) =>
      /^https?:\/\//.test(attribs.href ?? "")
        ? { tagName, attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" } }
        : { tagName, attribs },
  },
};

const rendered = new Map<string, ReturnType<typeof withHeadingIds>>();

/** Markdown → sanitized, highlighted HTML with heading ids and an outline for the TOC. */
export function renderMarkdown(markdown: string) {
  const cached = rendered.get(markdown);
  if (cached) return cached;

  const html = sanitizeHtml(marked.parse(markdown, { async: false }), SANITIZE);
  const result = withHeadingIds(html);
  // Keyed by the source text, so an edited file simply renders fresh.
  rendered.set(markdown, result);
  return result;
}

export function countWords(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}
