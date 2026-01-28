import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { useProjectStatus } from "@/contexts/ProjectStatusContext";

interface ProjectLockedBannerProps {
  className?: string;
}

export const ProjectLockedBanner = ({ className = "" }: ProjectLockedBannerProps) => {
  const { isLocked, statusInfo, isLoading } = useProjectStatus();

  // Don't show anything while loading or if project is editable
  if (isLoading || !isLocked) {
    return null;
  }

  return (
    <Alert className={`bg-destructive/10 border-destructive/30 ${className}`}>
      <Lock className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Project Locked
      </AlertTitle>
      <AlertDescription>
        This project is in "{statusInfo?.name || "locked"}" status and cannot be edited.
        {statusInfo?.description && (
          <span className="block mt-1 text-xs opacity-75">
            {statusInfo.description}
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
};
