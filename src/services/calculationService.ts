
import { FormulaEngine, FormulaResult } from '@/utils/formulaEngine';
import { CalculationFormula } from '@/hooks/useCalculationFormulas';

export interface CalculationInput {
  railWidth: number;
  curtainDrop: number;
  quantity: number;
  headingFullness?: number;
  fabricWidth?: number;
  fabricPricePerYard?: number;
  treatmentType: string;
  curtainPooling?: number;
  // Additional variables for different formula types
  [key: string]: any;
}

export interface CalculationOutput {
  fabricCost: number;
  laborCost: number;
  hardwareCost: number;
  totalCost: number;
  breakdown: {
    fabric: FormulaResult;
    labor: FormulaResult;
    hardware: FormulaResult;
  };
  details: {
    fabricYards: number;
    laborHours?: number;
    hardwareItems?: string[];
  };
}

export class CalculationService {
  private formulaEngine: FormulaEngine;

  constructor() {
    this.formulaEngine = new FormulaEngine();
  }

  calculateTreatmentCost(
    input: CalculationInput,
    formulas: CalculationFormula[]
  ): CalculationOutput {
    // Set up variables for formula engine
    this.formulaEngine.setVariables({
      width: input.railWidth,
      height: input.curtainDrop,
      drop: input.curtainDrop,
      quantity: input.quantity,
      fullness: input.headingFullness || 2.5,
      fabric_width: input.fabricWidth || 137,
      fabric_price: input.fabricPricePerYard || 0,
      pooling: input.curtainPooling || 0,
      track_width: input.railWidth / 100, // Convert to meters
      ...input // Include any additional variables
    });

    // Calculate fabric cost
    const fabricResult = this.calculateFabricCost(input, formulas);
    
    // Calculate labor cost
    const laborResult = this.calculateLaborCost(input, formulas, fabricResult.value);
    
    // Calculate hardware cost
    const hardwareResult = this.calculateHardwareCost(input, formulas);

    return {
      fabricCost: fabricResult.value,
      laborCost: laborResult.value,
      hardwareCost: hardwareResult.value,
      totalCost: fabricResult.value + laborResult.value + hardwareResult.value,
      breakdown: {
        fabric: fabricResult,
        labor: laborResult,
        hardware: hardwareResult
      },
      details: {
        fabricYards: this.extractFabricYards(fabricResult),
        laborHours: this.extractLaborHours(laborResult),
        hardwareItems: this.extractHardwareItems(hardwareResult)
      }
    };
  }

  private calculateFabricCost(input: CalculationInput, formulas: CalculationFormula[]): FormulaResult {
    // Find appropriate fabric formula based on treatment type
    const fabricFormula = formulas.find(f => 
      f.category === 'fabric' && 
      f.active &&
      (f.applies_to?.includes(input.treatmentType) || f.applies_to?.includes('all'))
    );

    if (!fabricFormula) {
      return this.fallbackFabricCalculation(input);
    }

    // Add formula-specific variables
    const conditions = fabricFormula.conditions ? Object.entries(fabricFormula.conditions).map(([variable, condition]: [string, any]) => ({
      variable,
      operator: condition.operator,
      value: condition.value
    })) : undefined;

    return this.formulaEngine.evaluateFormula(fabricFormula.formula_expression, conditions);
  }

  private calculateLaborCost(input: CalculationInput, formulas: CalculationFormula[], fabricYards: number): FormulaResult {
    // Add fabric yards to variables for labor calculations
    this.formulaEngine.setVariable('fabric_yards', fabricYards);
    this.formulaEngine.setVariable('fabric_metres', fabricYards * 0.9144); // Convert to metres

    const laborFormula = formulas.find(f => 
      f.category === 'labor' && 
      f.active &&
      (f.applies_to?.includes(input.treatmentType) || f.applies_to?.includes('all'))
    );

    if (!laborFormula) {
      return this.fallbackLaborCalculation(input);
    }

    const conditions = laborFormula.conditions ? Object.entries(laborFormula.conditions).map(([variable, condition]: [string, any]) => ({
      variable,
      operator: condition.operator,
      value: condition.value
    })) : undefined;

    return this.formulaEngine.evaluateFormula(laborFormula.formula_expression, conditions);
  }

  private calculateHardwareCost(input: CalculationInput, formulas: CalculationFormula[]): FormulaResult {
    const hardwareFormula = formulas.find(f => 
      f.category === 'hardware' && 
      f.active &&
      (f.applies_to?.includes(input.treatmentType) || f.applies_to?.includes('all'))
    );

    if (!hardwareFormula) {
      return this.fallbackHardwareCalculation(input);
    }

    const conditions = hardwareFormula.conditions ? Object.entries(hardwareFormula.conditions).map(([variable, condition]: [string, any]) => ({
      variable,
      operator: condition.operator,
      value: condition.value
    })) : undefined;

    return this.formulaEngine.evaluateFormula(hardwareFormula.formula_expression, conditions);
  }

  // Fallback calculations for when no formulas are found
  private fallbackFabricCalculation(input: CalculationInput): FormulaResult {
    const fabricYards = (input.railWidth * input.curtainDrop * (input.headingFullness || 2.5)) / (input.fabricWidth || 137) / 91.44;
    const cost = fabricYards * (input.fabricPricePerYard || 0);
    
    return {
      value: cost,
      breakdown: `Fallback: ${fabricYards.toFixed(2)} yards × £${input.fabricPricePerYard || 0} = £${cost.toFixed(2)}`,
      variables: []
    };
  }

  private fallbackLaborCalculation(input: CalculationInput): FormulaResult {
    const baseCost = 85; // Default labor rate
    const hours = input.treatmentType.includes('blind') ? 1.5 : 3;
    const cost = hours * baseCost * input.quantity;
    
    return {
      value: cost,
      breakdown: `Fallback: ${hours} hours × £${baseCost} × ${input.quantity} = £${cost.toFixed(2)}`,
      variables: []
    };
  }

  private fallbackHardwareCalculation(input: CalculationInput): FormulaResult {
    const trackCost = (input.railWidth / 100) * 25; // £25 per meter
    const bracketCost = Math.ceil(input.railWidth / 150) * 5; // £5 per bracket
    const cost = trackCost + bracketCost;
    
    return {
      value: cost,
      breakdown: `Fallback: Track £${trackCost.toFixed(2)} + Brackets £${bracketCost.toFixed(2)} = £${cost.toFixed(2)}`,
      variables: []
    };
  }

  private extractFabricYards(result: FormulaResult): number {
    // Try to extract fabric yards from variables or calculate from value
    const fabricVariable = result.variables.find(v => v.name.includes('fabric') || v.name.includes('yards'));
    return fabricVariable?.value || 0;
  }

  private extractLaborHours(result: FormulaResult): number {
    const hoursVariable = result.variables.find(v => v.name.includes('hours') || v.name.includes('time'));
    return hoursVariable?.value || 0;
  }

  private extractHardwareItems(result: FormulaResult): string[] {
    // Extract hardware items from the breakdown
    const breakdown = result.breakdown.toLowerCase();
    const items: string[] = [];
    
    if (breakdown.includes('track')) items.push('Track');
    if (breakdown.includes('bracket')) items.push('Brackets');
    if (breakdown.includes('glider')) items.push('Gliders');
    if (breakdown.includes('motor')) items.push('Motor');
    
    return items;
  }
}
