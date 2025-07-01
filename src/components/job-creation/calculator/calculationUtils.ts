
import { TreatmentFormData, CalculationResult, DetailedCalculation } from './types';


export const calculateTotalPrice = (formData: TreatmentFormData): CalculationResult & { details: DetailedCalculation } => {
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
  
  // Labor cost calculation based on complexity
  const baseHours = 2; // Base time for setup
  const sewingHours = (railWidth * curtainDrop * fullness) / 25000; // Adjusted for complexity
  const finishingHours = quantity * 0.5; // Finishing time per panel
  const laborHours = Math.max(4, baseHours + sewingHours + finishingHours);
  const laborCost = laborHours * formData.laborRate;
  
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
