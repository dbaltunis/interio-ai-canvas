import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
interface FormFieldGroupProps {
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}
export const FormFieldGroup = ({
  label,
  description,
  required = false,
  error,
  children,
  className
}: FormFieldGroupProps) => {
  return <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <Label className="text-sm font-medium text-foreground flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        {description}
      </div>
      {children}
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>;
};