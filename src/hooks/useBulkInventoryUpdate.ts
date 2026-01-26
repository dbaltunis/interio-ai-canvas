import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BulkUpdateOptions {
  collection_id?: string | null;
  tags?: string[];
  addTags?: string[];
  removeTags?: string[];
  price_group?: string;
  location?: string;
  vendor_id?: string;
}

/**
 * Hook for bulk updating inventory items
 * Supports collection assignment, tag management, and other bulk operations
 */
export const useBulkInventoryUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      ids, 
      updates 
    }: { 
      ids: string[], 
      updates: BulkUpdateOptions 
    }) => {
      if (ids.length === 0) {
        throw new Error("No items selected");
      }

      // Handle tag operations specially
      if (updates.addTags || updates.removeTags) {
        // Fetch current items to get existing tags
        const { data: currentItems, error: fetchError } = await supabase
          .from('enhanced_inventory_items')
          .select('id, tags')
          .in('id', ids);
        
        if (fetchError) throw fetchError;

        // Update each item's tags
        const tagUpdatePromises = (currentItems || []).map(item => {
          let newTags = item.tags || [];
          
          if (updates.addTags) {
            newTags = [...new Set([...newTags, ...updates.addTags])];
          }
          
          if (updates.removeTags) {
            newTags = newTags.filter((t: string) => !updates.removeTags!.includes(t));
          }
          
          return supabase
            .from('enhanced_inventory_items')
            .update({ tags: newTags })
            .eq('id', item.id);
        });

        const results = await Promise.all(tagUpdatePromises);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
          throw errors[0].error;
        }
        
        return { updated: ids.length };
      }

      // For simple updates (collection_id, tags replacement, etc.)
      const updatePayload: Record<string, any> = {};
      
      if ('collection_id' in updates) {
        updatePayload.collection_id = updates.collection_id;
      }
      if ('tags' in updates) {
        updatePayload.tags = updates.tags;
      }
      if ('price_group' in updates) {
        updatePayload.price_group = updates.price_group;
      }
      if ('location' in updates) {
        updatePayload.location = updates.location;
      }
      if ('vendor_id' in updates) {
        updatePayload.vendor_id = updates.vendor_id;
      }

      if (Object.keys(updatePayload).length === 0) {
        throw new Error("No updates specified");
      }

      const { error } = await supabase
        .from('enhanced_inventory_items')
        .update(updatePayload)
        .in('id', ids);

      if (error) throw error;

      return { updated: ids.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-tags'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any) => {
      console.error('Bulk update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update items",
        variant: "destructive"
      });
    }
  });
};
