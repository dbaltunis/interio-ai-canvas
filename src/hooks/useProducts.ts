import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  category_id?: string;
  category?: {
    id: string;
    name: string;
  };
  sku?: string;
  in_stock: boolean;
  stock_quantity?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Mock data store
let mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Velvet Curtains",
    description: "Luxury velvet curtains with blackout lining",
    price: 89.99,
    unit: "meter",
    category_id: "1",
    category: { id: "1", name: "Curtains" },
    sku: "VEL-001",
    in_stock: true,
    stock_quantity: 50,
    user_id: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Wooden Venetian Blinds",
    description: "Premium wooden blinds with cord control",
    price: 129.99,
    unit: "sqm",
    category_id: "2",
    category: { id: "2", name: "Blinds" },
    sku: "WVB-002",
    in_stock: true,
    stock_quantity: 30,
    user_id: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Floral Wallpaper",
    description: "Elegant floral pattern wallpaper",
    price: 45.99,
    unit: "roll",
    category_id: "3",
    category: { id: "3", name: "Wallpaper" },
    sku: "FLW-003",
    in_stock: true,
    stock_quantity: 75,
    user_id: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockProducts.sort((a, b) => a.name.localeCompare(b.name));
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        user_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockProducts.push(newProduct);
      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: 'Product created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating product', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProducts[index] = { ...mockProducts[index], ...updates, updated_at: new Date().toISOString() };
        return mockProducts[index];
      }
      throw new Error('Product not found');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: 'Product updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating product', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProducts.splice(index, 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: 'Product deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting product', description: error.message, variant: 'destructive' });
    },
  });
};