import { useEffect, useRef, useState } from 'react';
import { Check, Palette } from 'lucide-react';
import IconButton from './IconButton';

export const themes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'aero', label: 'Aero' },
];

export default function ThemeMenu({ theme, onPick }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event) {
      if (!root.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <IconButton label="Appearance" onClick={() => setOpen(current => !current)}>
        <Palette size={16} />
      </IconButton>

      {open && (
        <div className="glass absolute top-9 right-0 z-30 w-40 overflow-hidden rounded-panel border border-line bg-surface py-1 shadow-soft">
          {themes.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                onPick(id);
                setOpen(false);
              }}
              className="focus-ring flex w-full items-center justify-between px-3 py-1.5 text-left text-sm transition-colors hover:bg-bubble"
            >
              {label}
              {theme === id && <Check size={14} className="text-muted" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
