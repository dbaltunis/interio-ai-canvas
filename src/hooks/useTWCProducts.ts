import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TWCProduct {
  itemNumber: string;
  description: string;
  questions?: TWCQuestion[];
  fabricsAndColours?: {
    itemName?: string;
    itemNumber?: string;
    itemMaterials?: Array<{
      material: string;
      colours: Array<{
        colour: string;
        pricingGroup: string | null;
      }>;
    }>;
  };
}

export interface TWCQuestion {
  question: string;
  questionType: string;
  answers: string[];
}

export interface TWCFabricColor {
  fabricOrColourName: string;
  fabricOrColourCode?: string;
}

export const useTWCProducts = () => {
  return useQuery({
    queryKey: ["twc-products"],
    queryFn: async () => {
      // Verify user is authenticated before making API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Please log in to access TWC products");
      }

      const { data, error } = await supabase.functions.invoke("twc-get-order-options", {
        body: {}, // Send empty body to fetch all products
      });

      if (error) throw error;
      
      if (!data?.success || !data?.data) {
        throw new Error("Failed to fetch TWC products");
      }

      // The response structure is: { success: true, data: { data: [...] } }
      const productsData = data.data?.data;
      
      if (Array.isArray(productsData)) {
        return productsData as TWCProduct[];
      }
      
      console.warn('Unexpected TWC products data structure:', data);
      return [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1, // Don't retry auth failures multiple times
  });
};

export const useTWCImportedProducts = () => {
  return useQuery({
    queryKey: ["twc-imported-products"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please log in to view imported products");

      // Get only parent TWC products (those with twc_questions in metadata)
      const { data: items, error: itemsError } = await supabase
        .from("enhanced_inventory_items")
        .select("*")
        .eq("supplier", "TWC")
        .not("metadata->twc_questions", "is", null)
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;

      // Get templates for these items - match by inventory_item_id for accuracy
      const itemIds = items?.map(i => i.id) || [];
      const { data: templates, error: templatesError } = await supabase
        .from("curtain_templates")
        .select("id, name, pricing_grid_data, description, inventory_item_id")
        .or(`inventory_item_id.in.(${itemIds.join(',')}),description.ilike.%TWC%`);

      if (templatesError) console.warn("Could not fetch templates:", templatesError);

      // Merge templates into items - prioritize inventory_item_id match, fallback to name
      const enrichedItems = items?.map(item => ({
        ...item,
        templates: templates?.filter(t => 
          t.inventory_item_id === item.id ||
          t.name === item.name || 
          t.description?.includes(item.name)
        ) || []
      })) || [];

      return enrichedItems;
    },
    staleTime: 10 * 1000,
  });
};

export const useImportTWCProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selectedProducts: TWCProduct[]) => {
      // First, ensure TWC exists as a vendor
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if TWC vendor already exists
      const { data: existingVendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'The Wholesale Company (TWC)')
        .maybeSingle();

      // Create TWC vendor if it doesn't exist
      if (!existingVendor) {
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert({
            user_id: user.id,
            name: 'The Wholesale Company (TWC)',
            contact_person: 'TWC Support',
            email: 'support@twc.com',
            notes: 'Auto-created during TWC product import',
            active: true
          });

        if (vendorError) {
          console.error('Failed to create TWC vendor:', vendorError);
          // Continue anyway - vendor is optional for import
        } else {
          console.log('✅ Created TWC vendor');
        }
      }

      // Now sync the products
      const { data, error } = await supabase.functions.invoke("twc-sync-products", {
        body: { products: selectedProducts },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["twc-imported-products"] });
      queryClient.invalidateQueries({ queryKey: ["curtain-templates"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] }); // Also refresh vendors list
      
      const summary = [
        `✓ ${data.imported} product${data.imported !== 1 ? 's' : ''} added to Inventory`,
        data.templates_created > 0 
          ? `✓ ${data.templates_created} template${data.templates_created !== 1 ? 's' : ''} created`
          : '⚠️ No templates created (check logs)',
        data.materials_created > 0 
          ? `✓ ${data.materials_created} material variant${data.materials_created !== 1 ? 's' : ''} added`
          : null,
        '\n📍 View imported products in "My TWC Products" section above',
      ].filter(Boolean).join('\n');

      toast.success('TWC Import Complete', {
        description: summary,
        duration: 8000,
      });
    },
    onError: (error) => {
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error('Import Failed', {
        description: `Could not import TWC products: ${errorMessage}`,
        duration: 6000,
      });
    },
  });
};

