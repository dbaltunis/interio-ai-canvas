
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { showFriendlyError } from "@/hooks/use-friendly-toast";
import { useEffectiveAccountOwner } from "./useEffectiveAccountOwner";
import { getEffectiveOwnerForMutation } from "@/utils/getEffectiveOwnerForMutation";

export interface ServiceOption {
  id: string;
  user_id: string;
  name: string;
  price: number;
  unit: string;
  description?: string | null;
  active: boolean;
  category?: string | null;
  estimated_duration_minutes?: number | null;
  is_schedulable?: boolean;
  cost_price?: number | null;
  created_at: string;
  updated_at: string;
}

export type ServiceOptionInsert = Omit<ServiceOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Common service categories for made-to-measure blinds & curtains industry
export const SERVICE_CATEGORIES = [
  { value: 'measurement', label: 'Measurement / Survey' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'installation', label: 'Installation' },
  { value: 'removal', label: 'Removal' },
  { value: 'alteration', label: 'Alteration / Repair' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'motorisation', label: 'Motorisation Retrofit' },
  { value: 'child_safety', label: 'Child Safety Audit' },
  { value: 'other', label: 'Other' },
] as const;

export const SERVICE_UNITS = [
  { value: 'per-window', label: 'Per Window' },
  { value: 'per-room', label: 'Per Room' },
  { value: 'per-job', label: 'Per Job' },
  { value: 'per-hour', label: 'Per Hour' },
  { value: 'flat-rate', label: 'Flat Rate' },
  { value: 'per-metre', label: 'Per Metre' },
] as const;

// Schedulable categories that typically need calendar events
export const SCHEDULABLE_CATEGORIES = ['measurement', 'consultation', 'installation', 'removal'];

export const useServiceOptions = () => {
  const { effectiveOwnerId, isLoading: ownerLoading } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ['service-options', effectiveOwnerId],
    enabled: !!effectiveOwnerId && !ownerLoading,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!effectiveOwnerId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('service_options')
        .select('*')
        .eq('user_id', effectiveOwnerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useServiceOptions] Error fetching services:', error);
        throw error;
      }

      return (data || []) as ServiceOption[];
    },
  });
};

export const useActiveServiceOptions = () => {
  const { effectiveOwnerId, isLoading: ownerLoading } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ['service-options-active', effectiveOwnerId],
    enabled: !!effectiveOwnerId && !ownerLoading,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!effectiveOwnerId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('service_options')
        .select('*')
        .eq('user_id', effectiveOwnerId)
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('[useServiceOptions] Error fetching active services:', error);
        throw error;
      }

      return (data || []) as ServiceOption[];
    },
  });
};

export const useCreateServiceOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (option: Omit<ServiceOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { effectiveOwnerId } = await getEffectiveOwnerForMutation();

      const insertData: Record<string, any> = {
        name: option.name,
        price: option.price || 0,
        unit: option.unit || 'per-window',
        description: option.description || null,
        active: option.active !== false,
        user_id: effectiveOwnerId,
        category: option.category || 'other',
        estimated_duration_minutes: option.estimated_duration_minutes || null,
        is_schedulable: option.is_schedulable || false,
        cost_price: option.cost_price || null,
      };

      const { data, error } = await supabase
        .from('service_options')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[useCreateServiceOption] Error:', error);
        throw error;
      }
      return data as ServiceOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-options'] });
      queryClient.invalidateQueries({ queryKey: ['service-options-active'] });
      // No success toast - UI updates visually
    },
    onError: (error) => {
      showFriendlyError(error, 'create service');
    },
  });
};

export const useUpdateServiceOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (option: Partial<ServiceOption> & { id: string }) => {
      const { id, user_id, created_at, updated_at, ...updates } = option;

      const { data, error } = await supabase
        .from('service_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[useUpdateServiceOption] Error:', error);
        throw error;
      }
      return data as ServiceOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-options'] });
      queryClient.invalidateQueries({ queryKey: ['service-options-active'] });
      // No success toast - UI updates visually
    },
    onError: (error) => {
      showFriendlyError(error, 'update service');
    },
  });
};

export const useDeleteServiceOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_options')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[useDeleteServiceOption] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-options'] });
      queryClient.invalidateQueries({ queryKey: ['service-options-active'] });
      // No success toast - UI updates visually
    },
    onError: (error) => {
      showFriendlyError(error, 'delete service');
    },
  });
};
