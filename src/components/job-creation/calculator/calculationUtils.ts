import { TreatmentFormData, CalculationResult, DetailedCalculation } from './types';
import { CalculationService, CalculationInput } from '@/services/calculationService';
import { CalculationFormula } from '@/hooks/useCalculationFormulas';

export const calculateTotalPrice = (
  formData: TreatmentFormData, 
  productTemplate?: any,
  formulas?: CalculationFormula[]
): CalculationResult & { details: DetailedCalculation } => {
  const railWidth = parseFloat(formData.railWidth) || 0;
  const curtainDrop = parseFloat(formData.curtainDrop) || 0;
  const fullness = parseFloat(formData.headingFullness) || 2.5;
  const quantity = formData.quantity;
  const pooling = parseFloat(formData.curtainPooling) || 0;
  const fabricWidth = parseFloat(formData.fabricWidth) || 137;
  const fabricPricePerYard = parseFloat(formData.fabricPricePerYard) || 0;
  
  if (!railWidth || !curtainDrop) {
    return {
      fabricYards: 0,
      fabricCost: 0,
      laborHours: 0,
      laborCost: 0,
      featuresCost: 0,
      subtotal: 0,
      total: 0,
      details: {
        fabricCalculation: "No measurements provided",
        laborCalculation: "No measurements provided",
        featureBreakdown: [],
        totalUnits: 0,
        fabricPricePerYard: 0,
        fabricWidthRequired: 0,
        fabricLengthRequired: 0,
        dropsPerWidth: 0,
        widthsRequired: 0
      }
    };
  }

  // Use formula-based calculation if formulas are available
  if (formulas && formulas.length > 0) {
    return calculateWithFormulas(formData, productTemplate, formulas);
  }

  // Fall back to original calculation logic
  return calculateWithOriginalLogic(formData, productTemplate);
};

function calculateWithFormulas(
  formData: TreatmentFormData,
  productTemplate: any,
  formulas: CalculationFormula[]
): CalculationResult & { details: DetailedCalculation } {
  const calculationService = new CalculationService();
  
  const input: CalculationInput = {
    railWidth: parseFloat(formData.railWidth) || 0,
    curtainDrop: parseFloat(formData.curtainDrop) || 0,
    quantity: formData.quantity,
    headingFullness: parseFloat(formData.headingFullness) || 2.5,
    fabricWidth: parseFloat(formData.fabricWidth) || 137,
    fabricPricePerYard: parseFloat(formData.fabricPricePerYard) || 0,
    curtainPooling: parseFloat(formData.curtainPooling) || 0,
    treatmentType: productTemplate?.name?.toLowerCase() || 'curtain',
    labor_rate: formData.laborRate || 85,
    markup_percentage: formData.markupPercentage || 0
  };

  const result = calculationService.calculateTreatmentCost(input, formulas);
  
  // Calculate features cost (lining, etc.)
  const selectedFeatures = formData.additionalFeatures?.filter(f => f.selected) || [];
  const featureBreakdown = selectedFeatures.map(feature => ({
    name: feature.name,
    unitPrice: feature.price,
    quantity: formData.quantity,
    totalPrice: feature.price * formData.quantity,
    calculation: `${feature.price.toFixed(2)} × ${formData.quantity} panels = ${(feature.price * formData.quantity).toFixed(2)}`
  }));
  
  const featuresCost = featureBreakdown.reduce((sum, feature) => sum + feature.totalPrice, 0);
  const subtotal = result.totalCost + featuresCost;
  const total = subtotal * (1 + (formData.markupPercentage || 0) / 100);

  return {
    fabricYards: Math.ceil(result.details.fabricYards * 10) / 10,
    fabricCost: result.fabricCost,
    laborHours: result.details.laborHours || 0,
    laborCost: result.laborCost,
    featuresCost,
    subtotal,
    total,
    details: {
      fabricCalculation: result.breakdown.fabric.breakdown,
      laborCalculation: result.breakdown.labor.breakdown,
      featureBreakdown,
      totalUnits: formData.quantity,
      fabricPricePerYard: parseFloat(formData.fabricPricePerYard) || 0,
      fabricWidthRequired: parseFloat(formData.railWidth) || 0,
      fabricLengthRequired: parseFloat(formData.curtainDrop) || 0,
      dropsPerWidth: 1,
      widthsRequired: Math.ceil((parseFloat(formData.railWidth) * parseFloat(formData.headingFullness)) / parseFloat(formData.fabricWidth))
    }
  };
}

