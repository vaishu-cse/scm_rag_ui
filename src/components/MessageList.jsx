import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import Message from './Message';
import { usingMock } from '../chat';

// The mock only answers these; a real backend answers questions about its own documents.
const starters = usingMock
  ? [
      'Write me a retry helper',
      'Flexbox or grid?',
      'How does AbortController work?',
      'Steps to deploy this',
    ]
  : [
      'What are the categories in inventory?',
      'How are stock levels managed?',
      'How does procurement work?',
      'How is supplier performance evaluated?',
    ];

function Empty({ onPick }) {
  return (
    <div className="flex flex-1 flex-col justify-center py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Ask me something</h1>
      <p className="mt-2 max-w-md text-muted">
        {usingMock ? (
          <>
            The replies are canned for now:{' '}
            <code className="rounded-[5px] bg-bubble px-1.5 py-0.5 font-mono text-[0.85em]">
              src/mockReplies.js
            </code>{' '}
            holds every one of them.
          </>
        ) : (
          'Answers come from the documents in the knowledge base. You can add more to it below.'
        )}
      </p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {starters.map(prompt => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="focus-ring glass rounded-panel border border-line bg-surface px-3.5 py-3 text-left text-sm shadow-soft transition-colors hover:border-muted/40"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MessageList({ messages, streaming, onRegenerate, onPick }) {
  const box = useRef(null);
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    if (pinned) box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [messages, pinned]);

  function onScroll() {
    const el = box.current;
    // A little slack, so fractional scroll positions and the last line of a
    // streaming reply don't read as "the user scrolled away".
    setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 40);
  }

  const last = messages.at(-1);

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={box} onScroll={onScroll} className="h-full overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 sm:px-6">
          {messages.length === 0 ? (
            <Empty onPick={onPick} />
          ) : (
            <div className="flex flex-col gap-6 py-6" aria-live="polite">
              {messages.map(message => (
                <Message
                  key={message.id}
                  message={message}
                  streaming={streaming && message.id === last.id}
                  onRegenerate={onRegenerate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {!pinned && messages.length > 0 && (
        <button
          type="button"
          onClick={() => setPinned(true)}
          className="focus-ring glass absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-line bg-surface py-1.5 pr-3.5 pl-3 text-sm shadow-soft"
        >
          <ArrowDown size={14} />
          Latest
        </button>
      )}
    </div>
  );
}
