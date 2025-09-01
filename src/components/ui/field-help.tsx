import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FieldHelpProps {
  content: string;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const FieldHelp = ({ content, className, side = 'top' }: FieldHelpProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center text-muted hover:text-primary transition-colors ml-1",
              className
            )}
          >
            <HelpCircle className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-64">
          <p className="text-xs leading-relaxed text-muted-foreground">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};