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

function toClassNames(className: unknown) {
  if (Array.isArray(className)) {
    return className.filter((value): value is string => typeof value === 'string');
  }

  if (typeof className === 'string') {
    return className.split(' ');
  }

  return [];
}

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
          theme: 'github-dark-default',
        }).then((html) => {
          const fragment = fromHtml(html, { fragment: true });
          const preNode = ((fragment.children as unknown) as HastNode[]).find(
            (child) => child.type === 'element' && child.tagName === 'pre',
          );

          if (preNode) {
            preNode.properties = {
              ...preNode.properties,
              className: [...toClassNames(preNode.properties?.className), 'blog-shiki'],
              'data-language': language,
              style: {
                ...(typeof preNode.properties?.style === 'object' && preNode.properties?.style
                  ? (preNode.properties.style as Record<string, unknown>)
                  : {}),
                backgroundColor: 'transparent',
              },
            };
          }

          parent.children ??= [];
          parent.children.splice(index, 1, ...((fragment.children as unknown) as HastNode[]));
        }),
      );
    });

    await Promise.all(tasks);
  };
}