export const useResyncTWCProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke("twc-resync-products", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Re-sync failed");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["treatment-options"] });
      queryClient.invalidateQueries({ queryKey: ["twc-imported-products"] });
      queryClient.invalidateQueries({ queryKey: ["option-values"] });
      queryClient.invalidateQueries({ queryKey: ["template-option-settings"] });
      
      const parts: string[] = [];
      if (data.options_created > 0) {
        parts.push(`${data.options_created} options created`);
      }
      if (data.values_created > 0) {
        parts.push(`${data.values_created} values`);
      }
      if (data.template_settings_created > 0) {
        parts.push(`enabled for ${data.template_settings_created} templates`);
      }
      if (data.options_skipped > 0 && parts.length === 0) {
        parts.push(`${data.options_skipped} options already exist`);
      }
      
      const summary = parts.join(', ') || 'Options synced successfully';

      toast.success('TWC Options Synced', {
        description: summary,
        duration: 5000,
      });
    },
    onError: (error) => {
      toast.error('Re-sync Failed', {
        description: error.message || 'Could not re-sync TWC options',
        duration: 5000,
      });
    },
  });
};

export const useDeleteTWCProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Use cascade delete edge function to remove all related data
      const { data, error } = await supabase.functions.invoke("twc-delete-product", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { productId }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Delete failed");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['twc-imported-products'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['curtain-templates'] });
      queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['template-option-settings'] });
      
      const deleted = data.deleted;
      const parts = [`Product "${deleted.product}" deleted`];
      if (deleted.templates > 0) parts.push(`${deleted.templates} templates`);
      if (deleted.options > 0) parts.push(`${deleted.options} options`);
      if (deleted.materials > 0) parts.push(`${deleted.materials} materials`);
      
      toast.success('TWC Product Cascade Deleted', {
        description: parts.join(', '),
        duration: 5000
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    }
  });
};

export const useUpdateExistingTWCProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke("twc-update-existing", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Update failed");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["twc-imported-products"] });
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      
      const summary = data.items_updated > 0
        ? `Updated ${data.items_updated} products with ${data.colors_extracted} colors`
        : `All ${data.items_found} products already up to date`;

      toast.success('TWC Products Updated', {
        description: summary,
        duration: 5000,
      });
    },
    onError: (error) => {
      toast.error('Update Failed', {
        description: error.message || 'Could not update TWC products',
        duration: 5000,
      });
    },
  });
};

/**
 * Phase 4: Delete ALL TWC data for the current account
 * This is a comprehensive cleanup function that removes all orphaned data
 */
export const useDeleteAllTWCData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke("twc-delete-all-data", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Delete all failed");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['twc-imported-products'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['curtain-templates'] });
      queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['template-option-settings'] });
      queryClient.invalidateQueries({ queryKey: ['option-values'] });
      
      const deleted = data.deleted;
      const parts = ['All TWC data deleted:'];
      if (deleted.products > 0) parts.push(`${deleted.products} products`);
      if (deleted.materials > 0) parts.push(`${deleted.materials} materials`);
      if (deleted.templates > 0) parts.push(`${deleted.templates} templates`);
      if (deleted.options > 0) parts.push(`${deleted.options} options`);
      if (deleted.option_values > 0) parts.push(`${deleted.option_values} values`);
      if (deleted.template_settings > 0) parts.push(`${deleted.template_settings} settings`);
      
      toast.success('TWC Data Cleared', {
        description: parts.join(', '),
        duration: 6000
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete TWC data: ${error.message}`);
    }
  });
};
