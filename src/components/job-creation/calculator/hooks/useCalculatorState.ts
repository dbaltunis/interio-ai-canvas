
import { useState, useCallback } from 'react';
import { TreatmentFormData } from '../types';

interface CalculatorState {
  formData: TreatmentFormData;
  fabricOrientation: "vertical" | "horizontal";
  isManualFabric: boolean;
  dontUpdateTotalPrice: boolean;
  isHemDialogOpen: boolean;
  hemConfig: {
    header_hem: string;
    bottom_hem: string;
    side_hem: string;
    seam_hem: string;
  };
}

export const useCalculatorState = (
  treatmentType: string,
  businessSettings: any
) => {
  const [formData, setFormData] = useState<TreatmentFormData>({
    treatmentName: `${treatmentType} Treatment`,
    quantity: 1,
    windowPosition: "",
    windowType: "",
    headingStyle: "",
    headingFullness: "2",
    lining: "",
    mounting: "",
    railWidth: "0",
    curtainDrop: "0",
    curtainPooling: "0",
    returnDepth: "8",
    fabricMode: "manual",
    selectedFabric: null,
    fabricName: "Sky Gray 01",
    fabricWidth: "140",
    fabricPricePerYard: "18.7",
    verticalRepeat: "0",
    horizontalRepeat: "0",
    hardware: "",
    hardwareFinish: "",
    additionalFeatures: [],
    laborRate: businessSettings?.labor_rate || 45,
    markupPercentage: businessSettings?.default_markup || 40
  });

  const [fabricOrientation, setFabricOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [isManualFabric, setIsManualFabric] = useState(true);
  const [dontUpdateTotalPrice, setDontUpdateTotalPrice] = useState(false);
  const [isHemDialogOpen, setIsHemDialogOpen] = useState(false);
  const [hemConfig, setHemConfig] = useState({
    header_hem: "15",
    bottom_hem: "10",
    side_hem: "5", 
    seam_hem: "3"
  });

  const updateFormData = useCallback((updates: Partial<TreatmentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetToDefaults = useCallback((matchingTemplate: any, businessSettings: any) => {
    const templateHeadings = matchingTemplate?.components?.headings || {};
    const templateHardware = matchingTemplate?.components?.hardware || {};
    const templateLining = matchingTemplate?.components?.lining || {};
    
    const defaultHeading = Object.keys(templateHeadings).find(id => templateHeadings[id]) || "";
    const defaultHardware = Object.keys(templateHardware).find(id => templateHardware[id]) || "";
    const defaultLining = Object.keys(templateLining).find(id => templateLining[id]) || "";
    
    setFormData({
      treatmentName: `${treatmentType} Treatment`,
      quantity: 1,
      windowPosition: "",
      windowType: "",
      headingStyle: defaultHeading,
      headingFullness: "2",
      lining: defaultLining,
      mounting: "",
      railWidth: "0",
      curtainDrop: "0",
      curtainPooling: "0",
      returnDepth: "8",
      fabricMode: "manual",
      selectedFabric: null,
      fabricName: "Sky Gray 01",
      fabricWidth: "140",
      fabricPricePerYard: "18.7",
      verticalRepeat: "0",
      horizontalRepeat: "0",
      hardware: defaultHardware,
      hardwareFinish: "",
      additionalFeatures: [],
      laborRate: businessSettings?.labor_rate || 45,
      markupPercentage: businessSettings?.default_markup || 40
    });
    
    setHemConfig({
      header_hem: "15",
      bottom_hem: "10",
      side_hem: "5", 
      seam_hem: "3"
    });
    setFabricOrientation("vertical");
    setIsManualFabric(true);
    setDontUpdateTotalPrice(false);
  }, [treatmentType]);

  return {
    formData,
    setFormData,
    updateFormData,
    fabricOrientation,
    setFabricOrientation,
    isManualFabric,
    setIsManualFabric,
    dontUpdateTotalPrice,
    setDontUpdateTotalPrice,
    isHemDialogOpen,
    setIsHemDialogOpen,
    hemConfig,
    setHemConfig,
    resetToDefaults
  };
};
