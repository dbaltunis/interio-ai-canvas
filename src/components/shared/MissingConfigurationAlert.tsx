import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MissingConfigurationAlertProps {
  title?: string;
  missingFields: string[];
  configType: 'template' | 'fabric' | 'inventory';
  entityName?: string;
  /** If true, shows as blocking error. If false, shows as warning */
  isBlocking?: boolean;
  /** Custom message to display */
  message?: string;
  /** Hide the settings button */
  hideSettingsButton?: boolean;
}

/**
 * Alert component that displays when required configuration is missing.
 * Used to "fail loud" instead of using hardcoded fallbacks.
 */
export const MissingConfigurationAlert = ({
  title = "Configuration Required",
  missingFields,
  configType,
  entityName,
  isBlocking = true,
  message,
  hideSettingsButton = false,
}: MissingConfigurationAlertProps) => {
  const navigate = useNavigate();

  const getConfigPath = () => {
    switch (configType) {
      case 'template':
        return '/?tab=settings';
      case 'fabric':
      case 'inventory':
        return '/?tab=inventory';
      default:
        return '/?tab=settings';
    }
  };

  const getConfigLabel = () => {
    switch (configType) {
      case 'template':
        return 'Template Settings';
      case 'fabric':
        return 'Fabric Inventory';
      case 'inventory':
        return 'Inventory';
      default:
        return 'Settings';
    }
  };

  const formatFieldName = (field: string) => {
    return field
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const defaultMessage = entityName
    ? `${entityName} is missing required configuration. Please update ${getConfigLabel().toLowerCase()} to continue.`
    : `Missing required configuration. Please update ${getConfigLabel().toLowerCase()} to continue.`;

  return (
    <Alert variant={isBlocking ? "destructive" : "default"} className="my-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {title}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm">{message || defaultMessage}</p>
        
        {missingFields.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Missing fields:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {missingFields.map((field) => (
                <li key={field} className="text-muted-foreground">
                  {formatFieldName(field)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hideSettingsButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(getConfigPath())}
            className="mt-2"
          >
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Configure in {getConfigLabel()}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
