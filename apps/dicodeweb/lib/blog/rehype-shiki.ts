import { fromHtml } from 'hast-util-from-html';
import { toString } from 'hast-util-to-string';
import { codeToHtml } from 'shiki';
import { visit } from 'unist-util-visit';

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

function getLanguage(className: unknown) {
  const classNames = Array.isArray(className)
    ? className
    : typeof className === 'string'
      ? className.split(' ')
      : [];

  const languageClass = classNames.find((name) => name.startsWith('language-'));
  return languageClass?.replace('language-', '') || 'text';
}

export function rehypeShiki() {
  return async function transformer(tree: HastNode) {
    const tasks: Array<Promise<void>> = [];

    visit(tree, 'element', (node: HastNode, index, parent: HastNode | undefined) => {
      if (!parent || typeof index !== 'number' || node.tagName !== 'pre') {
        return;
      }

      const codeNode = node.children?.find((child) => child.tagName === 'code');
      if (!codeNode) {
        return;
      }

      const language = getLanguage(codeNode.properties?.className);
      const source = toString(codeNode as never);

      tasks.push(
        codeToHtml(source, {
          lang: language,
          theme: 'github-light',
        }).then((html) => {
          const fragment = fromHtml(html, { fragment: true });
          parent.children ??= [];
          parent.children.splice(index, 1, ...((fragment.children as unknown) as HastNode[]));
        }),
      );
    });

    await Promise.all(tasks);
  };
}
