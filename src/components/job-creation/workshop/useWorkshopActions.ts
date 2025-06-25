
import { useCreateWorkOrder, useUpdateWorkOrder } from "@/hooks/useWorkOrders";
import { useCreateFabricOrder, useUpdateFabricOrder } from "@/hooks/useFabricOrders";
import { useUpdateWorkOrderCheckpoint } from "@/hooks/useWorkOrderCheckpoints";
import { supabase } from "@/integrations/supabase/client";

export const useWorkshopActions = () => {
  const createWorkOrder = useCreateWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();
  const createFabricOrder = useCreateFabricOrder();
  const updateFabricOrder = useUpdateFabricOrder();
  const updateCheckpoint = useUpdateWorkOrderCheckpoint();

  const getSupplierForFabric = (fabricType: string) => {
    const suppliers = {
      'Velvet': 'Premium Fabrics Ltd',
      'Cotton': 'Cotton Mill Co',
      'Linen': 'Natural Textiles Inc',
      'Silk': 'Silk Importers Ltd',
      'Polyester': 'Synthetic Solutions'
    };
    return suppliers[fabricType as keyof typeof suppliers] || 'General Suppliers';
  };

  const generateWorkOrders = async (projectTreatments: any[], actualProjectId: string, surfaces: any[], rooms: any[]) => {
    if (!projectTreatments.length) return;

    for (const [index, treatment] of projectTreatments.entries()) {
      const surface = surfaces?.find(s => s.id === treatment.window_id);
      const room = rooms?.find(r => r.id === treatment.room_id);
      
      const orderNumber = `WO-${String(index + 1).padStart(4, '0')}`;
      
      try {
        await createWorkOrder.mutateAsync({
          order_number: orderNumber,
          treatment_type: treatment.treatment_type,
          project_id: actualProjectId,
          status: 'pending',
          priority: 'medium',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          instructions: `${treatment.product_name} for ${room?.name || 'Unknown Room'} - ${surface?.name || 'Unknown Surface'}`,
          notes: treatment.notes,
          estimated_hours: 8
        });
      } catch (error) {
        console.error('Error creating work order:', error);
      }
    }

    // Generate fabric orders
    const fabricOrdersMap = new Map();
    
    projectTreatments.forEach(treatment => {
      if (!treatment.fabric_type) return;
      
      const key = `${treatment.fabric_type}-${treatment.color}`;
      if (!fabricOrdersMap.has(key)) {
        const supplier = getSupplierForFabric(treatment.fabric_type);
        fabricOrdersMap.set(key, {
          fabric_code: `FB-${treatment.fabric_type?.slice(0, 3).toUpperCase()}-${treatment.color?.slice(0, 3).toUpperCase()}`,
          fabric_type: treatment.fabric_type,
          color: treatment.color,
          pattern: treatment.pattern,
          supplier: supplier,
          quantity: 0,
          unit: 'yards',
          unit_price: 25.50,
          total_price: 0,
          work_order_ids: []
        });
      }
      
      const fabricOrder = fabricOrdersMap.get(key);
      fabricOrder.quantity += 5; // Estimated 5 yards per treatment
      fabricOrder.total_price = fabricOrder.quantity * fabricOrder.unit_price;
      fabricOrder.work_order_ids.push(treatment.id);
    });
    
    for (const fabricOrder of fabricOrdersMap.values()) {
      try {
        await createFabricOrder.mutateAsync(fabricOrder);
      } catch (error) {
        console.error('Error creating fabric order:', error);
      }
    }
  };

  const handleUpdateWorkOrder = async (id: string, updates: any) => {
    try {
      await updateWorkOrder.mutateAsync({ id, ...updates });
    } catch (error) {
      console.error('Error updating work order:', error);
    }
  };

  const handleToggleCheckpoint = async (orderId: string, checkpointId: string) => {
    try {
      const currentCheckpoints = await supabase
        .from('work_order_checkpoints')
        .select('completed')
        .eq('id', checkpointId)
        .single();

      if (currentCheckpoints.data) {
        await updateCheckpoint.mutateAsync({ 
          id: checkpointId, 
          completed: !currentCheckpoints.data.completed,
          completed_at: !currentCheckpoints.data.completed ? new Date().toISOString() : null
        });
      }
    } catch (error) {
      console.error('Error toggling checkpoint:', error);
    }
  };

  const handleUpdateFabricOrder = async (id: string, updates: any) => {
    try {
      await updateFabricOrder.mutateAsync({ id, ...updates });
    } catch (error) {
      console.error('Error updating fabric order:', error);
    }
  };

  const handleBulkOrder = async (supplierName: string, orders: any[]) => {
    console.log(`Sending bulk order to ${supplierName}:`, orders);
    
    for (const order of orders) {
      try {
        await updateFabricOrder.mutateAsync({ 
          id: order.id, 
          status: 'ordered', 
          order_date: new Date().toISOString().split('T')[0]
        });
      } catch (error) {
        console.error('Error updating fabric order:', error);
      }
    }
  };

  const handleReassignTask = (taskId: string, newAssignee: string) => {
    console.log(`Reassigning task ${taskId} to ${newAssignee}`);
  };

  const handleUpdateTaskStatus = (taskId: string, status: string) => {
    console.log(`Updating task ${taskId} status to ${status}`);
  };

  return {
    generateWorkOrders,
    handleUpdateWorkOrder,
    handleToggleCheckpoint,
    handleUpdateFabricOrder,
    handleBulkOrder,
    handleReassignTask,
    handleUpdateTaskStatus,
    isGenerating: createWorkOrder.isPending
  };
};
