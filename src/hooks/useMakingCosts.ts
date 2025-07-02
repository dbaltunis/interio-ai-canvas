import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export interface MakingCostOption {
  name: string;
  pricing_method: string;
  base_price: number;
  fullness?: number;
  sort_order: number;
}

export interface MakingCost {
  id: string;
  name: string;
  pricing_method: string;
  include_fabric_selection: boolean;
  measurement_type: string;
  heading_options: MakingCostOption[];
  hardware_options: MakingCostOption[];
  lining_options: MakingCostOption[];
  drop_ranges: Array<{
    min: number;
    max: number;
    price: number;
  }>;
  description?: string;
  active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

type MakingCostRow = Database['public']['Tables']['making_costs']['Row'];
type MakingCostInsert = Database['public']['Tables']['making_costs']['Insert'];
type MakingCostUpdate = Database['public']['Tables']['making_costs']['Update'];

export const useMakingCosts = () => {
  const [makingCosts, setMakingCosts] = useState<MakingCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const transformRow = (row: MakingCostRow): MakingCost => ({
    id: row.id,
    name: row.name,
    pricing_method: row.pricing_method,
    include_fabric_selection: row.include_fabric_selection || false,
    measurement_type: row.measurement_type,
    heading_options: (row.heading_options as unknown as MakingCostOption[]) || [],
    hardware_options: (row.hardware_options as unknown as MakingCostOption[]) || [],
    lining_options: (row.lining_options as unknown as MakingCostOption[]) || [],
    drop_ranges: (row.drop_ranges as unknown as Array<{min: number; max: number; price: number}>) || [],
    description: row.description || '',
    active: row.active || false,
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at
  });

  const fetchMakingCosts = async () => {
    try {
      const { data, error } = await supabase
        .from('making_costs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMakingCosts((data || []).map(transformRow));
    } catch (error) {
      console.error('Error fetching making costs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch making costs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMakingCost = async (costData: Omit<MakingCost, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const insertData: MakingCostInsert = {
        name: costData.name,
        pricing_method: costData.pricing_method,
        include_fabric_selection: costData.include_fabric_selection,
        measurement_type: costData.measurement_type,
        heading_options: costData.heading_options as any,
        hardware_options: costData.hardware_options as any,
        lining_options: costData.lining_options as any,
        drop_ranges: costData.drop_ranges as any,
        description: costData.description,
        active: costData.active,
        user_id: '' // Will be overridden by RLS to auth.uid()
      };

      const { data, error } = await supabase
        .from('making_costs')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      const transformedData = transformRow(data);
      setMakingCosts(prev => [transformedData, ...prev]);
      toast({
        title: "Success",
        description: "Making cost configuration created successfully"
      });

      return transformedData;
    } catch (error) {
      console.error('Error creating making cost:', error);
      toast({
        title: "Error",
        description: "Failed to create making cost configuration",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateMakingCost = async (id: string, updates: Partial<MakingCost>) => {
    try {
      const updateData: MakingCostUpdate = {
        name: updates.name,
        pricing_method: updates.pricing_method,
        include_fabric_selection: updates.include_fabric_selection,
        measurement_type: updates.measurement_type,
        heading_options: updates.heading_options as any,
        hardware_options: updates.hardware_options as any,
        lining_options: updates.lining_options as any,
        drop_ranges: updates.drop_ranges as any,
        description: updates.description,
        active: updates.active
      };

      const { data, error } = await supabase
        .from('making_costs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const transformedData = transformRow(data);
      setMakingCosts(prev => 
        prev.map(cost => cost.id === id ? transformedData : cost)
      );

      toast({
        title: "Success",
        description: "Making cost configuration updated successfully"
      });

      return transformedData;
    } catch (error) {
      console.error('Error updating making cost:', error);
      toast({
        title: "Error",
        description: "Failed to update making cost configuration",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteMakingCost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('making_costs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMakingCosts(prev => prev.filter(cost => cost.id !== id));
      
      toast({
        title: "Success",
        description: "Making cost configuration deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting making cost:', error);
      toast({
        title: "Error",
        description: "Failed to delete making cost configuration",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMakingCosts();
  }, []);

  return {
    makingCosts,
    isLoading,
    createMakingCost,
    updateMakingCost,
    deleteMakingCost,
    refetch: fetchMakingCosts
  };
};