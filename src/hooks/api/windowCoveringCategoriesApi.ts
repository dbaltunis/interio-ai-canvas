
import type { WindowCoveringOptionCategory } from "@/types/database";

// Mock API functions since tables don't exist yet
export const fetchWindowCoveringCategories = async (): Promise<WindowCoveringOptionCategory[]> => {
  // Return empty array for now
  return [];
};

export const createWindowCoveringCategory = async (categoryData: any): Promise<WindowCoveringOptionCategory> => {
  // Mock creation
  const mockCategory: WindowCoveringOptionCategory = {
    id: 'mock-id',
    user_id: 'mock-user',
    name: categoryData.name,
    description: categoryData.description,
    is_required: categoryData.is_required || false,
    image_url: categoryData.image_url,
    subcategories: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  return mockCategory;
};

export const updateWindowCoveringCategory = async (id: string, categoryData: any): Promise<WindowCoveringOptionCategory> => {
  // Mock update
  const mockCategory: WindowCoveringOptionCategory = {
    id,
    user_id: 'mock-user',
    name: categoryData.name,
    description: categoryData.description,
    is_required: categoryData.is_required || false,
    image_url: categoryData.image_url,
    subcategories: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  return mockCategory;
};

export const deleteWindowCoveringCategory = async (id: string): Promise<void> => {
  // Mock deletion
  console.log('Mock deleting category:', id);
};
