import { useEffect, useState } from "react";
import { useProjectLeftovers } from "./useProjectLeftovers";

interface UseProjectStatusChangeProps {
  projectId: string | undefined;
  currentStatus: string | null | undefined;
  onStatusChanged?: (newStatus: string) => void;
}

export const useProjectStatusChange = ({
  projectId,
  currentStatus,
  onStatusChanged
}: UseProjectStatusChangeProps) => {
  const [previousStatus, setPreviousStatus] = useState<string | null | undefined>(currentStatus);
  const [showLeftoverDialog, setShowLeftoverDialog] = useState(false);
  const { data: leftovers = [] } = useProjectLeftovers(projectId);

  useEffect(() => {
    // Check if status changed to completed or installed
    if (currentStatus && previousStatus !== currentStatus) {
      const completionStatuses = ['completed', 'installed', 'complete', 'finished'];
      const isNowComplete = completionStatuses.some(s => 
        currentStatus.toLowerCase().includes(s)
      );
      const wasComplete = previousStatus && completionStatuses.some(s => 
        previousStatus.toLowerCase().includes(s)
      );

      // Only show leftover dialog at completion (deduction now happens via Allocate Materials button)
      if (isNowComplete && !wasComplete && leftovers.length > 0) {
        setShowLeftoverDialog(true);
      }

      setPreviousStatus(currentStatus);
      onStatusChanged?.(currentStatus);
    }
  }, [currentStatus, previousStatus, leftovers.length, onStatusChanged]);

  return {
    showLeftoverDialog,
    setShowLeftoverDialog,
    leftovers
  };
};
