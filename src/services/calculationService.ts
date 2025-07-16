
import { FormulaEngine } from '@/utils/formulaEngine';

export interface CalculationInput {
  railWidth: number;
  curtainDrop: number;
  quantity: number;
  headingFullness: number;
  fabricWidth: number;
  fabricPricePerYard: number;
  curtainPooling?: number;
  treatmentType: string;
  labor_rate: number;
  header_hem?: number;
  bottom_hem?: number;
  track_price_per_meter?: number;
  bracket_price?: number;
  glider_price?: number;
}

export interface CalculationResult {
  fabricCost: number;
  laborCost: number;
  hardwareCost: number;
  totalCost: number;
  breakdown: {
    fabric: { value: number; breakdown: string };
    labor: { value: number; breakdown: string };
    hardware: { value: number; breakdown: string };
  };
  details: {
    fabricYards?: number;
    laborHours?: number;
    hardwareItems?: any[];
  };
}

export class CalculationService {
  private engine: FormulaEngine;

  constructor() {
    this.engine = new FormulaEngine();
  }

  calculateTreatmentCost(input: CalculationInput, formulas: any[]): CalculationResult {
    console.log("🔧 CalculationService: Starting calculation with formulas", {
      inputType: input.treatmentType,
      formulasCount: formulas.length,
      railWidth: input.railWidth,
      curtainDrop: input.curtainDrop
    });

    // Set all variables in the engine
    this.engine.setVariables({
      width: input.railWidth,
      height: input.curtainDrop,
      quantity: input.quantity,
      fullness: input.headingFullness,
      fabric_width: input.fabricWidth,
      fabric_price: input.fabricPricePerYard,
      curtain_pooling: input.curtainPooling || 0,
      labor_rate: input.labor_rate,
      header_hem: input.header_hem || 15,
      bottom_hem: input.bottom_hem || 10,
      track_price_per_meter: input.track_price_per_meter || 25,
      bracket_price: input.bracket_price || 5,
      glider_price: input.glider_price || 0.15
    });

    const result: CalculationResult = {
      fabricCost: 0,
      laborCost: 0,
      hardwareCost: 0,
      totalCost: 0,
      breakdown: {
        fabric: { value: 0, breakdown: 'No fabric formula found' },
        labor: { value: 0, breakdown: 'No labor formula found' },
        hardware: { value: 0, breakdown: 'No hardware formula found' }
      },
      details: {}
    };

    // Calculate fabric cost
    const fabricFormula = this.findApplicableFormula(formulas, input.treatmentType, 'fabric');
    if (fabricFormula) {
      console.log("📐 Using fabric formula:", fabricFormula.name);
      const fabricResult = this.engine.evaluateFormula(fabricFormula.formula_expression);
      if (!fabricResult.error) {
        result.fabricCost = fabricResult.value * input.fabricPricePerYard;
        result.breakdown.fabric = {
          value: result.fabricCost,
          breakdown: `${fabricFormula.name}: ${fabricResult.breakdown} × £${input.fabricPricePerYard}/yard = £${result.fabricCost.toFixed(2)}`
        };
        result.details.fabricYards = fabricResult.value;
        console.log("✅ Fabric calculation:", result.breakdown.fabric.breakdown);
      } else {
        console.error("❌ Fabric formula error:", fabricResult.error);
      }
    }

    // Calculate labor cost
    const laborFormula = this.findApplicableFormula(formulas, input.treatmentType, 'labor');
    if (laborFormula) {
      console.log("👷 Using labor formula:", laborFormula.name);
      const laborResult = this.engine.evaluateFormula(laborFormula.formula_expression);
      if (!laborResult.error) {
        result.laborCost = laborResult.value;
        result.breakdown.labor = {
          value: result.laborCost,
          breakdown: `${laborFormula.name}: ${laborResult.breakdown} = £${result.laborCost.toFixed(2)}`
        };
        result.details.laborHours = laborResult.value / input.labor_rate;
        console.log("✅ Labor calculation:", result.breakdown.labor.breakdown);
      } else {
        console.error("❌ Labor formula error:", laborResult.error);
      }
    }

    // Calculate hardware cost
    const hardwareFormula = this.findApplicableFormula(formulas, input.treatmentType, 'hardware');
    if (hardwareFormula) {
      console.log("🔧 Using hardware formula:", hardwareFormula.name);
      const hardwareResult = this.engine.evaluateFormula(hardwareFormula.formula_expression);
      if (!hardwareResult.error) {
        result.hardwareCost = hardwareResult.value;
        result.breakdown.hardware = {
          value: result.hardwareCost,
          breakdown: `${hardwareFormula.name}: ${hardwareResult.breakdown} = £${result.hardwareCost.toFixed(2)}`
        };
        console.log("✅ Hardware calculation:", result.breakdown.hardware.breakdown);
      } else {
        console.error("❌ Hardware formula error:", hardwareResult.error);
      }
    }

    // Fallback calculations if no formulas are found
    if (!fabricFormula) {
      const fallbackFabric = this.calculateFallbackFabric(input);
      result.fabricCost = fallbackFabric.cost;
      result.breakdown.fabric = fallbackFabric.breakdown;
      result.details.fabricYards = fallbackFabric.yards;
    }

    if (!laborFormula) {
      const fallbackLabor = this.calculateFallbackLabor(input);
      result.laborCost = fallbackLabor.cost;
      result.breakdown.labor = fallbackLabor.breakdown;
    }

    if (!hardwareFormula) {
      const fallbackHardware = this.calculateFallbackHardware(input);
      result.hardwareCost = fallbackHardware.cost;
      result.breakdown.hardware = fallbackHardware.breakdown;
    }

    result.totalCost = result.fabricCost + result.laborCost + result.hardwareCost;

    console.log("💰 Final calculation result:", {
      fabricCost: result.fabricCost,
      laborCost: result.laborCost,
      hardwareCost: result.hardwareCost,
      totalCost: result.totalCost
    });

    return result;
  }

