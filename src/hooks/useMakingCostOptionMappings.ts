import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MakingCostOptionMapping {
  id: string;
  making_cost_id: string;
  option_category_id: string;
  option_type: 'heading' | 'hardware' | 'lining';
  is_included: boolean;
  override_pricing?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  option_category?: {
    id: string;
    name: string;
    description?: string;
    calculation_method?: string;
    affects_fabric_calculation?: boolean;
    affects_labor_calculation?: boolean;
    fabric_waste_factor?: number;
    pattern_repeat_factor?: number;
    seam_complexity_factor?: number;
  };
}

export const useMakingCostOptionMappings = (makingCostId?: string) => {
  const [mappings, setMappings] = useState<MakingCostOptionMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMappings = async () => {
    if (!makingCostId) {
      setMappings([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('making_cost_option_mappings')
        .select(`
          *,
          window_covering_option_categories (
            id,
            name,
            description,
            calculation_method,
            affects_fabric_calculation,
            affects_labor_calculation,
            fabric_waste_factor,
            pattern_repeat_factor,
            seam_complexity_factor
          )
        `)
        .eq('making_cost_id', makingCostId)
        .order('option_type', { ascending: true });

      if (error) throw error;

      const transformedData = (data || []).map(item => ({
        ...item,
        option_type: item.option_type as 'heading' | 'hardware' | 'lining',
        option_category: item.window_covering_option_categories
      }));
      setMappings(transformedData);
    } catch (error) {
      console.error('Error fetching making cost option mappings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch making cost option mappings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMapping = async (mapping: Omit<MakingCostOptionMapping, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('making_cost_option_mappings')
        .insert([{
          ...mapping,
          user_id: user.id
        }])
        .select(`
          *,
          window_covering_option_categories (
            id,
            name,
            description,
            calculation_method,
            affects_fabric_calculation,
            affects_labor_calculation,
            fabric_waste_factor,
            pattern_repeat_factor,
            seam_complexity_factor
          )
        `)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        option_type: data.option_type as 'heading' | 'hardware' | 'lining',
        option_category: data.window_covering_option_categories
      };
      setMappings(prev => [...prev, transformedData]);
      
      toast({
        title: "Success",
        description: "Option mapping created successfully"
      });

      return data;
    } catch (error) {
      console.error('Error creating mapping:', error);
      toast({
        title: "Error",
        description: "Failed to create option mapping",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateMapping = async (id: string, updates: Partial<MakingCostOptionMapping>) => {
    try {
      const { data, error } = await supabase
        .from('making_cost_option_mappings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          window_covering_option_categories (
            id,
            name,
            description,
            calculation_method,
            affects_fabric_calculation,
            affects_labor_calculation,
            fabric_waste_factor,
            pattern_repeat_factor,
            seam_complexity_factor
          )
        `)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        option_type: data.option_type as 'heading' | 'hardware' | 'lining',
        option_category: data.window_covering_option_categories
      };
      setMappings(prev => 
        prev.map(mapping => mapping.id === id ? transformedData : mapping)
      );

      toast({
        title: "Success",
        description: "Option mapping updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error updating mapping:', error);
      toast({
        title: "Error",
        description: "Failed to update option mapping",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteMapping = async (id: string) => {
    try {
      const { error } = await supabase
        .from('making_cost_option_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMappings(prev => prev.filter(mapping => mapping.id !== id));
      
      toast({
        title: "Success",
        description: "Option mapping deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast({
        title: "Error",
        description: "Failed to delete option mapping",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [makingCostId]);

  return {
    mappings,
    isLoading,
    createMapping,
    updateMapping,
    deleteMapping,
    refetch: fetchMappings
  };
};