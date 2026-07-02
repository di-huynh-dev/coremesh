import React from "react";
import { FiCode, FiCopy } from "react-icons/fi";

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = "javascript" }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    // Could add a toast notification here if desired
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-[#0d1117] my-4 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 text-zinc-400">
          <FiCode className="w-4 h-4" />
          <span className="text-xs font-mono lowercase tracking-wider">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
          aria-label="Copy code"
          title="Copy code"
        >
          <FiCopy className="w-4 h-4" />
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-300 bg-transparent selection:bg-sky-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
