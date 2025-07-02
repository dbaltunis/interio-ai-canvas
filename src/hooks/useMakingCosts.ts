import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useMakingCosts = () => {
  const [makingCosts, setMakingCosts] = useState<MakingCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMakingCosts = async () => {
    try {
      const { data, error } = await supabase
        .from('making_costs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMakingCosts(data || []);
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
      const { data, error } = await supabase
        .from('making_costs')
        .insert([costData])
        .select()
        .single();

      if (error) throw error;

      setMakingCosts(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Making cost configuration created successfully"
      });

      return data;
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
      const { data, error } = await supabase
        .from('making_costs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMakingCosts(prev => 
        prev.map(cost => cost.id === id ? { ...cost, ...data } : cost)
      );

      toast({
        title: "Success",
        description: "Making cost configuration updated successfully"
      });

      return data;
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