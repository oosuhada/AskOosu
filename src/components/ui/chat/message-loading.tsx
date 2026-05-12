export default function MessageLoading({
  label = 'Drafting the answer...',
  steps = [],
}: {
  label?: string;
  steps?: string[];
}) {
  const visibleSteps = steps.slice(0, 3);

  return (
    <div
      className="w-full max-w-xl space-y-3"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <p className="text-muted-foreground text-sm">{label}</p>
      {visibleSteps.length > 0 ? (
        <ol className="text-muted-foreground/90 space-y-1.5 text-sm">
          {visibleSteps.map((step, index) => (
            <li key={`${step}-${index}`} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0D9487]/12 text-[10px] font-semibold text-[#0D9487] dark:bg-[#0D9487]/24 dark:text-[#5EDDD2]">
                {index + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
      <div className="space-y-2.5" aria-hidden="true">
        <div className="bg-muted-foreground/15 h-4 w-11/12 animate-pulse rounded-full" />
        <div className="bg-muted-foreground/15 h-4 w-4/5 animate-pulse rounded-full [animation-delay:120ms]" />
        <div className="bg-muted-foreground/15 h-4 w-7/12 animate-pulse rounded-full [animation-delay:240ms]" />
      </div>
    </div>
  );
}
