import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { validateTreatmentTemplate, type TemplateValidationResult } from "@/utils/templateValidation";

interface TemplateConfigurationAlertProps {
  template: any;
  className?: string;
}

/**
 * Displays validation alerts for template configuration issues
 */
export const TemplateConfigurationAlert = ({ 
  template, 
  className 
}: TemplateConfigurationAlertProps) => {
  const validation: TemplateValidationResult = validateTreatmentTemplate(template);

  // Don't show anything if template is fully valid
  if (validation.isValid && validation.warnings.length === 0) {
    return null;
  }

  // Show critical errors first
  if (!validation.isValid) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Template Configuration Issues</AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-1">
            <p className="font-medium">Critical Issues:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            {validation.warnings.length > 0 && (
              <>
                <p className="font-medium mt-3">Warnings:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </>
            )}
            <p className="text-sm mt-3 italic">
              Please complete the template configuration in Settings before using this template.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show warnings only
  return (
    <Alert className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Template Configuration Warnings</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 text-sm mt-2">
          {validation.warnings.map((warning, index) => (
            <li key={index}>{warning}</li>
          ))}
        </ul>
        <p className="text-sm mt-2 italic">
          The template will work but some features may not be available.
        </p>
      </AlertDescription>
    </Alert>
  );
};
