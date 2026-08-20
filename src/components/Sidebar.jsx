import { useEffect, useRef, useState } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import IconButton from './IconButton';

export default function Sidebar({
  threads,
  activeId,
  onSelect,
  onCreate,
  onRemove,
  onRename,
  className,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const editRef = useRef(null);

  useEffect(() => {
    if (editingId) editRef.current?.select();
  }, [editingId]);

  function startEditing(thread) {
    setPendingRemoval(null);
    setDraft(thread.title);
    setEditingId(thread.id);
  }

  function commit() {
    if (editingId) onRename(editingId, draft);
    setEditingId(null);
  }

  function remove(id) {
    if (pendingRemoval === id) {
      onRemove(id);
      setPendingRemoval(null);
    } else {
      setPendingRemoval(id);
    }
  }

  const ordered = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <aside
      className={clsx('glass flex w-64 flex-col border-r border-line bg-chrome', className)}
      onMouseLeave={() => setPendingRemoval(null)}
    >
      <div className="flex h-14 items-center justify-between border-b border-line px-3">
        <span className="text-sm font-medium">Chats</span>
        <IconButton label="New chat" onClick={onCreate}>
          <Plus size={16} />
        </IconButton>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-0.5">
          {ordered.map(thread => (
            <li key={thread.id} className="group relative">
              {editingId === thread.id ? (
                <input
                  ref={editRef}
                  value={draft}
                  onChange={event => setDraft(event.target.value)}
                  onBlur={commit}
                  onKeyDown={event => {
                    if (event.key === 'Enter') commit();
                    if (event.key === 'Escape') setEditingId(null);
                  }}
                  className="focus-ring w-full rounded-control border border-line bg-bg px-2.5 py-2 text-sm"
                />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSelect(thread.id)}
                    className={clsx(
                      'focus-ring flex w-full items-center rounded-control py-2 pr-16 pl-2.5 text-left text-sm transition-colors',
                      thread.id === activeId ? 'bg-bubble' : 'hover:bg-bubble/60',
                    )}
                  >
                    {thread.id === activeId && (
                      <span
                        aria-hidden
                        className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent"
                      />
                    )}
                    <span className="truncate">{thread.title}</span>
                  </button>

                  <div className="absolute top-1/2 right-1 flex -translate-y-1/2 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <IconButton
                      label="Rename"
                      onClick={() => startEditing(thread)}
                      className="size-6"
                    >
                      <Pencil size={13} />
                    </IconButton>
                    <IconButton
                      label={pendingRemoval === thread.id ? 'Click again to delete' : 'Delete'}
                      onClick={() => remove(thread.id)}
                      className="size-6"
                    >
                      {pendingRemoval === thread.id ? <Check size={13} /> : <Trash2 size={13} />}
                    </IconButton>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-line px-3 py-2.5 text-xs text-muted">
        {threads.length} {threads.length === 1 ? 'chat' : 'chats'}
      </div>
    </aside>
  );
}
