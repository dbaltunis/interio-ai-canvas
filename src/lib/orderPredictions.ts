import { SupplierLeadTime } from "@/hooks/useOrderTracking";

export interface LeadTimePrediction {
  estimatedDays: number;
  confidence: 'low' | 'medium' | 'high';
  range: [number, number];
  historicalAverage?: number;
  sampleSize: number;
  note?: string;
}

export const predictLeadTime = (
  supplierId: string,
  materialType: string,
  historicalData: SupplierLeadTime[]
): LeadTimePrediction => {
  // Filter relevant historical orders
  const relevantOrders = historicalData.filter(
    order => 
      order.supplier_id === supplierId &&
      order.material_type === materialType
  );
  
  if (relevantOrders.length < 3) {
    return {
      estimatedDays: 7, // Default
      confidence: 'low',
      range: [5, 10],
      sampleSize: relevantOrders.length,
      note: 'Not enough historical data for accurate prediction. Using default estimate.',
    };
  }
  
  // Calculate average
  const totalDays = relevantOrders.reduce(
    (sum, order) => sum + order.lead_time_days, 0
  );
  const avgDays = Math.round(totalDays / relevantOrders.length);
  
  // Calculate standard deviation
  const variance = relevantOrders.reduce(
    (sum, order) => sum + Math.pow(order.lead_time_days - avgDays, 2), 0
  ) / relevantOrders.length;
  const stdDev = Math.sqrt(variance);
  
  // Determine confidence based on sample size and consistency
  let confidence: 'low' | 'medium' | 'high';
  if (relevantOrders.length >= 10 && stdDev < 2) {
    confidence = 'high';
  } else if (relevantOrders.length >= 5 && stdDev < 3) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }
  
  return {
    estimatedDays: avgDays,
    confidence,
    range: [
      Math.max(1, avgDays - Math.ceil(stdDev)),
      avgDays + Math.ceil(stdDev)
    ] as [number, number],
    historicalAverage: avgDays,
    sampleSize: relevantOrders.length,
  };
};

export const calculateExpectedDeliveryDate = (
  orderDate: Date,
  estimatedDays: number
): Date => {
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
  return deliveryDate;
};

export const getConfidenceColor = (confidence: 'low' | 'medium' | 'high'): string => {
  switch (confidence) {
    case 'high': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-orange-600';
  }
};

export const getConfidenceLabel = (confidence: 'low' | 'medium' | 'high'): string => {
  switch (confidence) {
    case 'high': return 'High confidence';
    case 'medium': return 'Medium confidence';
    case 'low': return 'Low confidence';
  }
};
