import { useState } from "react";
import { useProjectMaterialsUsage } from "./useProjectMaterialsUsage";

interface UseMaterialAllocationProps {
  projectId: string | undefined;
}

export const useMaterialAllocation = ({ projectId }: UseMaterialAllocationProps) => {
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const { data: materialsUsage = [] } = useProjectMaterialsUsage(projectId);

  const triggerAllocation = () => {
    if (materialsUsage.length > 0) {
      setShowAllocationDialog(true);
    }
  };

  return {
    showAllocationDialog,
    setShowAllocationDialog,
    materialsUsage,
    triggerAllocation,
    hasMaterials: materialsUsage.length > 0
  };
};
