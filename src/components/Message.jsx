import { useState } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import IconButton from './IconButton';
import Markdown from './Markdown';

function Dots() {
  return (
    <span className="dots inline-flex items-center gap-1 py-2.5" role="status" aria-label="Thinking">
      <span className="size-1.5 rounded-full bg-muted" />
      <span className="size-1.5 rounded-full bg-muted" />
      <span className="size-1.5 rounded-full bg-muted" />
    </span>
  );
}

export default function Message({ message, streaming, onRegenerate }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  if (message.role === 'user') {
    return (
      <div className="rise flex justify-end">
        <div className="max-w-[85%] rounded-panel bg-bubble px-3.5 py-2.5 break-words whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  const waiting = !message.content && !message.error;

  return (
    <div className="rise group flex gap-3">
      <span
        aria-hidden
        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line bg-surface"
      >
        <span className="size-1.5 rounded-full bg-muted" />
      </span>

      <div className="min-w-0 flex-1">
        {waiting ? (
          <Dots />
        ) : (
          <div className={clsx('prose', streaming && 'streaming')}>
            <Markdown>{message.content}</Markdown>
          </div>
        )}

        {message.error && (
          <p className={clsx('text-sm text-muted', message.content && 'mt-2')}>
            Couldn&rsquo;t get a reply — {message.error}.
          </p>
        )}

        {!streaming && (message.content || message.error) && (
          <div className="mt-1.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            {message.content && (
              <IconButton label={copied ? 'Copied' : 'Copy reply'} onClick={copy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </IconButton>
            )}
            <IconButton
              label={message.error ? 'Try again' : 'Regenerate'}
              onClick={() => onRegenerate(message.id)}
            >
              <RotateCcw size={14} />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
}
