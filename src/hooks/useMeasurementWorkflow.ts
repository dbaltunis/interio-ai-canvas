
import { useState } from "react";
import { useCreateTreatment } from "@/hooks/useTreatments";
import { useCreateClientMeasurement } from "@/hooks/useClientMeasurements";
import { useToast } from "@/hooks/use-toast";

export const useMeasurementWorkflow = () => {
  const [isWorksheetOpen, setIsWorksheetOpen] = useState(false);
  const [currentWorkflowData, setCurrentWorkflowData] = useState<{
    roomId: string;
    surfaceId: string;
    treatmentType: string;
    projectId: string;
    clientId?: string;
  } | null>(null);
  
  const createTreatment = useCreateTreatment();
  const createClientMeasurement = useCreateClientMeasurement();
  const { toast } = useToast();

  const startMeasurementWorkflow = (data: {
    roomId: string;
    surfaceId: string;
    treatmentType: string;
    projectId: string;
    clientId?: string;
  }) => {
    setCurrentWorkflowData(data);
    setIsWorksheetOpen(true);
  };

  const completeMeasurementWorkflow = async (measurementData: any) => {
    if (!currentWorkflowData) return;

    try {
      // Save measurement to client measurements
      if (currentWorkflowData.clientId) {
        await createClientMeasurement.mutateAsync({
          client_id: currentWorkflowData.clientId,
          project_id: currentWorkflowData.projectId,
          measurement_type: "treatment_measurement",
          measurements: measurementData.measurements,
          photos: [], // Empty photos array as required by the type
          notes: measurementData.notes,
          measured_by: measurementData.measured_by,
          measured_at: new Date().toISOString()
        });
      }

      // Create treatment record
      await createTreatment.mutateAsync({
        project_id: currentWorkflowData.projectId,
        room_id: currentWorkflowData.roomId,
        window_id: currentWorkflowData.surfaceId,
        treatment_type: currentWorkflowData.treatmentType,
        measurements: measurementData.measurements,
        fabric_details: measurementData.fabric_details,
        treatment_details: measurementData.treatment_details,
        calculation_details: measurementData.calculation_details,
        material_cost: measurementData.material_cost || 0,
        labor_cost: measurementData.labor_cost || 0,
        total_price: measurementData.total_price || 0,
        notes: measurementData.notes,
        status: 'measured'
      });

      toast({
        title: "Success",
        description: "Treatment created and measurements saved successfully",
      });

      setIsWorksheetOpen(false);
      setCurrentWorkflowData(null);
    } catch (error) {
      console.error("Failed to complete measurement workflow:", error);
      toast({
        title: "Error",
        description: "Failed to save treatment and measurements",
        variant: "destructive",
      });
    }
  };

  return {
    isWorksheetOpen,
    currentWorkflowData,
    startMeasurementWorkflow,
    completeMeasurementWorkflow,
    closeWorksheet: () => {
      setIsWorksheetOpen(false);
      setCurrentWorkflowData(null);
    }
  };
};
