
export interface FabricLibraryItem {
  id: string;
  name: string;
  code: string;
  pricePerYard: number;
  width: number;
  type: string;
  collection: string;
}

export interface AdditionalFeature {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

export interface TreatmentFormData {
  // Basic Details
  treatmentName: string;
  quantity: number;
  windowPosition: string;
  windowType: string;
  
  // Treatment Specifications
  headingStyle: string;
  headingFullness: string;
  lining: string;
  mounting: string;
  
  // Measurements
  railWidth: string;
  curtainDrop: string;
  curtainPooling: string;
  returnDepth: string;
  
  // Fabric Selection
  fabricMode: "library" | "manual";
  selectedFabric: any;
  fabricName: string;
  fabricWidth: string;
  fabricPricePerYard: string;
  verticalRepeat: string;
  horizontalRepeat: string;
  
  // Hardware
  hardware: string;
  hardwareFinish: string;
  
  // Additional Features
  additionalFeatures: AdditionalFeature[];
  
  // Pricing
  laborRate: number;
  markupPercentage: number;
  
  // Selected Parts for subcategories
  selectedParts?: {
    headrail?: string;
    chainSide?: string;
  };
}

export interface FeatureBreakdown {
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  calculation: string;
}

export interface DetailedCalculation {
  fabricCalculation: string;
  laborCalculation: string;
  featureBreakdown: FeatureBreakdown[];
  totalUnits: number;
  fabricPricePerYard: number;
  fabricWidthRequired: number;
  fabricLengthRequired: number;
  dropsPerWidth: number;
  widthsRequired: number;
}

export interface CalculationResult {
  fabricYards: number;
  fabricCost: number;
  laborHours: number;
  laborCost: number;
  featuresCost: number;
  subtotal: number;
  total: number;
}

export interface TreatmentCalculatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatmentData: any) => void;
  treatmentType: string;
}
