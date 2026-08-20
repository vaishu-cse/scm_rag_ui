import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import IconButton from './IconButton';

// Highlighting has already split the source into nested spans by the time it gets here,
// so the raw text for the copy button has to be gathered back out of them.
function textOf(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return textOf(node.props?.children);
}

function languageOf(children) {
  const className = Array.isArray(children)
    ? children[0]?.props?.className
    : children?.props?.className;
  return /language-(\S+)/.exec(className ?? '')?.[1] ?? '';
}

export default function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(textOf(children).replace(/\n$/, '')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <div className="glass overflow-hidden rounded-panel border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-2.5 py-1.5">
        <span className="font-mono text-xs text-muted">{languageOf(children) || 'text'}</span>
        <IconButton label={copied ? 'Copied' : 'Copy code'} onClick={copy} className="size-6">
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </IconButton>
      </div>
      <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[0.8125rem] leading-relaxed">
        {children}
      </pre>
    </div>
  );
}
