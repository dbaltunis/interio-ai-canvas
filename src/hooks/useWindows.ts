import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Window = Tables<"windows">;
type WindowInsert = TablesInsert<"windows">;

export const useWindows = (projectId?: string) => {
  return useQuery({
    queryKey: ["windows", projectId],
    queryFn: async () => {
      if (!projectId) {
        // Fetch all windows for the user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
          .from("windows")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at");
        
        if (error) throw error;
        return data;
      }
      
      const { data, error } = await supabase
        .from("windows")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateWindow = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (window: Omit<WindowInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("windows")
        .insert({ ...window, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["windows"] });
      toast({
        title: "Success",
        description: "Window created successfully",
      });
    },
    onError: (error) => {
      console.error("Create window error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateWindow = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Window> & { id: string }) => {
      const { data, error } = await supabase
        .from("windows")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["windows", data.room_id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteWindow = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("windows")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["windows"] });
      toast({
        title: "Success",
        description: "Window deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
