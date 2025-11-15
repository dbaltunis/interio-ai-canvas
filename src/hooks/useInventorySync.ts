import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  cost_price?: number;
  selling_price?: number;
  image_url?: string;
  unit?: string;
}

export const useInventorySync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncSubSubcategories = async (
    subcategoryId: string,
    selectedInventoryIds: string[],
    pricingMode: 'selling' | 'cost' | 'cost_with_markup',
    markupPercentage: number = 0
  ) => {
    try {
      setIsSyncing(true);

      // Fetch inventory items
      const { data: inventoryItems, error: fetchError } = await supabase
        .from('enhanced_inventory_items')
        .select('*')
        .in('id', selectedInventoryIds);

      if (fetchError) throw fetchError;

      // Create sub-subcategories from inventory items
      const subSubcategories = inventoryItems.map((item, index) => {
        let basePrice = 0;
        
        if (pricingMode === 'selling') {
          basePrice = item.selling_price || 0;
        } else if (pricingMode === 'cost') {
          basePrice = item.cost_price || 0;
        } else if (pricingMode === 'cost_with_markup') {
          basePrice = (item.cost_price || 0) * (1 + markupPercentage / 100);
        }

        return {
          subcategory_id: subcategoryId,
          name: item.name,
          description: item.description,
          base_price: basePrice,
          image_url: item.image_url,
          pricing_method: 'fixed',
          sort_order: index,
          inventory_item_id: item.id,
          synced_from_inventory: true,
          last_sync_date: new Date().toISOString(),
        };
      });

      const { error: insertError } = await supabase
        .from('_legacy_option_sub_subcategories')
        .insert(subSubcategories);

      if (insertError) throw insertError;

      await queryClient.invalidateQueries({ queryKey: ['hierarchical-options'] });

      toast({
        title: "Sync successful",
        description: `Created ${subSubcategories.length} sub-subcategories from inventory.`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncExtras = async (
    subSubcategoryId: string,
    selectedInventoryIds: string[],
    pricingMode: 'selling' | 'cost' | 'cost_with_markup',
    markupPercentage: number = 0
  ) => {
    try {
      setIsSyncing(true);

      // Fetch inventory items
      const { data: inventoryItems, error: fetchError } = await supabase
        .from('enhanced_inventory_items')
        .select('*')
        .in('id', selectedInventoryIds);

      if (fetchError) throw fetchError;

      // Create extras from inventory items
      const extras = inventoryItems.map((item, index) => {
        let basePrice = 0;
        
        if (pricingMode === 'selling') {
          basePrice = item.selling_price || 0;
        } else if (pricingMode === 'cost') {
          basePrice = item.cost_price || 0;
        } else if (pricingMode === 'cost_with_markup') {
          basePrice = (item.cost_price || 0) * (1 + markupPercentage / 100);
        }

        return {
          sub_subcategory_id: subSubcategoryId,
          name: item.name,
          description: item.description,
          base_price: basePrice,
          image_url: item.image_url,
          pricing_method: 'fixed',
          sort_order: index,
          is_required: false,
          is_default: false,
          inventory_item_id: item.id,
          synced_from_inventory: true,
          last_sync_date: new Date().toISOString(),
        };
      });

      const { error: insertError } = await supabase
        .from('_legacy_option_extras')
        .insert(extras);

      if (insertError) throw insertError;

      await queryClient.invalidateQueries({ queryKey: ['hierarchical-options'] });

      toast({
        title: "Sync successful",
        description: `Created ${extras.length} extras from inventory.`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const linkToInventory = async (
    itemId: string,
    itemType: 'subcategory' | 'sub_subcategory' | 'extra',
    inventoryItemId: string
  ) => {
    try {
      setIsSyncing(true);

      const tableName = 
        itemType === 'subcategory' ? '_legacy_option_subcategories' :
        itemType === 'sub_subcategory' ? '_legacy_option_sub_subcategories' :
        '_legacy_option_extras';

      const { error } = await supabase
        .from(tableName as any)
        .update({
          inventory_item_id: inventoryItemId,
          synced_from_inventory: true,
          last_sync_date: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['hierarchical-options'] });

      toast({
        title: "Linked successfully",
        description: "Item linked to inventory.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Link failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const unlinkFromInventory = async (
    itemId: string,
    itemType: 'subcategory' | 'sub_subcategory' | 'extra'
  ) => {
    try {
      setIsSyncing(true);

      const tableName = 
        itemType === 'subcategory' ? '_legacy_option_subcategories' :
        itemType === 'sub_subcategory' ? '_legacy_option_sub_subcategories' :
        '_legacy_option_extras';

      const { error } = await supabase
        .from(tableName as any)
        .update({
          inventory_item_id: null,
          synced_from_inventory: false,
        })
        .eq('id', itemId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['hierarchical-options'] });

      toast({
        title: "Unlinked successfully",
        description: "Item unlinked from inventory.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Unlink failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshFromInventory = async (
    itemId: string,
    itemType: 'subcategory' | 'sub_subcategory' | 'extra',
    inventoryItemId: string,
    pricingMode: 'selling' | 'cost' | 'cost_with_markup',
    markupPercentage: number = 0
  ) => {
    try {
      setIsSyncing(true);

      // Fetch inventory item
      const { data: inventoryItem, error: fetchError } = await supabase
        .from('enhanced_inventory_items')
        .select('*')
        .eq('id', inventoryItemId)
        .single();

      if (fetchError) throw fetchError;

      let basePrice = 0;
      if (pricingMode === 'selling') {
        basePrice = inventoryItem.selling_price || 0;
      } else if (pricingMode === 'cost') {
        basePrice = inventoryItem.cost_price || 0;
      } else if (pricingMode === 'cost_with_markup') {
        basePrice = (inventoryItem.cost_price || 0) * (1 + markupPercentage / 100);
      }

      const tableName = 
        itemType === 'subcategory' ? '_legacy_option_subcategories' :
        itemType === 'sub_subcategory' ? '_legacy_option_sub_subcategories' :
        '_legacy_option_extras';

      const { error } = await supabase
        .from(tableName as any)
        .update({
          name: inventoryItem.name,
          description: inventoryItem.description,
          base_price: basePrice,
          image_url: inventoryItem.image_url,
          last_sync_date: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['hierarchical-options'] });

      toast({
        title: "Refreshed successfully",
        description: "Item updated from inventory.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Refresh failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncSubSubcategories,
    syncExtras,
    linkToInventory,
    unlinkFromInventory,
    refreshFromInventory,
    isSyncing,
  };
};
