import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { useProjectStatus } from "@/contexts/ProjectStatusContext";

interface ProjectLockedBannerProps {
  className?: string;
}

export const ProjectLockedBanner = ({ className }: ProjectLockedBannerProps) => {
  const { isLocked, statusInfo } = useProjectStatus();
  const statusName = statusInfo?.name;

  if (!isLocked) return null;

  return (
    <Alert className={className}>
      <Lock className="h-4 w-4" />
      <AlertDescription>
        This project is locked because its status is <strong>{statusName || 'locked'}</strong>.
        Changes cannot be made until the status is updated.
      </AlertDescription>
    </Alert>
  );
};
