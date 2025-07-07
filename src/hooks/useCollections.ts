
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      // For now, return mock data until the collections table is properly synced
      return [
        {
          id: "1",
          name: "Spring Collection 2024",
          description: "Fresh spring fabrics and colors",
          season: "Spring",
          year: 2024,
          vendor: { name: "Premium Textiles", email: "contact@premiumtextiles.com" },
          tags: ["spring", "light", "natural"],
          active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: "2", 
          name: "Luxury Velvet Series",
          description: "High-end velvet collection",
          season: "All Season",
          year: 2024,
          vendor: { name: "Velvet Specialists", email: "info@velvetspec.com" },
          tags: ["luxury", "velvet", "premium"],
          active: true,
          created_at: new Date().toISOString(),
        }
      ];
    },
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collection: any) => {
      // Mock implementation for now
      const newCollection = {
        id: Date.now().toString(),
        ...collection,
        created_at: new Date().toISOString(),
      };
      return newCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...collection }: any) => {
      // Mock implementation for now
      return { id, ...collection };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation for now
      console.log("Deleting collection:", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};
