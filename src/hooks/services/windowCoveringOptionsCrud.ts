
// Mock service for window covering options CRUD operations
import type { WindowCoveringOption } from '../types/windowCoveringOptionsTypes';

// Mock data store
let mockOptions: WindowCoveringOption[] = [];

export const createOption = async (option: Omit<WindowCoveringOption, 'id'>) => {
  const newOption: WindowCoveringOption = {
    ...option,
    id: `mock-${Date.now()}`,
    base_cost: option.base_price, // Ensure compatibility
    sort_order: option.sort_order || 0
  };

  mockOptions.push(newOption);
  return newOption;
};

export const updateOption = async (id: string, updates: Partial<WindowCoveringOption>) => {
  const index = mockOptions.findIndex(opt => opt.id === id);
  if (index === -1) {
    throw new Error('Option not found');
  }

  const updatedOption = {
    ...mockOptions[index],
    ...updates
  };

  mockOptions[index] = updatedOption;
  return updatedOption;
};

export const deleteOption = async (id: string) => {
  const index = mockOptions.findIndex(opt => opt.id === id);
  if (index === -1) {
    throw new Error('Option not found');
  }

  mockOptions.splice(index, 1);
};

export const fetchOptions = async (windowCoveringId: string) => {
  return mockOptions.filter(opt => opt.window_covering_id === windowCoveringId);
};
