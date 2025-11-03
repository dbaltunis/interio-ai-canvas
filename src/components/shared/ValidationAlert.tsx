import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from "lucide-react";
import type { ValidationError } from "@/utils/treatmentOptionValidation";

interface ValidationAlertProps {
  errors?: ValidationError[];
  warnings?: ValidationError[];
  className?: string;
}

export const ValidationAlert = ({ errors = [], warnings = [], className }: ValidationAlertProps) => {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  // Show errors first, then warnings
  const showErrors = errors.length > 0;
  const items = showErrors ? errors : warnings;
  const variant = showErrors ? "destructive" : "default";
  const Icon = showErrors ? AlertCircle : AlertTriangle;
  const title = showErrors ? "Please fix the following issues:" : "Please note:";

  return (
    <Alert variant={variant} className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 mt-2">
          {items.map((item, index) => (
            <li key={index} className="text-sm">
              {item.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
