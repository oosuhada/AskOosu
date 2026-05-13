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
        'border-primary/45 bg-muted/45 text-foreground/80 relative my-3 rounded-md border-l-2 py-4 pr-7 pl-7 text-sm leading-relaxed italic',
        variant === 'subtle' && 'border-primary/35 bg-muted/30',
        variant === 'highlight' && 'border-primary bg-muted/60 border-l-4'
      )}
    >
      <span
        aria-hidden
        className="text-primary/35 absolute top-2 left-2 select-none text-2xl leading-none"
      >
        &quot;
      </span>
      <span
        aria-hidden
        className="text-primary/35 absolute right-3 bottom-6 select-none text-2xl leading-none"
      >
        &quot;
      </span>
      <div className="[&>p]:my-0">{children}</div>
      {attribution && (
        <footer className="text-muted-foreground mt-3 text-right text-xs not-italic">
          - {attribution} -
        </footer>
      )}
    </blockquote>
  );
}
