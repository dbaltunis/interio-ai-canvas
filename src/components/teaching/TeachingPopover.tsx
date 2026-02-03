import React, { useEffect, useRef } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { X, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TeachingPopoverProps {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  step?: { current: number; total: number };
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  onDismiss: () => void;
  onDismissForever?: () => void;
  children: React.ReactNode;
  open: boolean;
  showDontShowAgain?: boolean;
}

export const TeachingPopover = ({
  id,
  title,
  description,
  icon,
  position = 'bottom',
  step,
  primaryAction,
  secondaryAction,
  onDismiss,
  onDismissForever,
  children,
  open,
  showDontShowAgain = true,
}: TeachingPopoverProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onDismiss();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onDismiss]);

  const sideMap = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  } as const;

  return (
    <PopoverPrimitive.Root open={open}>
      <PopoverPrimitive.Trigger asChild>
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={contentRef}
          side={sideMap[position]}
          sideOffset={8}
          align="center"
          className={cn(
            "z-[200] w-80 rounded-lg border border-primary/20 bg-primary text-primary-foreground shadow-2xl",
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
        >
          {/* Arrow */}
          <PopoverPrimitive.Arrow className="fill-primary" width={12} height={6} />
          
          {/* Header */}
          <div className="flex items-start justify-between p-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                {icon || <Lightbulb className="h-4 w-4" />}
              </div>
              <div>
                <h4 className="font-semibold text-sm">{title}</h4>
                {step && (
                  <span className="text-xs text-primary-foreground/70">
                    Step {step.current} of {step.total}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-primary-foreground/20 px-4 py-3">
            <div className="flex items-center gap-2">
              {showDontShowAgain && onDismissForever && (
                <button
                  onClick={onDismissForever}
                  className="text-xs text-primary-foreground/60 hover:text-primary-foreground/80 transition-colors"
                >
                  Don't show again
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {secondaryAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={secondaryAction.onClick}
                  className="text-primary-foreground hover:bg-primary-foreground/20 h-8"
                >
                  {secondaryAction.label}
                </Button>
              )}
              <Button
                size="sm"
                onClick={primaryAction?.onClick || onDismiss}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-8"
              >
                {primaryAction?.label || 'Got it'}
                {step && step.current < step.total && <ChevronRight className="h-3 w-3 ml-1" />}
              </Button>
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

// Standalone teaching bubble that can be positioned anywhere
export const TeachingBubble = ({
  title,
  description,
  icon,
  position = 'bottom',
  step,
  primaryAction,
  onDismiss,
  onDismissForever,
  showDontShowAgain = true,
  className,
}: Omit<TeachingPopoverProps, 'children' | 'open' | 'id'> & { className?: string }) => {
  return (
    <div
      className={cn(
        "w-80 rounded-lg border border-primary/20 bg-primary text-primary-foreground shadow-2xl",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
            {icon || <Lightbulb className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="font-semibold text-sm">{title}</h4>
            {step && (
              <span className="text-xs text-primary-foreground/70">
                Step {step.current} of {step.total}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-full p-1 hover:bg-primary-foreground/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-primary-foreground/90 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-primary-foreground/20 px-4 py-3">
        <div className="flex items-center gap-2">
          {showDontShowAgain && onDismissForever && (
            <button
              onClick={onDismissForever}
              className="text-xs text-primary-foreground/60 hover:text-primary-foreground/80 transition-colors"
            >
              Don't show again
            </button>
          )}
        </div>
        <Button
          size="sm"
          onClick={primaryAction?.onClick || onDismiss}
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-8"
        >
          {primaryAction?.label || 'Got it'}
          {step && step.current < step.total && <ChevronRight className="h-3 w-3 ml-1" />}
        </Button>
      </div>
    </div>
  );
};
