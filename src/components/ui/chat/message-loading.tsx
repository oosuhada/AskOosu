export default function MessageLoading({
  label = 'Drafting the answer...',
}: {
  label?: string;
}) {
  return (
    <div
      className="w-full max-w-xl space-y-3"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <p className="text-muted-foreground text-sm">{label}</p>
      <div className="space-y-2.5" aria-hidden="true">
        <div className="bg-muted-foreground/15 h-4 w-11/12 animate-pulse rounded-full" />
        <div className="bg-muted-foreground/15 h-4 w-4/5 animate-pulse rounded-full [animation-delay:120ms]" />
        <div className="bg-muted-foreground/15 h-4 w-7/12 animate-pulse rounded-full [animation-delay:240ms]" />
      </div>
    </div>
  );
}
