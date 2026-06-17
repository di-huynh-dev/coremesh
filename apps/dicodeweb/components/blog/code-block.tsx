'use client';

import { Check, Copy } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { isValidElement, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type CodeBlockProps = ComponentPropsWithoutRef<'pre'> & {
  children: ReactNode;
};

function getNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join('');
  }

  if (isValidElement(node)) {
    return getNodeText((node as ReactElement<{ children?: ReactNode }>).props.children);
  }

  return '';
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const source = useMemo(() => getNodeText(children).replace(/\n$/, ''), [children]);

  async function handleCopy() {
    if (!source) return;

    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-block-shell group">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D9DEE8] bg-white text-[#202538] shadow-[0_10px_24px_rgba(8,14,28,0.22)] transition hover:-translate-y-0.5 hover:border-white hover:bg-[#F8FAFD]"
        aria-label={copied ? 'Copied code' : 'Copy code'}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>

      <pre {...props} className={cn('blog-code-pre', className)}>
        {children}
      </pre>
    </div>
  );
}
