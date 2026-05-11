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
        'border-primary/55 bg-muted/45 text-foreground/80 relative my-3 rounded-r-md border-l-2 py-3 pr-4 pl-5 text-sm leading-relaxed italic',
        variant === 'subtle' && 'border-primary/35 bg-muted/30',
        variant === 'highlight' && 'border-primary bg-muted/60 border-l-4'
      )}
    >
      <span
        aria-hidden
        className="text-primary/35 absolute top-2 left-1 select-none text-2xl leading-none"
      >
        &quot;
      </span>
      <div className="[&>p]:my-0">{children}</div>
      {attribution && (
        <footer className="text-muted-foreground mt-2 text-xs not-italic">
          {attribution}
        </footer>
      )}
    </blockquote>
  );
}
