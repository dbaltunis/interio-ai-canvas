import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { ValidationError } from "@/utils/treatmentOptionValidation";

interface ValidationAlertProps {
  errors?: ValidationError[];
  warnings?: ValidationError[];
  className?: string;
  templateId?: string;
  onConfigureTemplate?: () => void;
}

export const ValidationAlert = ({ 
  errors = [], 
  warnings = [], 
  className,
  templateId,
  onConfigureTemplate
}: ValidationAlertProps) => {
  const navigate = useNavigate();
  
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  // Show errors first, then warnings
  const showErrors = errors.length > 0;
  const items = showErrors ? errors : warnings;
  const variant = showErrors ? "destructive" : "default";
  const Icon = showErrors ? AlertCircle : AlertTriangle;
  const title = showErrors ? "Please fix the following issues:" : "Please note:";

  const handleConfigureTemplate = () => {
    if (onConfigureTemplate) {
      onConfigureTemplate();
    } else if (templateId) {
      // Navigate to template editor with proper sub-tab
      navigate(`/settings?tab=products&subtab=templates&editTemplate=${templateId}`);
    } else {
      // Fallback to templates list, not generic products tab
      navigate('/settings?tab=products&subtab=templates');
    }
  };

  // Check if any items have actions
  const hasActions = items.some(item => item.actionType);

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
        {hasActions && (
          <div className="mt-3 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleConfigureTemplate}
              className="text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Configure Template
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
