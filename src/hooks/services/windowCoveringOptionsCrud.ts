
// Mock service for window covering options CRUD operations
// This replaces Supabase calls until the tables are created

import type { WindowCoveringOption } from '../types/windowCoveringOptionsTypes';

// Mock data store
let mockOptions: WindowCoveringOption[] = [];

export const createOption = async (option: Omit<WindowCoveringOption, 'id'>) => {
  // Mock authenticated user
  const mockUserId = 'mock-user-id';

  const newOption: WindowCoveringOption = {
    ...option,
    id: `mock-${Date.now()}`,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    ...updates,
    updated_at: new Date().toISOString()
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