  private findApplicableFormula(formulas: any[], treatmentType: string, category: string) {
    // First try to find formula that applies specifically to this treatment type
    let formula = formulas.find(f => 
      f.category === category &&
      f.active &&
      f.applies_to?.includes(treatmentType.toLowerCase())
    );

    // If not found, try to find formula that applies to 'all'
    if (!formula) {
      formula = formulas.find(f => 
        f.category === category &&
        f.active &&
        (f.applies_to?.includes('all') || !f.applies_to || f.applies_to.length === 0)
      );
    }

    return formula;
  }

  private calculateFallbackFabric(input: CalculationInput) {
    const isBlind = input.treatmentType.toLowerCase().includes('blind');
    let yards = 0;
    let breakdown = '';

    if (isBlind) {
      // For blinds: simple area calculation
      const areaSquareCm = input.railWidth * input.curtainDrop;
      yards = (areaSquareCm / (91.44 * 91.44)) * input.quantity;
      breakdown = `Fallback blind: ${input.railWidth}cm × ${input.curtainDrop}cm × ${input.quantity} = ${yards.toFixed(2)} yards`;
    } else {
      // For curtains: traditional calculation
      const dropWithHems = input.curtainDrop + (input.header_hem || 15) + (input.bottom_hem || 10) + (input.curtainPooling || 0);
      const widthPerPanel = input.railWidth / input.quantity;
      const fabricWidthNeeded = widthPerPanel * input.headingFullness;
      const widthsNeeded = Math.ceil(fabricWidthNeeded / input.fabricWidth);
      yards = (dropWithHems * widthsNeeded * input.quantity) / 91.44;
      breakdown = `Fallback curtain: ${dropWithHems}cm drop × ${widthsNeeded} widths × ${input.quantity} panels = ${yards.toFixed(2)} yards`;
    }

    return {
      cost: yards * input.fabricPricePerYard,
      yards,
      breakdown: {
        value: yards * input.fabricPricePerYard,
        breakdown
      }
    };
  }

  private calculateFallbackLabor(input: CalculationInput) {
    const isBlind = input.treatmentType.toLowerCase().includes('blind');
    const estimatedHours = isBlind ? 1.5 : 3;
    const cost = estimatedHours * input.labor_rate * input.quantity;
    
    return {
      cost,
      breakdown: {
        value: cost,
        breakdown: `Fallback labor: ${estimatedHours}h × £${input.labor_rate}/h × ${input.quantity} items = £${cost.toFixed(2)}`
      }
    };
  }

  private calculateFallbackHardware(input: CalculationInput) {
    const trackLength = input.railWidth / 100; // Convert to meters
    const trackCost = trackLength * (input.track_price_per_meter || 25);
    const bracketCost = Math.ceil(trackLength / 1.5) * (input.bracket_price || 5); // Bracket every 1.5m
    const gliderCost = input.quantity * 10 * (input.glider_price || 0.15); // 10 gliders per panel
    const totalCost = trackCost + bracketCost + gliderCost;

    return {
      cost: totalCost,
      breakdown: {
        value: totalCost,
        breakdown: `Fallback hardware: Track £${trackCost.toFixed(2)} + Brackets £${bracketCost.toFixed(2)} + Gliders £${gliderCost.toFixed(2)} = £${totalCost.toFixed(2)}`
      }
    };
  }
}
