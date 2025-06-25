
import { TreatmentFormData, CalculationResult } from './types';

export const calculateTotalPrice = (formData: TreatmentFormData): CalculationResult => {
  const railWidth = parseFloat(formData.railWidth) || 0;
  const curtainDrop = parseFloat(formData.curtainDrop) || 0;
  const fullness = parseFloat(formData.headingFullness) || 2.5;
  const quantity = formData.quantity;
  
  if (!railWidth || !curtainDrop) {
    return {
      fabricYards: 0,
      fabricCost: 0,
      laborHours: 0,
      laborCost: 0,
      featuresCost: 0,
      subtotal: 0,
      total: 0
    };
  }

  // Calculate fabric requirements
  const fabricWidthRequired = railWidth * fullness;
  const fabricLengthRequired = curtainDrop + parseFloat(formData.curtainPooling || "0") + 20; // Add allowances
  
  // Calculate drops per width
  const fabricWidth = formData.selectedFabric?.width || parseFloat(formData.fabricWidth) || 140;
  const dropsPerWidth = Math.floor(fabricWidth / (fabricWidthRequired / quantity));
  const widthsRequired = Math.ceil(quantity / Math.max(dropsPerWidth, 1));
  
  // Total fabric needed in yards
  const totalFabricYards = (widthsRequired * fabricLengthRequired) / 91.44; // Convert cm to yards
  
  // Fabric cost
  const fabricPricePerYard = formData.selectedFabric?.pricePerYard || parseFloat(formData.fabricPricePerYard) || 0;
  const fabricCost = totalFabricYards * fabricPricePerYard;
  
  // Labor cost (based on complexity and size)
  const laborHours = Math.max(4, (railWidth * curtainDrop) / 10000); // Minimum 4 hours
  const laborCost = laborHours * formData.laborRate;
  
  // Additional features cost
  const featuresCost = formData.additionalFeatures.reduce((sum, feature) => 
    feature.selected ? sum + feature.price : sum, 0
  );
  
  // Subtotal
  const subtotal = fabricCost + laborCost + featuresCost;
  
  // Apply markup
  const total = subtotal * (1 + formData.markupPercentage / 100);
  
  return {
    fabricYards: Math.ceil(totalFabricYards * 10) / 10,
    fabricCost,
    laborHours: Math.ceil(laborHours * 10) / 10,
    laborCost,
    featuresCost,
    subtotal,
    total
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
