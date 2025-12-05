import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export type EntityType = 'draft' | 'quote' | 'order' | 'invoice' | 'job';

// Default labels for entity types
const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  draft: 'Draft',
  quote: 'Quote',
  order: 'Order',
  invoice: 'Invoice',
  job: 'Job',
};

// Default prefixes for entity types
const DEFAULT_PREFIXES: Record<EntityType, string> = {
  draft: 'DRAFT-',
  quote: 'QUOTE-',
  order: 'ORDER-',
  invoice: 'INV-',
  job: 'JOB-',
};

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

// Hook to get sequence label and config for a specific entity type
export const useSequenceLabel = (entityType: EntityType) => {
  const { data: sequences = [] } = useNumberSequences();
  
  const sequence = sequences.find(s => s.entity_type === entityType && s.active);
  
  const label = sequence?.prefix 
    ? `${ENTITY_TYPE_LABELS[entityType]} Number`
    : `${ENTITY_TYPE_LABELS[entityType]} Number`;
  
  const prefix = sequence?.prefix || DEFAULT_PREFIXES[entityType];
  
  return {
    label,
    prefix,
    sequence,
    hasSequence: !!sequence,
  };
};

// Hook to ensure default sequences exist for a user
export const useEnsureDefaultSequences = () => {
  const { data: sequences = [], isLoading } = useNumberSequences();
  const createSequence = useCreateNumberSequence();
  
  useEffect(() => {
    const ensureDefaults = async () => {
      if (isLoading || sequences.length > 0) return;
      
      // User has no sequences, create defaults
      const defaultSequences: Array<{
        entity_type: EntityType;
        prefix: string;
        next_number: number;
        padding: number;
        active: boolean;
      }> = [
        { entity_type: 'draft', prefix: 'DRAFT-', next_number: 1, padding: 3, active: true },
        { entity_type: 'quote', prefix: 'QUOTE-', next_number: 1, padding: 3, active: true },
        { entity_type: 'order', prefix: 'ORDER-', next_number: 1, padding: 3, active: true },
        { entity_type: 'invoice', prefix: 'INV-', next_number: 1, padding: 3, active: true },
        { entity_type: 'job', prefix: 'JOB-', next_number: 1, padding: 3, active: true },
      ];
      
      for (const seq of defaultSequences) {
        try {
          await createSequence.mutateAsync(seq);
        } catch (error) {
          // Sequence might already exist, ignore
          console.log(`Sequence ${seq.entity_type} may already exist`);
        }
      }
    };
    
    ensureDefaults();
  }, [isLoading, sequences.length]);
};
