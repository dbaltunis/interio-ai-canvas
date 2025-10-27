import { useEffect, useState } from "react";
import { useProjectLeftovers } from "./useProjectLeftovers";
import { useProjectMaterialsUsage } from "./useProjectMaterialsUsage";

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
  const [showDeductionDialog, setShowDeductionDialog] = useState(false);
  const { data: leftovers = [] } = useProjectLeftovers(projectId);
  const { data: materialsUsage = [] } = useProjectMaterialsUsage(projectId);

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

      // Only show dialogs if moving TO complete status (not from)
      if (isNowComplete && !wasComplete) {
        // Show deduction dialog first (more important)
        if (materialsUsage.length > 0) {
          setShowDeductionDialog(true);
        } else if (leftovers.length > 0) {
          // Show leftover dialog if no materials to deduct
          setShowLeftoverDialog(true);
        }
      }

      setPreviousStatus(currentStatus);
      onStatusChanged?.(currentStatus);
    }
  }, [currentStatus, previousStatus, leftovers.length, materialsUsage.length, onStatusChanged]);

  return {
    showLeftoverDialog,
    setShowLeftoverDialog,
    leftovers,
    showDeductionDialog,
    setShowDeductionDialog,
    materialsUsage
  };
};
