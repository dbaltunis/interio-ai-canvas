
// Mock service for window covering options
import type { WindowCoveringOption, HierarchicalOption } from '../types/windowCoveringOptionsTypes';

// Mock data
const mockHierarchicalOptions: HierarchicalOption[] = [
  {
    id: 'cat-1',
    name: 'Heading Options',
    description: 'Different heading styles',
    option_type: 'category',
    base_cost: 0,
    is_required: true,
    is_default: false,
    sort_order: 1,
    cost_type: 'fixed',
    pricing_method: 'fixed',
    subcategories: [
      {
        id: 'sub-1',
        name: 'Pencil Pleat',
        description: 'Classic gathered heading',
        base_price: 25,
        pricing_method: 'per-meter',
        image_url: undefined,
        sub_subcategories: []
      }
    ]
  }
];

export const fetchTraditionalOptions = async (windowCoveringId: string): Promise<WindowCoveringOption[]> => {
  console.log('fetchTraditionalOptions - Mock implementation for window covering:', windowCoveringId);
  
  return [
    {
      id: 'opt-1',
      window_covering_id: windowCoveringId,
      name: 'Standard Lining',
      description: 'Basic lining option',
      option_type: 'lining',
      base_cost: 15,
      cost_type: 'per-meter',
      is_required: false,
      is_default: true,
      sort_order: 1
    }
  ];
};

export const fetchHierarchicalOptions = async (windowCoveringId: string): Promise<HierarchicalOption[]> => {
  console.log('fetchHierarchicalOptions - Mock implementation for window covering:', windowCoveringId);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return mockHierarchicalOptions;
};
