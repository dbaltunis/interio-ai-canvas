
export interface FabricCalculationParams {
  railWidth: number;
  drop: number;
  fullness: number;
  fabricWidth: number;
  quantity: number;
  pooling: number;
  headerHem: number;
  bottomHem: number;
  sideHem: number;
  seamHem: number;
  // New: repeats and returns (cm)
  verticalPatternRepeatCm?: number;
  horizontalPatternRepeatCm?: number;
  returnLeft?: number;
  returnRight?: number;
}

export interface OrientationResult {
  orientation: 'horizontal' | 'vertical';
  feasible: boolean;
  warnings: string[];
  totalYards: number;
  totalMeters: number;
  widthsRequired: number;
  dropsPerWidth: number;
  seamsRequired: number;
  seamLaborHours: number;
  totalLaborHours: number;
  fabricCost: number;
  laborCost: number;
  totalCost: number;
  details: {
    effectiveFabricWidth: number;
    requiredLength: number;
    requiredWidth: number;
    panelsNeeded: number;
    totalSeamAllowance: number;
    fabricWidthPerPanel: number;
    lengthPerWidth: number;
    headerHem: number;
    bottomHem: number;
    sideHem: number;
    seamHem: number;
  };
}

export interface FabricUsageResult {
  yards: number;
  meters: number;
  details: any;
  fabricOrientation: string;
  costComparison: any;
  warnings: string[];
  seamsRequired: number;
  seamLaborHours: number;
  widthsRequired: number;
}
