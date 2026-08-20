const KEY = 'chat.threads';

export function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

export function loadThreads() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads) {
  try {
    localStorage.setItem(KEY, JSON.stringify(threads));
  } catch {
    // Quota or a locked-down browser. The session still works, it just won't survive a reload.
  }
}

export function newThread() {
  return { id: uid(), title: 'New chat', messages: [], updatedAt: Date.now() };
}

export function titleFrom(text) {
  const line = text.trim().split('\n')[0];
  return line.length > 42 ? `${line.slice(0, 42).trimEnd()}…` : line;
}
