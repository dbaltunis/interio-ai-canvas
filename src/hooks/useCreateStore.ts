import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StoreTemplate } from "@/types/online-store";

interface CreateStoreParams {
  storeName: string;
  templateId: string;
  template: StoreTemplate;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
};

export const useCreateStore = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeName, templateId, template }: CreateStoreParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get business settings for auto-population
      const { data: businessSettings } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const slug = generateSlug(storeName);
      const colors = template.template_config.colors;

      // Create the store
      const { data: store, error: storeError } = await supabase
        .from('online_stores')
        .insert({
          user_id: user.id,
          store_name: storeName,
          store_slug: slug,
          template_id: templateId,
          primary_color: colors.primary,
          secondary_color: colors.secondary,
          accent_color: colors.accent,
          font_family: template.template_config.fonts.heading,
          logo_url: businessSettings?.company_logo_url,
          seo_title: `${storeName} - ${businessSettings?.company_name || 'Window Treatments'}`,
          seo_description: `Explore custom window treatments from ${storeName}`,
        })
        .select()
        .single();

      if (storeError) throw storeError;

      // Create default pages from template
      const pages = template.template_config.defaultPages.map((page: any) => ({
        store_id: store.id,
        page_type: page.type,
        title: page.title,
        slug: page.slug,
        content: page.sections || [],
        sort_order: 0,
      }));

      const { error: pagesError } = await supabase
        .from('store_pages')
        .insert(pages);

      if (pagesError) throw pagesError;

      // Get user's inventory items and auto-add visible products
      const { data: inventoryItems } = await supabase
        .from('enhanced_inventory_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)
        .limit(20);

      if (inventoryItems && inventoryItems.length > 0) {
        const productMappings = inventoryItems.map((item, index) => ({
          store_id: store.id,
          inventory_item_id: item.id,
          is_visible: true,
          is_featured: index < 3, // First 3 products are featured
          sort_order: index,
        }));

        await supabase
          .from('store_product_visibility')
          .insert(productMappings);
      }

      return store;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-store'] });
      toast({
        title: "Store created!",
        description: "Your online store is ready to customize.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create store",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
