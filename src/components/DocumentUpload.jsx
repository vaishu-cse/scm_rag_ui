import { useRef, useState } from 'react';
import { Check, Loader2, Paperclip, X } from 'lucide-react';
import { uploadDocuments } from '../upload';
import { uid } from '../storage';

export default function DocumentUpload() {
  const picker = useRef(null);
  const [items, setItems] = useState([]);

  function settle(ids, change) {
    setItems(current => current.map(item => (ids.includes(item.id) ? { ...item, ...change } : item)));
  }

  function dismiss(id) {
    setItems(current => current.filter(item => item.id !== id));
  }

  async function send(event) {
    const files = [...event.target.files];
    // Cleared so picking the same file twice in a row still counts as a change.
    event.target.value = '';
    if (!files.length) return;

    const batch = files.map(file => ({ id: uid(), name: file.name, state: 'busy' }));
    const ids = batch.map(item => item.id);
    setItems(current => [...current, ...batch]);

    try {
      await uploadDocuments(files);
      settle(ids, { state: 'done' });
      setTimeout(() => setItems(current => current.filter(item => !ids.includes(item.id))), 4000);
    } catch (err) {
      settle(ids, { state: 'failed', error: err.message });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1.5 pt-2 text-xs">
      <button
        type="button"
        onClick={() => picker.current?.click()}
        className="focus-ring flex items-center gap-1.5 rounded-control text-muted transition-colors hover:text-ink"
      >
        <Paperclip size={13} />
        Add documents
      </button>

      <input ref={picker} type="file" multiple onChange={send} className="hidden" />

      {items.map(item =>
        item.state === 'failed' ? (
          <button
            key={item.id}
            type="button"
            onClick={() => dismiss(item.id)}
            title="Dismiss"
            className="focus-ring flex items-center gap-1.5 rounded-control text-muted transition-colors hover:text-ink"
          >
            <X size={12} />
            {item.name} &mdash; {item.error}
          </button>
        ) : (
          <span key={item.id} className="flex items-center gap-1.5 text-muted">
            {item.state === 'busy' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Check size={12} />
            )}
            {item.name}
          </span>
        ),
      )}
    </div>
  );
}
