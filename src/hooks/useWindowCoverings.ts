
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WindowCovering {
  id: string;
  name: string;
  category: string;
  description?: string;
  base_price?: number;
  user_id: string;
  active?: boolean;
  created_at: string;
  updated_at: string;
}

export const useWindowCoverings = () => {
  return useQuery({
    queryKey: ["window-coverings"],
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent redundant fetches
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    queryFn: async () => {
      const { data, error } = await supabase
        .from("window_coverings")
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateWindowCovering = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<WindowCovering, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("window_coverings")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["window-coverings"] });
      toast({
        title: "Success",
        description: "Window covering created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create window covering",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateWindowCovering = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<WindowCovering> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("window_coverings")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["window-coverings"] });
      toast({
        title: "Success",
        description: "Window covering updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update window covering",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteWindowCovering = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("window_coverings")
        .update({ active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["window-coverings"] });
      toast({
        title: "Success",
        description: "Window covering deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete window covering",
        variant: "destructive",
      });
    },
  });
};
