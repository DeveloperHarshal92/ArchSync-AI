import React from 'react';
import Markdown from 'react-markdown';

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Validates that URLs in markdown use safe web protocols only.
 * Disallows javascript:, vbscript:, data:, and other potentially dangerous schemes.
 */
export function isSafeUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  // Relative links within app
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export const SafeMarkdown: React.FC<SafeMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div className={`safe-markdown text-xs text-[var(--color-text)] leading-relaxed break-words ${className}`}>
      <Markdown
        components={{
          h1: ({ children }) => (
            <h1 className="font-serif text-base font-semibold text-[var(--color-text)] mt-3 mb-1 pb-1 border-b border-[var(--color-border)]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-serif text-sm font-semibold text-[var(--color-text)] mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-serif text-xs font-semibold text-[var(--color-accent)] mt-2 mb-0.5">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0 text-[var(--color-text-muted)] leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2 pl-1 text-[var(--color-text-muted)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2 pl-1 text-[var(--color-text-muted)] font-mono">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-xs leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--color-accent)] bg-[var(--color-surface-raised)] pl-2.5 py-1.5 my-2 text-xs italic text-[var(--color-text-muted)] rounded-r">
              {children}
            </blockquote>
          ),
          code: ({ children, className: codeClass }) => {
            const isFenced = Boolean(codeClass && codeClass.includes('language-'));
            if (isFenced) {
              return (
                <code className="font-mono text-[11px] text-[var(--color-accent)]">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-[var(--color-surface-raised)] px-1 py-0.5 font-mono text-[11px] text-[var(--color-accent)] border border-[var(--color-border)]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2.5 my-2 font-mono text-[11px] text-[var(--color-accent)]">
              {children}
            </pre>
          ),
          a: ({ href, children }) => {
            if (!isSafeUrl(href)) {
              return <span className="font-medium text-[var(--color-text-muted)] underline decoration-dotted">{children}</span>;
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] font-medium underline decoration-1 underline-offset-2 hover:brightness-110 hover:decoration-2 transition-all"
              >
                {children}
              </a>
            );
          },
          strong: ({ children }) => <strong className="font-semibold text-[var(--color-text)]">{children}</strong>,
          em: ({ children }) => <em className="italic text-[var(--color-text-muted)]">{children}</em>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded border border-[var(--color-border)]">
              <table className="w-full text-left text-[11px] border-collapse bg-[var(--color-surface)]">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[var(--color-surface-raised)] text-[var(--color-accent)] font-mono border-b border-[var(--color-border)]">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-[var(--color-border)]">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-[var(--color-surface-elevated)]">{children}</tr>,
          th: ({ children }) => <th className="px-2 py-1.5 font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-2 py-1 text-[var(--color-text-muted)]">{children}</td>,
          hr: () => <hr className="my-3 border-[var(--color-border)]" />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
