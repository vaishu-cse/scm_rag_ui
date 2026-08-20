import { useEffect, useRef, useState } from 'react';
import { streamReply } from './chat';
import { loadThreads, newThread, saveThreads, titleFrom, uid } from './storage';

export function useChat() {
  const [threads, setThreads] = useState(() => {
    const saved = loadThreads();
    return saved.length ? saved : [newThread()];
  });
  const [activeId, setActiveId] = useState(() => threads[0].id);
  const [streaming, setStreaming] = useState(false);
  const abort = useRef(null);

  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  const active = threads.find(thread => thread.id === activeId) ?? threads[0];

  function patch(id, change) {
    setThreads(list =>
      list.map(thread =>
        thread.id === id ? { ...change(thread), updatedAt: Date.now() } : thread,
      ),
    );
  }

  async function run(id, history) {
    const controller = new AbortController();
    abort.current = controller;
    setStreaming(true);

    const replyId = uid();
    patch(id, thread => ({
      ...thread,
      messages: [...thread.messages, { id: replyId, role: 'assistant', content: '' }],
    }));

    const write = update =>
      patch(id, thread => ({
        ...thread,
        messages: thread.messages.map(m => (m.id === replyId ? update(m) : m)),
      }));

    try {
      for await (const chunk of streamReply(history, { signal: controller.signal })) {
        write(m => ({ ...m, content: m.content + chunk }));
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        write(m => ({ ...m, error: err.message }));
      }
    } finally {
      setStreaming(false);
      abort.current = null;
    }
  }

  function send(text) {
    const content = text.trim();
    if (!content || streaming) return false;

    const history = [...active.messages, { id: uid(), role: 'user', content }];
    patch(active.id, thread => ({
      ...thread,
      title: thread.messages.length ? thread.title : titleFrom(content),
      messages: history,
    }));
    run(active.id, history);
    return true;
  }

  function regenerate(messageId) {
    if (streaming) return;

    const index = active.messages.findIndex(m => m.id === messageId);
    if (index < 1) return;

    const history = active.messages.slice(0, index);
    patch(active.id, thread => ({ ...thread, messages: history }));
    run(active.id, history);
  }

  function stop() {
    abort.current?.abort();
  }

  function createThread() {
    if (!active.messages.length) return;

    const thread = newThread();
    setThreads(list => [thread, ...list]);
    setActiveId(thread.id);
  }

  function removeThread(id) {
    const remaining = threads.filter(thread => thread.id !== id);
    const next = remaining.length ? remaining : [newThread()];
    setThreads(next);
    if (id === activeId) setActiveId(next[0].id);
  }

  function renameThread(id, title) {
    const trimmed = title.trim();
    if (!trimmed) return;
    patch(id, thread => ({ ...thread, title: trimmed }));
  }

  return {
    threads,
    active,
    streaming,
    send,
    stop,
    regenerate,
    select: setActiveId,
    createThread,
    removeThread,
    renameThread,
  };
}
