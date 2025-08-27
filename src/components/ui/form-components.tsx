import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { LucideIcon } from 'lucide-react';

interface FormActionsProps {
  cancelLabel?: string;
  submitLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  cancelVariant?: 'outline' | 'ghost';
  submitVariant?: 'default' | 'brand' | 'success' | 'danger';
  className?: string;
  additionalActions?: React.ReactNode;
}

export const FormActions = ({
  cancelLabel = "Cancel",
  submitLabel = "Save",
  onCancel,
  isLoading = false,
  disabled = false,
  cancelVariant = "outline",
  submitVariant = "default",
  className,
  additionalActions
}: FormActionsProps) => {
  return (
    <div className={cn(
      "flex items-center justify-between pt-6 border-t border-border",
      className
    )}>
      <div className="flex items-center gap-3">
        {additionalActions}
      </div>
      
      <div className="flex items-center gap-3">
        {onCancel && (
          <Button 
            type="button" 
            variant={cancelVariant}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
        )}
        <Button 
          type="submit" 
          variant={submitVariant}
          disabled={disabled || isLoading}
          className={isLoading ? 'cursor-wait' : ''}
        >
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
          )}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const FormSection = ({
  title,
  description,
  icon: Icon,
  children,
  className
}: FormSectionProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-1">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};