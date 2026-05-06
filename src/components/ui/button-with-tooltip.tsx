import type { ReactElement } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ButtonWithTooltipProps {
  children: ReactElement;
  side: 'top' | 'bottom' | 'left' | 'right';
  toolTipText: string;
}

const ButtonWithTooltip = ({
  children,
  side,
  toolTipText,
}: ButtonWithTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>
          <div>{toolTipText}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

ButtonWithTooltip.displayName = 'ButtonWithTooltip';

export default ButtonWithTooltip;
