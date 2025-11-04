// Centralized Labor Cost Calculations

export interface LaborCalculationParams {
  railWidth: number;
  drop: number;
  fullness: number;
  laborRate: number;
  seamLaborHours?: number;
  treatmentComplexity?: 'simple' | 'moderate' | 'complex';
}

export interface LaborResult {
  hours: number;
  cost: number;
  breakdown: {
    baseHours: number;
    complexityHours: number;
    seamHours: number;
  };
}

// Calculate labor hours and cost
export const calculateLabor = (params: LaborCalculationParams): LaborResult => {
  const {
    railWidth,
    drop,
    fullness,
    laborRate,
    seamLaborHours = 0,
    treatmentComplexity = 'moderate'
  } = params;

  // Base hours depend on treatment complexity
  const baseHours = treatmentComplexity === 'simple' ? 1.5 :
                   treatmentComplexity === 'complex' ? 3 : 2;

  // Sewing complexity based on dimensions and fullness
  const complexityFactor = treatmentComplexity === 'simple' ? 20000 :
                          treatmentComplexity === 'complex' ? 15000 : 25000;
  
  const complexityHours = (railWidth * drop * fullness) / complexityFactor;

  // Total hours with minimum threshold
  const totalHours = Math.max(
    treatmentComplexity === 'simple' ? 1 : 3,
    baseHours + complexityHours + seamLaborHours
  );

  return {
    hours: totalHours,
    cost: laborRate * totalHours,
    breakdown: {
      baseHours,
      complexityHours,
      seamHours: seamLaborHours
    }
  };
};
