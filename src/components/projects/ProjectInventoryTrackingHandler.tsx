import { useEffect } from 'react';
import { useProjectInventoryDeduction, useProjectInventoryItems } from '@/hooks/useProjectInventoryDeduction';
import { useProjectInventoryReversal } from '@/hooks/useProjectInventoryReversal';

/**
 * Component that listens for project status changes and triggers inventory deduction or reversal
 * Mount this component at the app level to enable automatic inventory tracking
 */
export const ProjectInventoryTrackingHandler = () => {
  const inventoryDeduction = useProjectInventoryDeduction();
  const inventoryReversal = useProjectInventoryReversal();
  const { getProjectItems } = useProjectInventoryItems();

  useEffect(() => {
    const handleStatusChange = async (event: CustomEvent) => {
      const { projectId, newStatus, newStatusId } = event.detail;
      
      // Get all inventory items used in this project
      const items = await getProjectItems(projectId);
      
      if (items.length === 0) {
        // Silent - no materials to track
        return;
      }

      // Try deduction first
      const deductionResult = await inventoryDeduction.mutateAsync({
        projectId,
        statusName: newStatus,
        statusId: newStatusId,
        items
      });

      // If deduction didn't run (not configured for this status), try reversal
      if (!deductionResult.deducted) {
        await inventoryReversal.mutateAsync({
          projectId,
          statusName: newStatus,
          statusId: newStatusId,
          items
        });
      }
    };

    // Listen for project status change events
    window.addEventListener('project-status-changed', handleStatusChange as EventListener);

    return () => {
      window.removeEventListener('project-status-changed', handleStatusChange as EventListener);
    };
  }, [inventoryDeduction, inventoryReversal, getProjectItems]);

  return null; // This is a logic-only component
};
