import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from '@/hooks/use-toast';

export interface ProductTemplate {
  id: string;
  name: string;
  description?: string;
  treatment_type: string;
  product_type: string;
  product_category?: string;
  calculation_method?: string;
  pricing_grid_id?: string;
  active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  components?: {
    headings?: { [key: string]: boolean };
    lining?: { [key: string]: boolean };
    hardware?: { [key: string]: boolean };
  };
  calculation_rules?: {
    labor_rate?: number;
    markup_percentage?: number;
    baseMakingCost?: number;
    baseHeightLimit?: number;
    heightSurcharge1?: number;
    selectedPricingGrid?: string;
  };
}

// Mock data store
export let mockTemplates: ProductTemplate[] = [
  {
    id: "1",
    name: "Curtains",
    description: "Standard curtain treatment",
    treatment_type: "curtains",
    product_type: "curtains",
    product_category: "soft-furnishing",
    calculation_method: "fabric-based",
    active: true,
    user_id: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    components: {
      headings: { "pencil-pleat": true, "eyelet": true },
      lining: { "standard": true, "blackout": true }
    },
    calculation_rules: {
      labor_rate: 45,
      markup_percentage: 40,
      baseMakingCost: 50,
      baseHeightLimit: 240,
      heightSurcharge1: 15
    }
  },
  {
    id: "2", 
    name: "Blinds",
    description: "Window blinds treatment",
    treatment_type: "blinds",
    product_type: "blinds",
    product_category: "hard-furnishing",
    calculation_method: "per-sqm",
    active: true,
    user_id: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    calculation_rules: {
      labor_rate: 30,
      markup_percentage: 35
    }
  },
  {
    id: "3",
    name: "Shutters", 
    description: "Window shutters treatment",
    treatment_type: "shutters",
    product_type: "shutters",
    product_category: "hard-furnishing",
    calculation_method: "per-sqm",
    active: true,
    user_id: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    calculation_rules: {
      labor_rate: 60,
      markup_percentage: 50
    }
  }
];

export const useProductTemplates = () => {
  const query = useQuery({
    queryKey: ["product-templates"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockTemplates.sort((a, b) => a.name.localeCompare(b.name));
    },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createTemplate = useMutation({
    mutationFn: async (template: Omit<ProductTemplate, "id" | "user_id" | "created_at" | "updated_at">) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newTemplate: ProductTemplate = {
        ...template,
        id: Date.now().toString(),
        user_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockTemplates.push(newTemplate);
      return newTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
      toast({ title: 'Product template created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating product template', description: error.message, variant: 'destructive' });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductTemplate> & { id: string }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockTemplates.findIndex(t => t.id === id);
      if (index !== -1) {
        mockTemplates[index] = { ...mockTemplates[index], ...updates, updated_at: new Date().toISOString() };
        return mockTemplates[index];
      }
      throw new Error('Template not found');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
      toast({ title: 'Product template updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating product template', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockTemplates.findIndex(t => t.id === id);
      if (index !== -1) {
        mockTemplates.splice(index, 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
      toast({ title: 'Product template deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting product template', description: error.message, variant: 'destructive' });
    },
  });

  return {
    ...query,
    templates: query.data || [],
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: async (id: string, data: any) => updateTemplate.mutateAsync({ id, ...data }),
    deleteTemplate: deleteTemplate.mutateAsync,
    isLoading: query.isLoading
  };
};

export const useCreateProductTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (template: Omit<ProductTemplate, "id" | "user_id" | "created_at" | "updated_at">) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newTemplate: ProductTemplate = {
        ...template,
        id: Date.now().toString(),
        user_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockTemplates.push(newTemplate);
      return newTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
      toast({ title: 'Product template created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating product template', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateProductTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductTemplate> & { id: string }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockTemplates.findIndex(t => t.id === id);
      if (index !== -1) {
        mockTemplates[index] = { ...mockTemplates[index], ...updates, updated_at: new Date().toISOString() };
        return mockTemplates[index];
      }
      throw new Error('Template not found');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
      toast({ title: 'Product template updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating product template', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteProductTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockTemplates.findIndex(t => t.id === id);
      if (index !== -1) {
        mockTemplates.splice(index, 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
      toast({ title: 'Product template deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting product template', description: error.message, variant: 'destructive' });
    },
  });
};