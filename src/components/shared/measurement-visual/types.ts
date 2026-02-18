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
    treatment_category?: string;
    panel_configuration?: string;
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
    cost_price?: number; // ✅ Added: Base cost price for markup calculations
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
  orderedLinearMeters?: number; // 🆕 Full widths that must be ordered
  remnantMeters?: number; // 🆕 Leftover fabric to save to pool
  fabricCost?: number; // 🆕 Cost of fabric only
  totalCost: number;
  pricePerMeter: number;
  widthsRequired: number;
  seamsCount?: number; // 🆕 Number of seams needed
  seamLaborHours?: number; // 🆕 Labor hours for seaming
  railWidth: number;
  fullnessRatio: number;
  drop: number;
  headerHem: number;
  bottomHem: number;
  pooling: number;
  totalDrop: number;
  dropPerWidthMeters?: number; // 🆕 Drop length per width in meters
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
  horizontalPiecesNeeded?: number;
  leftoverFromLastPiece?: number;
  // ✅ NEW FIELDS for display synchronization
  fabricRotated?: boolean;
  fabricOrientation?: 'horizontal' | 'vertical';
  linearMetersPerPiece?: number; // Per-piece meters for accurate horizontal display
  overlap?: number; // Overlap in cm for display synchronization
  seamsRequired?: number; // Number of seams needed (alias for seamsCount)
  hasBothPrices?: boolean; // Whether fabric has both cost_price and selling_price
  priceIsAlreadySelling?: boolean; // Whether base price is already the selling price (no markup needed)
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