// Example of how to integrate the new reusable measurement visual system
// with existing components like VisualMeasurementSheet

import { useState, useEffect } from "react";
import { 
  MeasurementVisual, 
  EditableMeasurementVisual,
  PreviewMeasurementVisual,
  CompactMeasurementVisual,
  WorkOrderMeasurementVisual,
  useProjectDataExtractor,
  VISUAL_CONFIGS
} from "../index";
import { 
  MeasurementData, 
  TreatmentData, 
  ProjectData, 
  FabricCalculation 
} from "../types";

// Example 1: Direct replacement of VisualMeasurementSheet
interface ExampleUsageProps {
  measurements: Record<string, any>;
  onMeasurementChange: (field: string, value: string) => void;
  readOnly?: boolean;
  windowType: string;
  selectedTemplate?: any;
  selectedFabric?: string;
  onFabricChange?: (fabricId: string) => void;
  selectedLining?: string;
  onLiningChange?: (liningType: string) => void;
  selectedHeading?: string;
  onHeadingChange?: (headingId: string) => void;
  onFabricCalculationChange?: (calculation: any) => void;
  
  // Optional project data
  project?: any;
  client?: any;
  room?: any;
  window?: any;
}

export const ExampleVisualMeasurementReplacement = ({
  measurements,
  onMeasurementChange,
  readOnly = false,
  windowType,
  selectedTemplate,
  selectedFabric,
  onFabricChange,
  selectedLining,
  onLiningChange,
  selectedHeading,
  onHeadingChange,
  onFabricCalculationChange,
  project,
  client,
  room,
  window: windowData
}: ExampleUsageProps) => {
  
  // Transform existing data to new format
  const measurementData: MeasurementData = {
    ...measurements,
    window_type: windowType
  };

  const treatmentData: TreatmentData = {
    template: selectedTemplate ? {
      id: selectedTemplate.id,
      name: selectedTemplate.name,
      curtain_type: selectedTemplate.curtain_type,
      fullness_ratio: selectedTemplate.fullness_ratio,
      header_allowance: selectedTemplate.header_allowance,
      bottom_hem: selectedTemplate.bottom_hem,
      side_hems: selectedTemplate.side_hems,
      seam_hems: selectedTemplate.seam_hems,
      return_left: selectedTemplate.return_left,
      return_right: selectedTemplate.return_right,
      waste_percent: selectedTemplate.waste_percent,
      compatible_hardware: selectedTemplate.compatible_hardware || []
    } : undefined,
    fabric: selectedFabric ? {
      id: selectedFabric,
      name: "Selected Fabric", // You'd get this from your fabric data
      fabric_width: 137, // You'd get this from your fabric data
      price_per_meter: 0 // You'd get this from your fabric data
    } : undefined
  };

  // Extract project data
  const projectData = useProjectDataExtractor({
    project,
    client,
    room,
    window: windowData
  });

  const handleTreatmentChange = (changes: Partial<TreatmentData>) => {
    if (changes.fabric && onFabricChange) {
      onFabricChange(changes.fabric.id);
    }
    // Handle other treatment changes...
  };

  return (
    <EditableMeasurementVisual
      measurements={measurementData}
      treatmentData={treatmentData}
      projectData={projectData}
      onMeasurementChange={onMeasurementChange}
      onTreatmentChange={handleTreatmentChange}
      onCalculationChange={onFabricCalculationChange}
    />
  );
};

// Example 2: Usage in different contexts
export const ExampleDifferentContexts = () => {
  const [measurements] = useState<MeasurementData>({
    rail_width: "200",
    drop: "250",
    window_type: "standard"
  });

  const projectData: ProjectData = {
    name: "Living Room Renovation",
    client: {
      id: "client-1",
      name: "John Smith",
      email: "john@example.com"
    },
    room: {
      id: "room-1",
      name: "Living Room"
    }
  };

  return (
    <div className="space-y-8">
      {/* Preview for clients */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Client Preview</h3>
        <MeasurementVisual
          measurements={measurements}
          projectData={projectData}
          config={VISUAL_CONFIGS.CLIENT_PREVIEW}
        />
      </div>

      {/* Compact view for lists */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Compact View</h3>
        <CompactMeasurementVisual
          measurements={measurements}
          projectData={projectData}
        />
      </div>

      {/* Work order format */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Work Order</h3>
        <WorkOrderMeasurementVisual
          measurements={measurements}
          projectData={projectData}
        />
      </div>

      {/* Quote display */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quote Display</h3>
        <MeasurementVisual
          measurements={measurements}
          projectData={projectData}
          config={VISUAL_CONFIGS.QUOTE_DISPLAY}
        />
      </div>
    </div>
  );
};

// Example 3: Integration hooks for easy data transformation
export const useVisualMeasurementAdapter = (originalProps: any) => {
  const [measurementData, setMeasurementData] = useState<MeasurementData>({});
  const [treatmentData, setTreatmentData] = useState<TreatmentData>({});
  const [projectData, setProjectData] = useState<ProjectData>({});

  useEffect(() => {
    // Transform your existing data structure to the new format
    setMeasurementData({
      rail_width: originalProps.measurements?.rail_width,
      drop: originalProps.measurements?.drop,
      window_type: originalProps.windowType,
      // ... other transformations
    });

    if (originalProps.selectedTemplate) {
      setTreatmentData(prev => ({
        ...prev,
        template: {
          id: originalProps.selectedTemplate.id,
          name: originalProps.selectedTemplate.name,
          curtain_type: originalProps.selectedTemplate.curtain_type || 'pair',
          fullness_ratio: originalProps.selectedTemplate.fullness_ratio || 2.0,
          header_allowance: originalProps.selectedTemplate.header_allowance || 8,
          bottom_hem: originalProps.selectedTemplate.bottom_hem || 8,
          side_hems: originalProps.selectedTemplate.side_hems || 0,
          seam_hems: originalProps.selectedTemplate.seam_hems || 0,
          return_left: originalProps.selectedTemplate.return_left || 0,
          return_right: originalProps.selectedTemplate.return_right || 0,
          waste_percent: originalProps.selectedTemplate.waste_percent || 0,
          compatible_hardware: originalProps.selectedTemplate.compatible_hardware || []
        }
      }));
    }

    // Transform project data if available
    if (originalProps.project || originalProps.client) {
      setProjectData({
        id: originalProps.project?.id,
        name: originalProps.project?.name,
        client: originalProps.client ? {
          id: originalProps.client.id,
          name: originalProps.client.name,
          // ... other client properties
        } : undefined
      });
    }
  }, [originalProps]);

  return {
    measurementData,
    treatmentData,
    projectData,
    setMeasurementData,
    setTreatmentData,
    setProjectData
  };
};
