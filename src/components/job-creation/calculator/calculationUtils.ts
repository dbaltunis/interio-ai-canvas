
import { TreatmentFormData, CalculationResult, DetailedCalculation } from './types';

export const calculateTotalPrice = (formData: TreatmentFormData, productTemplate?: any): CalculationResult & { details: DetailedCalculation } => {
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

  // Calculate fabric requirements with proper allowances
  const headerHem = 15; // cm
  const bottomHem = 10; // cm
  const fabricLengthRequired = curtainDrop + pooling + headerHem + bottomHem; // Total drop in cm
  const fabricWidthRequired = railWidth * fullness; // Total width needed in cm
  
  // Calculate drops per fabric width
  const dropsPerWidth = Math.floor(fabricWidth / (railWidth / quantity));
  const widthsRequired = Math.ceil(quantity / Math.max(dropsPerWidth, 1));
  
  // Total fabric length in cm
  const totalFabricLengthCm = widthsRequired * fabricLengthRequired;
  
  // Convert to yards (1 yard = 91.44 cm)
  const totalFabricYards = totalFabricLengthCm / 91.44;
  
  // Fabric cost calculation
  const fabricCost = totalFabricYards * fabricPricePerYard;
  
  // Labor/manufacturing cost calculation
  let laborCost = 0;
  
  if (productTemplate?.calculation_rules) {
    const rules = productTemplate.calculation_rules;
    const baseMakingCost = parseFloat(rules.baseMakingCost) || 0;
    
    if (productTemplate.pricing_unit === 'per-linear-meter') {
      laborCost = baseMakingCost * (railWidth / 100) * quantity; // Convert cm to meters
    } else {
      laborCost = baseMakingCost * quantity;
    }
    
    // Apply height surcharges if configured
    if (rules.useHeightSurcharges) {
      const baseHeightLimit = parseFloat(rules.baseHeightLimit) || 240;
      if (curtainDrop > baseHeightLimit) {
        const heightSurcharge = parseFloat(rules.heightSurcharge1) || 0;
        laborCost += heightSurcharge * quantity;
      }
    }
  } else {
    // Fallback labor calculation
    const laborRate = formData.laborRate || 45;
    const baseHours = 2;
    const sewingHours = (railWidth * curtainDrop * fullness) / 25000;
    const totalHours = Math.max(3, baseHours + sewingHours);
    laborCost = totalHours * laborRate * quantity;
  }
  
  // Features cost calculation
  const selectedFeatures = formData.additionalFeatures?.filter(f => f.selected) || [];
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
  
  // Detailed calculations for display
  const fabricCalculation = `${railWidth}cm × ${fullness} fullness = ${fabricWidthRequired.toFixed(0)}cm width needed. ` +
    `Length: ${curtainDrop}cm + ${pooling}cm pooling + ${headerHem + bottomHem}cm allowances = ${fabricLengthRequired.toFixed(0)}cm. ` +
    `${widthsRequired} width(s) × ${fabricLengthRequired.toFixed(0)}cm = ${totalFabricLengthCm.toFixed(0)}cm = ${totalFabricYards.toFixed(2)} yards × £${fabricPricePerYard.toFixed(2)} = £${fabricCost.toFixed(2)}`;
  
  const laborCalculation = `Manufacturing cost: £${laborCost.toFixed(2)} for ${quantity} panel(s)`;
  
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
      fabricWidthRequired,
      fabricLengthRequired,
      dropsPerWidth,
      widthsRequired
    }
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};
