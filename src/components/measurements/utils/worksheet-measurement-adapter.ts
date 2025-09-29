import type { MeasurementData, TreatmentData, ProjectData } from "@/components/shared/measurement-visual/types";

/**
 * Transforms worksheet data to MeasurementVisual format for comprehensive preview display
 */
export const transformWorksheetData = (
  measurements: Record<string, any>,
  selectedTemplate: any,
  selectedItems: { fabric?: any; hardware?: any; material?: any },
  selectedHeading: string,
  selectedLining: string,
  clientId?: string,
  projectId?: string,
  surfaceId?: string,
  surfaceData?: any
) => {
  // Transform measurements data
  const measurementData: MeasurementData = {
    rail_width: measurements.rail_width?.toString() || "",
    drop: measurements.drop?.toString() || "",
    stackback_left: measurements.stackback_left?.toString() || "",
    stackback_right: measurements.stackback_right?.toString() || "",
    returns: measurements.returns?.toString() || "",
    pooling_amount: measurements.pooling_amount?.toString() || "",
    pooling_option: measurements.pooling_option || "above_floor",
    window_type: measurements.window_type || "standard",
    curtain_type: selectedTemplate?.curtain_type || measurements.curtain_type || "pair",
    curtain_side: measurements.curtain_side || "left",
    hardware_type: selectedTemplate?.compatible_hardware?.[0]?.toLowerCase() || measurements.hardware_type || "rod",
    ...measurements // Include any additional measurements
  };

  // Transform treatment data
  const treatmentData: TreatmentData = {
    template: selectedTemplate ? {
      id: selectedTemplate.id?.toString() || "template-1",
      name: selectedTemplate.name || "Custom Template",
      curtain_type: selectedTemplate.curtain_type || "pair",
      fullness_ratio: selectedTemplate.fullness_ratio || 2.0,
      header_allowance: selectedTemplate.header_allowance || 8,
      bottom_hem: selectedTemplate.bottom_hem || 8,
      side_hems: selectedTemplate.side_hems || 0,
      seam_hems: selectedTemplate.seam_hems || 0,
      return_left: selectedTemplate.return_left || 0,
      return_right: selectedTemplate.return_right || 0,
      waste_percent: selectedTemplate.waste_percent || 0,
      compatible_hardware: selectedTemplate.compatible_hardware || []
    } : undefined,
    
    fabric: selectedItems.fabric ? {
      id: selectedItems.fabric.id?.toString() || "fabric-1",
      name: selectedItems.fabric.name || "Selected Fabric",
      fabric_width: selectedItems.fabric.fabric_width || 137,
      price_per_meter: selectedItems.fabric.selling_price || selectedItems.fabric.unit_price || selectedItems.fabric.price_per_meter || 0,
      unit_price: selectedItems.fabric.unit_price,
      selling_price: selectedItems.fabric.selling_price
    } : undefined,

    lining: selectedLining && selectedLining !== 'none' ? {
      type: selectedLining,
      name: selectedLining.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    } : undefined,

    heading: selectedHeading && selectedHeading !== 'standard' ? {
      id: selectedHeading,
      name: selectedHeading.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    } : undefined
  };

  // Transform project data
  const projectData: ProjectData = {
    id: projectId,
    name: "Current Project", // Could be enhanced to get actual project name
    client: clientId ? {
      id: clientId,
      name: "Client Name", // Could be enhanced to get actual client data
      email: undefined,
      company_name: undefined,
      address: undefined,
      phone: undefined
    } : undefined,
    room: {
      id: surfaceId || "room-1",
      name: surfaceData?.name || "Room",
      room_type: surfaceData?.room_type
    },
    window: {
      id: surfaceId || "window-1",
      type: measurements.window_type || surfaceData?.window_type || "standard",
      width: measurements.rail_width?.toString(),
      height: measurements.drop?.toString(),
      position: surfaceData?.position
    }
  };

  return {
    measurementData,
    treatmentData,
    projectData
  };
};

/**
 * Helper function to get heading display name
 */
export const getHeadingDisplayName = (headingId: string, headingOptionsFromSettings: any[] = [], headingInventory: any[] = []) => {
  if (headingId === 'standard') return 'Standard';
  if (headingId === 'no-heading') return 'No heading';
  
  // Try heading options from settings first
  const settingsHeading = headingOptionsFromSettings.find(h => h.id === headingId);
  if (settingsHeading) return settingsHeading.name;
  
  // Try heading inventory
  const inventoryHeading = headingInventory.find(h => h.id === headingId);
  if (inventoryHeading) return inventoryHeading.name;
  
  // Fallback to formatted ID
  return headingId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Enhanced data transformer with better data mapping
 */
export const transformWorksheetDataEnhanced = (
  measurements: Record<string, any>,
  selectedTemplate: any,
  selectedItems: { fabric?: any; hardware?: any; material?: any },
  selectedHeading: string,
  selectedLining: string,
  fabricCalculation: any,
  clientId?: string,
  projectId?: string,
  surfaceId?: string,
  surfaceData?: any,
  selectedWindowType?: any
) => {
  const result = transformWorksheetData(
    measurements,
    selectedTemplate,
    selectedItems,
    selectedHeading,
    selectedLining,
    clientId,
    projectId,
    surfaceId,
    surfaceData
  );

  // Enhance with additional data
  if (selectedWindowType) {
    result.projectData.window = {
      ...result.projectData.window,
      type: selectedWindowType.key || selectedWindowType.name || "standard"
    };
  }

  return result;
};