"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  className,
}) => {
  return (
    <div
      className={cn(
        "markdown-body text-xs leading-relaxed select-text space-y-2.5",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-ink tracking-tight pt-2 pb-1 border-b border-hairline/60">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold text-ink tracking-tight pt-2 pb-1 border-b border-hairline/40">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-ink tracking-tight pt-1.5 pb-0.5">
              {children}
            </h3>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="text-ink leading-relaxed my-1">{children}</p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-1 my-1.5 text-zinc-300 marker:text-zinc-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 space-y-1 my-1.5 text-zinc-300 marker:text-zinc-400 marker:font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5">{children}</li>
          ),

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-zinc-600 pl-3 py-1.5 my-2 bg-zinc-900/40 rounded-r-md text-zinc-300 italic text-[11px]">
              {children}
            </blockquote>
          ),

          // Strong and Em
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-400">{children}</em>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-white/10">
              <table className="w-full text-xs text-left border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-900/80 text-zinc-200 border-b border-white/10 font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/5 bg-zinc-950/40">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-zinc-900/40 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-zinc-200 font-medium">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-zinc-400">{children}</td>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 hover:text-white font-medium underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),

          // Code blocks & Inline code
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-200 font-mono text-[11px] border border-white/10 font-medium inline-block my-0.5"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : "sql"}
                codeString={String(children).replace(/\n$/, "")}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  codeString: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, codeString }) => {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string>("");

  useEffect(() => {
    try {
      const lang = language.toLowerCase();
      let grammar = Prism.languages[lang];

      if (!grammar) {
        if (lang === "pgsql" || lang === "postgres") grammar = Prism.languages.sql;
        else if (lang === "ts" || lang === "tsx") grammar = Prism.languages.typescript;
        else if (lang === "js" || lang === "jsx") grammar = Prism.languages.javascript;
        else if (lang === "sh" || lang === "shell") grammar = Prism.languages.bash;
        else grammar = Prism.languages.markup || Prism.languages.javascript;
      }

      if (grammar) {
        const html = Prism.highlight(codeString, grammar, lang);
        setHighlightedCode(html);
      } else {
        setHighlightedCode(escapeHtml(codeString));
      }
    } catch (e) {
      setHighlightedCode(escapeHtml(codeString));
    }
  }, [language, codeString]);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-white/10 bg-[#09090b] overflow-hidden select-text">
      {/* Code Header Bar */}
      <div className="px-3.5 py-1.5 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between text-[11px] select-none">
        <div className="flex items-center gap-2 text-zinc-400">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          <span
            className="font-mono uppercase font-semibold text-[10px] tracking-wider text-zinc-300"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-white/10 text-[10px] font-medium cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-zinc-200">Copiato</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-zinc-400" />
              <span>Copia</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with DM Mono font */}
      <pre
        className="p-4 overflow-x-auto text-[12px] leading-relaxed text-zinc-200 scrollbar-thin bg-[#09090b]"
        style={{ fontFamily: "'DM Mono', monospace", letterSpacing: "-0.01em" }}
      >
        {highlightedCode ? (
          <code
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            style={{ fontFamily: "'DM Mono', monospace" }}
          />
        ) : (
          <code style={{ fontFamily: "'DM Mono', monospace" }}>{codeString}</code>
        )}
      </pre>
    </div>
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
