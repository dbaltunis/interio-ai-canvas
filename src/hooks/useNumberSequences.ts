import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type EntityType = 'draft' | 'quote' | 'order' | 'invoice' | 'job';

export interface NumberSequence {
  id: string;
  user_id: string;
  entity_type: EntityType;
  prefix: string;
  next_number: number;
  padding: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useNumberSequences = () => {
  return useQuery({
    queryKey: ["number-sequences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("number_sequences")
        .select("*")
        .order("entity_type");

      if (error) throw error;
      return data as NumberSequence[];
    },
  });
};

export const useCreateNumberSequence = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sequence: Omit<NumberSequence, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("number_sequences")
        .insert({
          ...sequence,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["number-sequences"] });
      toast({
        title: "Number sequence created",
        description: "Your number sequence has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create number sequence",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateNumberSequence = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NumberSequence> }) => {
      const { data, error } = await supabase
        .from("number_sequences")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["number-sequences"] });
      toast({
        title: "Number sequence updated",
        description: "Your changes have been saved",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update number sequence",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteNumberSequence = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("number_sequences")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["number-sequences"] });
      toast({
        title: "Number sequence deleted",
        description: "The number sequence has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete number sequence",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useGetNextSequenceNumber = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (entityType: EntityType) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("get_next_sequence_number", {
        p_user_id: user.id,
        p_entity_type: entityType,
      });

      if (error) throw error;
      return data as string | null;
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate number",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
