import clsx from 'clsx';

export default function IconButton({ label, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={clsx(
        'focus-ring grid size-7 shrink-0 place-items-center rounded-control text-muted transition-colors hover:bg-bubble hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  );
}
