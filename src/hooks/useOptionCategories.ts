import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface OptionCategory {
  id: string;
  name: string;
  description?: string;
  category_type: 'heading' | 'operation' | 'material' | 'hardware' | 'lining' | 'custom';
  is_required: boolean;
  sort_order: number;
  user_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  subcategories?: OptionSubcategory[];
}

export interface OptionSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage';
  base_price: number;
  sort_order: number;
  active: boolean;
  conditions?: Record<string, any>;
  sub_subcategories?: OptionSubSubcategory[];
}

export interface OptionSubSubcategory {
  id: string;
  subcategory_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage';
  base_price: number;
  sort_order: number;
  active: boolean;
  conditions?: Record<string, any>;
  extras?: OptionExtra[];
}

export interface OptionExtra {
  id: string;
  sub_subcategory_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage' | 'per-item';
  base_price: number;
  sort_order: number;
  is_required: boolean;
  is_default: boolean;
  active: boolean;
  conditions?: Record<string, any>;
}

// Mock data with comprehensive product options
const mockOptionCategories: OptionCategory[] = [
  // Heading/Pleat Styles
  {
    id: "heading-1",
    name: "Heading Styles",
    description: "Different curtain heading and pleat options",
    category_type: "heading",
    is_required: true,
    sort_order: 1,
    user_id: "mock-user",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: [
      {
        id: "heading-pencil",
        category_id: "heading-1",
        name: "Pencil Pleat",
        description: "Classic gathered heading",
        pricing_method: "per-meter",
        base_price: 25,
        sort_order: 1,
        active: true,
        sub_subcategories: [
          {
            id: "pencil-50mm",
            subcategory_id: "heading-pencil",
            name: "50mm Pencil Pleat",
            pricing_method: "per-meter",
            base_price: 25,
            sort_order: 1,
            active: true
          },
          {
            id: "pencil-75mm",
            subcategory_id: "heading-pencil",
            name: "75mm Pencil Pleat",
            pricing_method: "per-meter",
            base_price: 30,
            sort_order: 2,
            active: true
          }
        ]
      },
      {
        id: "heading-eyelet",
        category_id: "heading-1",
        name: "Eyelet",
        description: "Ring top heading",
        pricing_method: "per-meter",
        base_price: 35,
        sort_order: 2,
        active: true,
        sub_subcategories: []
      },
      {
        id: "heading-wave",
        category_id: "heading-1",
        name: "Wave",
        description: "Modern wave heading",
        pricing_method: "per-meter",
        base_price: 45,
        sort_order: 3,
        active: true,
        sub_subcategories: []
      }
    ]
  },
  // Lining Options
  {
    id: "lining-1",
    name: "Lining Options",
    description: "Curtain lining selections",
    category_type: "lining",
    is_required: false,
    sort_order: 2,
    user_id: "mock-user",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: [
      {
        id: "lining-unlined",
        category_id: "lining-1",
        name: "Unlined",
        description: "No lining",
        pricing_method: "fixed",
        base_price: 0,
        sort_order: 1,
        active: true,
        sub_subcategories: []
      },
      {
        id: "lining-lined",
        category_id: "lining-1",
        name: "Lined",
        description: "With lining fabric",
        pricing_method: "per-meter",
        base_price: 15,
        sort_order: 2,
        active: true,
        conditions: { shows_fabric_selection: true },
        sub_subcategories: [
          {
            id: "lining-tripleweave",
            subcategory_id: "lining-lined",
            name: "Tripleweave",
            pricing_method: "per-meter",
            base_price: 15,
            sort_order: 1,
            active: true
          },
          {
            id: "lining-silicone",
            subcategory_id: "lining-lined",
            name: "Silicone",
            pricing_method: "per-meter",
            base_price: 18,
            sort_order: 2,
            active: true
          },
          {
            id: "lining-flocked",
            subcategory_id: "lining-lined",
            name: "Flocked",
            pricing_method: "per-meter",
            base_price: 20,
            sort_order: 3,
            active: true
          }
        ]
      }
    ]
  },
  // Operation/Controls
  {
    id: "operation-1",
    name: "Operation & Controls",
    description: "Manual and motorised operation options",
    category_type: "operation",
    is_required: true,
    sort_order: 3,
    user_id: "mock-user",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: [
      {
        id: "operation-manual",
        category_id: "operation-1",
        name: "Manual",
        description: "Hand operated controls",
        pricing_method: "fixed",
        base_price: 0,
        sort_order: 1,
        active: true,
        sub_subcategories: [
          {
            id: "manual-cord",
            subcategory_id: "operation-manual",
            name: "Cord Draw",
            pricing_method: "fixed",
            base_price: 0,
            sort_order: 1,
            active: true
          },
          {
            id: "manual-hand",
            subcategory_id: "operation-manual",
            name: "Hand Drawn",
            pricing_method: "fixed",
            base_price: 0,
            sort_order: 2,
            active: true
          },
          {
            id: "manual-wand",
            subcategory_id: "operation-manual",
            name: "Wand",
            pricing_method: "per-unit",
            base_price: 25,
            sort_order: 3,
            active: true
          }
        ]
      },
      {
        id: "operation-motorised",
        category_id: "operation-1",
        name: "Motorised",
        description: "Electric motor operation",
        pricing_method: "per-unit",
        base_price: 350,
        sort_order: 2,
        active: true,
        sub_subcategories: [
          {
            id: "motor-battery",
            subcategory_id: "operation-motorised",
            name: "Battery Powered",
            pricing_method: "per-unit",
            base_price: 350,
            sort_order: 1,
            active: true,
            extras: [
              {
                id: "solar-panel",
                sub_subcategory_id: "motor-battery",
                name: "Solar Panel",
                description: "Solar charging panel",
                pricing_method: "per-item",
                base_price: 150,
                sort_order: 1,
                is_required: false,
                is_default: false,
                active: true
              }
            ]
          },
          {
            id: "motor-wired",
            subcategory_id: "operation-motorised",
            name: "Wired",
            pricing_method: "per-unit",
            base_price: 320,
            sort_order: 2,
            active: true
          }
        ]
      }
    ]
  },
  // Material Options (for blinds)
  {
    id: "material-1",
    name: "Material & Slat Size",
    description: "Venetian blind materials and sizes",
    category_type: "material",
    is_required: true,
    sort_order: 4,
    user_id: "mock-user",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: [
      {
        id: "material-aluminium",
        category_id: "material-1",
        name: "Aluminium",
        description: "Lightweight aluminium slats",
        pricing_method: "per-sqm",
        base_price: 45,
        sort_order: 1,
        active: true,
        sub_subcategories: [
          {
            id: "alu-25mm",
            subcategory_id: "material-aluminium",
            name: "25mm Aluminium",
            pricing_method: "per-sqm",
            base_price: 40,
            sort_order: 1,
            active: true
          },
          {
            id: "alu-50mm",
            subcategory_id: "material-aluminium",
            name: "50mm Aluminium",
            pricing_method: "per-sqm",
            base_price: 45,
            sort_order: 2,
            active: true
          }
        ]
      },
      {
        id: "material-faux-wood",
        category_id: "material-1",
        name: "Faux Wood",
        description: "Timber look slats",
        pricing_method: "per-sqm",
        base_price: 65,
        sort_order: 2,
        active: true,
        sub_subcategories: [
          {
            id: "faux-50mm",
            subcategory_id: "material-faux-wood",
            name: "50mm Faux Wood",
            pricing_method: "per-sqm",
            base_price: 60,
            sort_order: 1,
            active: true
          },
          {
            id: "faux-60mm",
            subcategory_id: "material-faux-wood",
            name: "60mm Faux Wood",
            pricing_method: "per-sqm",
            base_price: 65,
            sort_order: 2,
            active: true
          }
        ]
      }
    ]
  }
];

