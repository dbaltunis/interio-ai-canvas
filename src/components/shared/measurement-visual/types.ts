// Types for the reusable measurement visual system

export interface MeasurementData {
  rail_width?: string;
  drop?: string;
  stackback_left?: string;
  stackback_right?: string;
  returns?: string;
  pooling_amount?: string;
  pooling_option?: string;
  window_type?: string;
  curtain_type?: string;
  curtain_side?: string;
  hardware_type?: string;
  [key: string]: any; // Allow for additional custom measurements
}

export interface TreatmentData {
  template?: {
    id: string;
    name: string;
    curtain_type: string;
    fullness_ratio: number;
    header_allowance: number;
    bottom_hem: number;
    side_hems: number;
    seam_hems: number;
    return_left: number;
    return_right: number;
    waste_percent: number;
    compatible_hardware: string[];
  };
  fabric?: {
    id: string;
    name: string;
    fabric_width: number;
    price_per_meter: number;
    unit_price?: number;
    selling_price?: number;
  };
  lining?: {
    type: string;
    name: string;
  };
  heading?: {
    id: string;
    name: string;
  };
}

export interface ProjectData {
  id?: string;
  name?: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    company_name?: string;
    address?: string;
    phone?: string;
  };
  room?: {
    id: string;
    name: string;
    room_type?: string;
  };
  window?: {
    id: string;
    type: string;
    width?: string;
    height?: string;
    position?: string;
  };
}

export interface VisualConfig {
  showMeasurementInputs?: boolean;
  showFabricSelection?: boolean;
  showTreatmentOptions?: boolean;
  showCalculations?: boolean;
  readOnly?: boolean;
  compact?: boolean;
  hideHeader?: boolean;
  windowType?: string;
  customTitle?: string;
  allowEditing?: boolean;
}

export interface FabricCalculation {
  linearMeters: number;
  totalCost: number;
  pricePerMeter: number;
  widthsRequired: number;
  railWidth: number;
  fullnessRatio: number;
  drop: number;
  headerHem: number;
  bottomHem: number;
  pooling: number;
  totalDrop: number;
  returns: number;
  wastePercent: number;
  sideHems: number;
  seamHems: number;
  totalSeamAllowance: number;
  totalSideHems: number;
  returnLeft: number;
  returnRight: number;
  curtainCount: number;
  curtainType: string;
  totalWidthWithAllowances: number;
}

export interface MeasurementVisualProps {
  measurements: MeasurementData;
  treatmentData?: TreatmentData;
  projectData?: ProjectData;
  config?: VisualConfig;
  onMeasurementChange?: (field: string, value: string) => void;
  onTreatmentChange?: (changes: Partial<TreatmentData>) => void;
  onCalculationChange?: (calculation: FabricCalculation | null) => void;
  className?: string;
}