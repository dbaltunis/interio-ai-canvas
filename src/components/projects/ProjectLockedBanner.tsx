import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Eye, AlertTriangle } from "lucide-react";
import { useProjectStatus } from "@/contexts/ProjectStatusContext";

interface ProjectLockedBannerProps {
  className?: string;
}

export const ProjectLockedBanner = ({ className = "" }: ProjectLockedBannerProps) => {
  const { isLocked, isViewOnly, statusInfo, isLoading } = useProjectStatus();

  // Don't show anything while loading or if project is editable
  if (isLoading || (!isLocked && !isViewOnly)) {
    return null;
  }

  const getAlertConfig = () => {
    if (isLocked) {
      return {
        icon: Lock,
        title: "Project Locked",
        description: `This project is in "${statusInfo?.name || "locked"}" status and cannot be edited.`,
        variant: "destructive" as const,
        bgClass: "bg-destructive/10 border-destructive/30",
      };
    }
    
    if (isViewOnly) {
      return {
        icon: Eye,
        title: "View Only",
        description: `This project is in "${statusInfo?.name || "view only"}" status. Changes are not permitted.`,
        variant: "default" as const,
        bgClass: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
      };
    }

    return null;
  };

  const config = getAlertConfig();
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <Alert className={`${config.bgClass} ${className}`}>
      <IconComponent className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {config.title}
      </AlertTitle>
      <AlertDescription>
        {config.description}
        {statusInfo?.description && (
          <span className="block mt-1 text-xs opacity-75">
            {statusInfo.description}
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
};
