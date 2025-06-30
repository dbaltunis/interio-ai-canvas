
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WindowCovering {
  id: string;
  name: string;
  description?: string;
  margin_percentage: number;
  fabrication_pricing_method?: 'per-panel' | 'per-drop' | 'per-meter' | 'per-yard' | 'pricing-grid';
  image_url?: string;
  active: boolean;
  unit_price?: number;
  pricing_grid_data?: string;
  optionsCount?: number;
}

export const useWindowCoverings = () => {
  const [windowCoverings, setWindowCoverings] = useState<WindowCovering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWindowCoverings = async () => {
    try {
      const { data, error } = await supabase
        .from('window_coverings')
        .select(`
          id,
          name,
          description,
          margin_percentage,
          fabrication_pricing_method,
          image_url,
          active,
          unit_price,
          pricing_grid_data
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get options count for each window covering
      const windowCoveringsWithCounts = await Promise.all(
        (data || []).map(async (wc) => {
          const { count } = await supabase
            .from('window_covering_options')
            .select('*', { count: 'exact', head: true })
            .eq('window_covering_id', wc.id);

          return {
            ...wc,
            optionsCount: count || 0
          };
        })
      );

      setWindowCoverings(windowCoveringsWithCounts);
    } catch (error) {
      console.error('Error fetching window coverings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch window coverings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createWindowCovering = async (windowCovering: Omit<WindowCovering, 'id' | 'optionsCount'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('window_coverings')
        .insert([
          {
            ...windowCovering,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newWindowCovering = { ...data, optionsCount: 0 };
      setWindowCoverings(prev => [newWindowCovering, ...prev]);
      
      toast({
        title: "Success",
        description: "Window covering created successfully"
      });

      return newWindowCovering;
    } catch (error) {
      console.error('Error creating window covering:', error);
      toast({
        title: "Error",
        description: "Failed to create window covering",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateWindowCovering = async (id: string, updates: Partial<WindowCovering>) => {
    try {
      const { data, error } = await supabase
        .from('window_coverings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWindowCoverings(prev => 
        prev.map(wc => wc.id === id ? { ...wc, ...data } : wc)
      );

      toast({
        title: "Success",
        description: "Window covering updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error updating window covering:', error);
      toast({
        title: "Error",
        description: "Failed to update window covering",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteWindowCovering = async (id: string) => {
    try {
      const { error } = await supabase
        .from('window_coverings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWindowCoverings(prev => prev.filter(wc => wc.id !== id));
      
      toast({
        title: "Success",
        description: "Window covering deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting window covering:', error);
      toast({
        title: "Error",
        description: "Failed to delete window covering",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchWindowCoverings();
  }, []);

  return {
    windowCoverings,
    isLoading,
    createWindowCovering,
    updateWindowCovering,
    deleteWindowCovering,
    refetch: fetchWindowCoverings
  };
};
