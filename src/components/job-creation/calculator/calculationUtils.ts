
import { TreatmentFormData, CalculationResult, DetailedCalculation } from './types';


export const calculateTotalPrice = (formData: TreatmentFormData, productTemplate?: any): CalculationResult & { details: DetailedCalculation } => {
  const railWidth = parseFloat(formData.railWidth) || 0;
  const curtainDrop = parseFloat(formData.curtainDrop) || 0;
  const fullness = parseFloat(formData.headingFullness) || 2.5;
  const quantity = formData.quantity;
  const pooling = parseFloat(formData.curtainPooling) || 0;
  
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

  // Calculate fabric requirements with detailed breakdown
  const fabricWidthRequired = railWidth * fullness;
  const fabricLengthRequired = curtainDrop + pooling + 20; // Add 20cm allowances (hem + heading)
  
  // Calculate drops per fabric width
  const fabricWidth = formData.selectedFabric?.width || parseFloat(formData.fabricWidth) || 140;
  const dropsPerWidth = Math.floor(fabricWidth / (fabricWidthRequired / quantity));
  const widthsRequired = Math.ceil(quantity / Math.max(dropsPerWidth, 1));
  
  // Total fabric needed in yards
  const totalFabricYards = (widthsRequired * fabricLengthRequired) / 91.44; // Convert cm to yards
  
  // Fabric cost calculation
  const fabricPricePerYard = formData.selectedFabric?.pricePerYard || parseFloat(formData.fabricPricePerYard) || 0;
  const fabricCost = totalFabricYards * fabricPricePerYard;
  
  // Apply product template making cost and calculation rules
  let makingCost = 0;
  let complexityMultiplier = 1.0;
  
  if (productTemplate?.calculation_rules) {
    const rules = productTemplate.calculation_rules;
    const baseMakingCost = parseFloat(rules.baseMakingCost) || 0;
    const baseHeightLimit = parseFloat(rules.baseHeightLimit) || 240; // cm
    
    console.log('=== MAKING COST CALCULATION ===');
    console.log('Base Making Cost:', baseMakingCost);
    console.log('Base Height Limit:', baseHeightLimit);
    console.log('Curtain Drop:', curtainDrop);
    
    // Apply base making cost per linear meter
    if (productTemplate.pricing_unit === 'per-linear-meter') {
      makingCost = (railWidth / 100) * baseMakingCost; // Convert cm to meters
      console.log('Making Cost (per linear meter):', makingCost);
    } else {
      makingCost = baseMakingCost * quantity;
      console.log('Making Cost (per unit):', makingCost);
    }
    
    // Apply height surcharges if configured
    if (rules.useHeightSurcharges && curtainDrop > baseHeightLimit) {
      const heightSurcharge1 = parseFloat(rules.heightSurcharge1) || 0;
      const heightSurcharge2 = parseFloat(rules.heightSurcharge2) || 0;
      const heightSurcharge3 = parseFloat(rules.heightSurcharge3) || 0;
      
      const range1Start = parseFloat(rules.heightRange1Start) || 240;
      const range1End = parseFloat(rules.heightRange1End) || 300;
      const range2Start = parseFloat(rules.heightRange2Start) || 300;
      const range2End = parseFloat(rules.heightRange2End) || 400;
      const range3Start = parseFloat(rules.heightRange3Start) || 400;
      
      if (curtainDrop >= range1Start && curtainDrop < range1End) {
        makingCost += heightSurcharge1;
        console.log('Applied height surcharge 1:', heightSurcharge1);
      } else if (curtainDrop >= range2Start && curtainDrop < range2End) {
        makingCost += heightSurcharge2;
        console.log('Applied height surcharge 2:', heightSurcharge2);
      } else if (curtainDrop >= range3Start) {
        makingCost += heightSurcharge3;
        console.log('Applied height surcharge 3:', heightSurcharge3);
      }
    }
    
    // Apply complexity multiplier
    if (rules.complexityMultiplier) {
      switch (rules.complexityMultiplier) {
        case 'standard':
          complexityMultiplier = 1.0;
          break;
        case 'medium':
          complexityMultiplier = 1.2;
          break;
        case 'complex':
          complexityMultiplier = 1.5;
          break;
        default:
          complexityMultiplier = parseFloat(rules.complexityMultiplier) || 1.0;
      }
      console.log('Complexity Multiplier:', complexityMultiplier);
      makingCost *= complexityMultiplier;
    }
  }
  
  // Labor cost calculation (legacy calculation for templates without making cost)
  const baseHours = 2; // Base time for setup
  const sewingHours = (railWidth * curtainDrop * fullness) / 25000; // Adjusted for complexity
  const finishingHours = quantity * 0.5; // Finishing time per panel
  const laborHours = Math.max(4, baseHours + sewingHours + finishingHours);
  const laborCost = makingCost > 0 ? makingCost : (laborHours * formData.laborRate);
  
  console.log('Final Making/Labor Cost:', laborCost);
  
  // Features cost with detailed breakdown
  const selectedFeatures = formData.additionalFeatures.filter(f => f.selected);
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
  const total = subtotal * (1 + formData.markupPercentage / 100);
  
  // Detailed calculations for display
  const fabricCalculation = `${railWidth}cm × ${fullness} fullness = ${fabricWidthRequired.toFixed(0)}cm width needed. Length: ${curtainDrop}cm + ${pooling}cm pooling + 20cm allowances = ${fabricLengthRequired.toFixed(0)}cm. Total: ${totalFabricYards.toFixed(1)} yards × £${fabricPricePerYard.toFixed(2)} = £${fabricCost.toFixed(2)}`;
  
  const laborCalculation = `Base: ${baseHours}h + Sewing: ${sewingHours.toFixed(1)}h + Finishing: ${finishingHours.toFixed(1)}h = ${laborHours.toFixed(1)}h × £${formData.laborRate}/hour = £${laborCost.toFixed(2)}`;
  
  return {
    fabricYards: Math.ceil(totalFabricYards * 10) / 10,
    fabricCost,
    laborHours: Math.ceil(laborHours * 10) / 10,
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
