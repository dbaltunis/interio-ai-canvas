
// This service has been deprecated and replaced by the new Product Configuration system
// Please use the components in src/components/settings/tabs/product-configuration/

export interface FabricCalculationParams {
  windowCoveringId: string;
  makingCostId: string;
  measurements: {
    railWidth: number;
    drop: number;
    pooling: number;
  };
  selectedOptions: string[];
  fabricDetails: {
    fabricWidth: number;
    fabricCostPerYard: number;
    rollDirection: 'horizontal' | 'vertical';
  };
}

export const calculateIntegratedFabricUsage = async (params: FabricCalculationParams) => {
  console.warn('Making Cost Integration Service has been deprecated. Please use the new Product Configuration system.');
  
  // Return a mock response for compatibility
  return {
    fabricUsage: {
      yards: 0,
      meters: 0,
      orientation: 'vertical',
      seamsRequired: 0,
      seamLaborHours: 0,
      widthsRequired: 1
    },
    costs: {
      fabricCost: 0,
      makingCost: 0,
      additionalOptionsCost: 0,
      laborCost: 0,
      totalCost: 0
    },
    breakdown: {
      makingCostOptions: [],
      additionalOptions: []
    },
    warnings: ['This calculation service has been deprecated. Please use the new Product Configuration system.']
  };
};

export const deprecatedIntegrationService = () => {
  console.warn('Making Cost Integration Service has been deprecated. Please use the new Product Configuration system.');
};
