
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Room = Tables<"rooms">;
type RoomInsert = TablesInsert<"rooms">;

export const useRooms = (projectId?: string, quoteId?: string) => {
  return useQuery({
    queryKey: ["rooms", projectId, quoteId],
    queryFn: async () => {
      if (!projectId) {
        console.log("useRooms: No projectId provided, returning empty array");
        return [];
      }
      
      console.log("Fetching rooms for project:", projectId, "quote:", quoteId);
      let query = supabase
        .from("rooms")
        .select("*")
        .eq("project_id", projectId);
      
      // Filter by quote_id if provided, otherwise show rooms without quote_id
      if (quoteId) {
        query = query.eq("quote_id", quoteId);
      } else {
        query = query.is("quote_id", null);
      }
      
      const { data, error } = await query.order("created_at");
      
      if (error) {
        console.error("Error fetching rooms:", error);
        throw error;
      }
      
      console.log("Rooms fetched successfully:", data?.length, "rooms");
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 10 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (room: Omit<RoomInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("rooms")
        .insert({ ...room, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error("Room creation error:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all room queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error) => {
      console.error("Failed to create room:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create room. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Room> & { id: string }) => {
      const { data, error } = await supabase
        .from("rooms")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all room queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
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

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({
        title: "Success",
        description: "Room deleted successfully",
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
