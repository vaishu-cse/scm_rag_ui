import { useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import clsx from 'clsx';
import DocumentUpload from './DocumentUpload';
import { uploadEnabled } from '../upload';

const maxHeight = 200;

export default function Composer({ value, onChange, onSend, onStop, streaming, inputRef }) {
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value, inputRef]);

  function onKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  const ready = value.trim().length > 0;

  return (
    <div className="glass border-t border-line bg-chrome">
      <div className="mx-auto w-full max-w-3xl px-4 pt-3 pb-4 sm:px-6">
        <div className="glass rounded-panel border border-line bg-surface p-2 shadow-soft focus-within:border-muted/40">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={value}
              onChange={event => onChange(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message"
              aria-label="Message"
              className="flex-1 resize-none bg-transparent px-1.5 py-1.5 leading-relaxed placeholder:text-muted focus:outline-none"
              style={{ maxHeight }}
            />

            {streaming ? (
              <button
                type="button"
                onClick={onStop}
                title="Stop generating"
                aria-label="Stop generating"
                className="focus-ring grid size-8 place-items-center rounded-control border border-line text-ink transition-colors hover:bg-bubble"
              >
                <Square size={13} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSend}
                disabled={!ready}
                title="Send"
                aria-label="Send"
                className={clsx(
                  'focus-ring grid size-8 place-items-center rounded-control transition-colors',
                  ready ? 'bg-accent text-white' : 'text-muted',
                )}
              >
                <ArrowUp size={16} />
              </button>
            )}
          </div>

          {uploadEnabled && <DocumentUpload />}
        </div>

        <p className="mt-2 text-center text-xs text-muted">
          Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
