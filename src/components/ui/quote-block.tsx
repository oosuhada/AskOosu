import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type QuoteBlockVariant = 'default' | 'subtle' | 'highlight';

type QuoteBlockProps = {
  children: ReactNode;
  attribution?: string;
  variant?: QuoteBlockVariant;
};

export function QuoteBlock({
  children,
  attribution,
  variant = 'default',
}: QuoteBlockProps) {
  return (
    <blockquote
      className={cn(
        'text-foreground/80 border-border/70 my-3 border-t pt-3 text-sm leading-relaxed italic',
        variant === 'subtle' && 'border-border/50',
        variant === 'highlight' && 'border-primary/60'
      )}
    >
      <div className="flex items-start justify-center gap-1.5 text-center">
        <span
          aria-hidden
          className="text-primary/35 mt-0.5 shrink-0 select-none text-lg leading-none"
        >
          &quot;
        </span>
        <div className="min-w-0 [&>p]:my-0">{children}</div>
        <span
          aria-hidden
          className="text-primary/35 mt-0.5 shrink-0 select-none text-lg leading-none"
        >
          &quot;
        </span>
      </div>
      {attribution && (
        <footer className="text-muted-foreground mt-1.5 text-center text-[11px] not-italic">
          - {attribution} -
        </footer>
      )}
    </blockquote>
  );
}
