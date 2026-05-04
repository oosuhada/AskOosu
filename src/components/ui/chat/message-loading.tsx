export default function MessageLoading() {
  return (
    <div className="w-full max-w-xl" role="status" aria-live="polite">
      <span className="sr-only">Generating answer...</span>
      <div className="space-y-2.5">
        <div className="bg-muted-foreground/15 h-4 w-11/12 animate-pulse rounded-full" />
        <div className="bg-muted-foreground/15 h-4 w-4/5 animate-pulse rounded-full [animation-delay:120ms]" />
        <div className="bg-muted-foreground/15 h-4 w-7/12 animate-pulse rounded-full [animation-delay:240ms]" />
      </div>
    </div>
  );
}
