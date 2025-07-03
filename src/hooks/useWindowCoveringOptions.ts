
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { WindowCoveringOption, HierarchicalOption } from './types/windowCoveringOptionsTypes';
import { fetchTraditionalOptions, fetchHierarchicalOptions } from './services/windowCoveringOptionsService';
import { createOption as createOptionService, updateOption as updateOptionService, deleteOption as deleteOptionService } from './services/windowCoveringOptionsCrud';

export type { WindowCoveringOption, HierarchicalOption };

export const useWindowCoveringOptions = (windowCoveringId: string | undefined | null | any) => {
  const [options, setOptions] = useState<WindowCoveringOption[]>([]);
  const [hierarchicalOptions, setHierarchicalOptions] = useState<HierarchicalOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchOptions = async () => {
    console.log('useWindowCoveringOptions - fetchOptions called with ID:', windowCoveringId);
    
    // Handle undefined, null, or object with undefined value
    const actualId = typeof windowCoveringId === 'string' ? windowCoveringId : 
                     (windowCoveringId && typeof windowCoveringId === 'object' && windowCoveringId.value !== 'undefined') ? windowCoveringId.value : null;
    
    if (!actualId || actualId === 'undefined') {
      console.log('useWindowCoveringOptions - No valid window covering ID provided');
      setOptions([]);
      setHierarchicalOptions([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('useWindowCoveringOptions - Fetching options for window covering:', actualId);
      
      // Fetch both traditional and hierarchical options
      const [traditionalOptions, hierarchicalData] = await Promise.all([
        fetchTraditionalOptions(actualId),
        fetchHierarchicalOptions(actualId)
      ]);
      
      console.log('useWindowCoveringOptions - Found traditional options:', traditionalOptions?.length || 0);
      console.log('useWindowCoveringOptions - Found hierarchical options:', hierarchicalData.length);
      
      setOptions(traditionalOptions);
      setHierarchicalOptions(hierarchicalData);
    } catch (error) {
      console.error('useWindowCoveringOptions - Error fetching options:', error);
      toast({
        title: "Error",
        description: "Failed to fetch options",
        variant: "destructive"
      });
      setOptions([]);
      setHierarchicalOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createOption = async (option: Omit<WindowCoveringOption, 'id'>) => {
    try {
      const data = await createOptionService(option);
      setOptions(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
      
      toast({
        title: "Success",
        description: "Option created successfully"
      });

      return data;
    } catch (error) {
      console.error('Error creating option:', error);
      toast({
        title: "Error",
        description: "Failed to create option",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateOption = async (id: string, updates: Partial<WindowCoveringOption>) => {
    try {
      const data = await updateOptionService(id, updates);
      setOptions(prev => 
        prev.map(opt => opt.id === id ? { ...opt, ...data } : opt)
          .sort((a, b) => a.sort_order - b.sort_order)
      );

      toast({
        title: "Success",
        description: "Option updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error updating option:', error);
      toast({
        title: "Error",
        description: "Failed to update option",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteOption = async (id: string) => {
    try {
      await deleteOptionService(id);
      setOptions(prev => prev.filter(opt => opt.id !== id));
      
      toast({
        title: "Success",
        description: "Option deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting option:', error);
      toast({
        title: "Error",
        description: "Failed to delete option",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    console.log('useWindowCoveringOptions - useEffect triggered, windowCoveringId:', windowCoveringId);
    fetchOptions();
  }, [windowCoveringId]);

  console.log('useWindowCoveringOptions - Returning:', { 
    options: options?.length || 0, 
    hierarchicalOptions: hierarchicalOptions?.length || 0,
    isLoading, 
    windowCoveringId 
  });

  return {
    options,
    hierarchicalOptions,
    isLoading,
    createOption,
    updateOption,
    deleteOption,
    refetch: fetchOptions
  };
};