export const useOptionCategories = (categoryType?: string) => {
  return useQuery({
    queryKey: ["option-categories", categoryType],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      if (categoryType) {
        return mockOptionCategories.filter(cat => cat.category_type === categoryType && cat.active);
      }
      return mockOptionCategories.filter(cat => cat.active);
    },
  });
};

export const useCreateOptionCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<OptionCategory, "id" | "created_at" | "updated_at">) => {
      const newCategory: OptionCategory = {
        ...category,
        id: `cat-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockOptionCategories.push(newCategory);
      return newCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["option-categories"] });
      toast.success("Option category created");
    },
  });
};

export const useUpdateOptionCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OptionCategory> & { id: string }) => {
      const index = mockOptionCategories.findIndex(cat => cat.id === id);
      if (index !== -1) {
        mockOptionCategories[index] = {
          ...mockOptionCategories[index],
          ...updates,
          updated_at: new Date().toISOString()
        };
        return mockOptionCategories[index];
      }
      throw new Error('Category not found');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["option-categories"] });
      toast.success("Option category updated");
    },
  });
};

export const useDeleteOptionCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const index = mockOptionCategories.findIndex(cat => cat.id === id);
      if (index !== -1) {
        mockOptionCategories[index].active = false;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["option-categories"] });
      toast.success("Option category deleted");
    },
  });
};