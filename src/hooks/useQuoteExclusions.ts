import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseQuoteExclusionsResult {
  excludedItems: string[];
  toggleExclusion: (itemId: string) => void;
  isExcluded: (itemId: string) => boolean;
  isLoading: boolean;
  excludeAll: (itemIds: string[]) => void;
  includeAll: () => void;
}

export const useQuoteExclusions = (quoteId?: string): UseQuoteExclusionsResult => {
  const queryClient = useQueryClient();
  const [localExcluded, setLocalExcluded] = useState<string[]>([]);

  // Fetch current excluded items from database
  const { data: quoteData, isLoading } = useQuery({
    queryKey: ['quote-exclusions', quoteId],
    queryFn: async () => {
      if (!quoteId) return null;
      
      const { data, error } = await supabase
        .from('quotes')
        .select('excluded_items')
        .eq('id', quoteId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!quoteId,
  });

  // Sync local state with database
  useEffect(() => {
    if (quoteData?.excluded_items) {
      setLocalExcluded(quoteData.excluded_items);
    } else {
      setLocalExcluded([]);
    }
  }, [quoteData]);

  // Mutation to save exclusions to database
  const saveExclusions = useMutation({
    mutationFn: async (excludedItems: string[]) => {
      if (!quoteId) throw new Error('No quote ID');
      
      const { error } = await supabase
        .from('quotes')
        .update({ excluded_items: excludedItems })
        .eq('id', quoteId);
      
      if (error) throw error;
      return excludedItems;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-exclusions', quoteId] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: (error) => {
      console.error('Failed to save exclusions:', error);
      toast.error('Failed to save item exclusions');
    },
  });

  // Toggle a single item's exclusion status
  const toggleExclusion = useCallback((itemId: string) => {
    setLocalExcluded(prev => {
      const newExcluded = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      
      // Debounce save to prevent rapid fire
      saveExclusions.mutate(newExcluded);
      return newExcluded;
    });
  }, [saveExclusions]);

  // Check if an item is excluded
  const isExcluded = useCallback((itemId: string) => {
    return localExcluded.includes(itemId);
  }, [localExcluded]);

  // Exclude multiple items at once
  const excludeAll = useCallback((itemIds: string[]) => {
    const newExcluded = [...new Set([...localExcluded, ...itemIds])];
    setLocalExcluded(newExcluded);
    saveExclusions.mutate(newExcluded);
  }, [localExcluded, saveExclusions]);

  // Include all items (clear exclusions)
  const includeAll = useCallback(() => {
    setLocalExcluded([]);
    saveExclusions.mutate([]);
  }, [saveExclusions]);

  return {
    excludedItems: localExcluded,
    toggleExclusion,
    isExcluded,
    isLoading,
    excludeAll,
    includeAll,
  };
};