function calculateWithOriginalLogic(
  formData: TreatmentFormData,
  productTemplate?: any
): CalculationResult & { details: DetailedCalculation } {
  const railWidth = parseFloat(formData.railWidth) || 0;
  const curtainDrop = parseFloat(formData.curtainDrop) || 0;
  const fullness = parseFloat(formData.headingFullness) || 2.5;
  const quantity = formData.quantity;
  const pooling = parseFloat(formData.curtainPooling) || 0;
  const fabricWidth = parseFloat(formData.fabricWidth) || 137;
  const fabricPricePerYard = parseFloat(formData.fabricPricePerYard) || 0;
  
  // Determine if this is a blind or curtain treatment
  const treatmentName = productTemplate?.name?.toLowerCase() || '';
  const isBlind = treatmentName.includes('blind') || productTemplate?.product_type?.toLowerCase().includes('blind');

  let totalFabricYards = 0;
  let fabricCalculation = "";

  if (isBlind) {
    // For blinds: simple area calculation with minimal waste
    const fabricAreaCm = railWidth * curtainDrop;
    const fabricAreaYards = fabricAreaCm / (91.44 * 91.44); // Convert cm² to yards²
    totalFabricYards = fabricAreaYards * quantity;
    
    fabricCalculation = `Blind fabric: ${railWidth}cm × ${curtainDrop}cm = ${fabricAreaCm}cm² per blind × ${quantity} = ${totalFabricYards.toFixed(2)} yards`;
  } else {
    // For curtains: traditional calculation with hems and fullness
    const headerHem = 15;
    const bottomHem = 10;
    const fabricDropWithAllowances = curtainDrop + pooling + headerHem + bottomHem;
    
    const curtainWidthPerPanel = railWidth / quantity;
    const fabricWidthRequiredPerPanel = curtainWidthPerPanel * fullness;
    
    const fabricWidthsNeededPerPanel = Math.ceil(fabricWidthRequiredPerPanel / fabricWidth);
    const totalFabricLengthCm = fabricDropWithAllowances * fabricWidthsNeededPerPanel * quantity;
    totalFabricYards = totalFabricLengthCm / 91.44;
    
    fabricCalculation = `Curtain fabric: ${railWidth}cm rail ÷ ${quantity} panels = ${curtainWidthPerPanel.toFixed(0)}cm per panel. ${curtainWidthPerPanel.toFixed(0)}cm × ${fullness} fullness = ${fabricWidthRequiredPerPanel.toFixed(0)}cm width needed per panel. Drop: ${curtainDrop}cm + ${pooling}cm pooling + ${headerHem + bottomHem}cm allowances = ${fabricDropWithAllowances.toFixed(0)}cm. ${fabricWidthsNeededPerPanel} width(s) per panel × ${quantity} panels × ${fabricDropWithAllowances.toFixed(0)}cm = ${totalFabricLengthCm.toFixed(0)}cm = ${totalFabricYards.toFixed(2)} yards`;
  }

  // Fabric cost calculation
  const fabricCost = totalFabricYards * fabricPricePerYard;
  
  // Labor/manufacturing cost calculation - follow template settings exactly
  let laborCost = 0;
  
  if (productTemplate?.calculation_rules) {
    const rules = productTemplate.calculation_rules;
    const baseMakingCost = parseFloat(rules.baseMakingCost) || 0;
    
    if (productTemplate.pricing_unit === 'per-linear-meter') {
      laborCost = baseMakingCost * (railWidth / 100) * quantity;
    } else {
      laborCost = baseMakingCost * quantity;
    }
    
    // Apply height surcharges only if configured and not for blinds
    if (!isBlind && rules.useHeightSurcharges) {
      const baseHeightLimit = parseFloat(rules.baseHeightLimit) || 240;
      if (curtainDrop > baseHeightLimit) {
        const heightSurcharge = parseFloat(rules.heightSurcharge1) || 0;
        laborCost += heightSurcharge * quantity;
      }
    }
  } else {
    // Fallback labor calculation
    const laborRate = formData.laborRate || 45;
    const estimatedHours = isBlind ? 1.5 : 3; // Blinds take less time
    laborCost = estimatedHours * laborRate * quantity;
  }
  
  // Features cost calculation - no lining for blinds
  const selectedFeatures = isBlind ? [] : (formData.additionalFeatures?.filter(f => f.selected) || []);
  const featureBreakdown = selectedFeatures.map(feature => ({
    name: feature.name,
    unitPrice: feature.price,
    quantity: quantity,
    totalPrice: feature.price * quantity,
    calculation: `${feature.price.toFixed(2)} × ${quantity} panels = ${(feature.price * quantity).toFixed(2)}`
  }));
  
  const featuresCost = featureBreakdown.reduce((sum, feature) => sum + feature.totalPrice, 0);
  
  // Subtotal and total
  const subtotal = fabricCost + laborCost + featuresCost;
  const total = subtotal * (1 + (formData.markupPercentage || 0) / 100);
  
  const laborCalculation = `Manufacturing cost: £${laborCost.toFixed(2)} for ${quantity} ${isBlind ? 'blind(s)' : 'panel(s)'}`;
  
  return {
    fabricYards: Math.ceil(totalFabricYards * 10) / 10,
    fabricCost,
    laborHours: Math.ceil((laborCost / (formData.laborRate || 45)) * 10) / 10,
    laborCost,
    featuresCost,
    subtotal,
    total,
    details: {
      fabricCalculation,
      laborCalculation,
      featureBreakdown,
      totalUnits: quantity,
      fabricPricePerYard,
      fabricWidthRequired: isBlind ? railWidth : (railWidth / quantity) * fullness * quantity,
      fabricLengthRequired: isBlind ? curtainDrop : curtainDrop + pooling + 25,
      dropsPerWidth: 1,
      widthsRequired: isBlind ? 1 : Math.ceil((railWidth * fullness) / fabricWidth)
    }
  };
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};
