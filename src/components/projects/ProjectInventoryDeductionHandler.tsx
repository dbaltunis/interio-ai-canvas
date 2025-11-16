import { useEffect } from 'react';
import { useProjectInventoryDeduction, useProjectInventoryItems } from '@/hooks/useProjectInventoryDeduction';

/**
 * Component that listens for project status changes and triggers inventory deduction
 * Mount this component at the app level to enable automatic inventory tracking
 */
export const ProjectInventoryDeductionHandler = () => {
  const inventoryDeduction = useProjectInventoryDeduction();
  const { getProjectItems } = useProjectInventoryItems();

  useEffect(() => {
    const handleStatusChange = async (event: CustomEvent) => {
      const { projectId, newStatus, newStatusId } = event.detail;
      
      try {
        // Get all inventory items used in this project
        const items = await getProjectItems(projectId);
        
        if (items.length === 0) {
          console.log('No inventory items found for project', projectId);
          return;
        }

        // Trigger deduction with status ID
        await inventoryDeduction.mutateAsync({
          projectId,
          statusName: newStatus,
          statusId: newStatusId, // Pass status ID for checking
          items
        });
      } catch (error) {
        console.error('Error in inventory deduction handler:', error);
      }
    };

    // Listen for project status change events
    window.addEventListener('project-status-changed', handleStatusChange as EventListener);

    return () => {
      window.removeEventListener('project-status-changed', handleStatusChange as EventListener);
    };
  }, [inventoryDeduction, getProjectItems]);

  return null; // This is a logic-only component
};
