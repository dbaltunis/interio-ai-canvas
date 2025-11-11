import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateQuickStoreParams {
  storeName: string;
  templateId: string;
  customDomain?: string;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
};

export const useCreateQuickStore = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeName, templateId, customDomain }: CreateQuickStoreParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get business settings for auto-population
      const { data: businessSettings } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const slug = generateSlug(storeName);

      // Template color configurations
      const templateColors: Record<string, any> = {
        modern: { primary: '#3b82f6', secondary: '#64748b', accent: '#f59e0b' },
        classic: { primary: '#8b5cf6', secondary: '#6b7280', accent: '#ec4899' },
        bold: { primary: '#ef4444', secondary: '#f97316', accent: '#eab308' },
      };

      const colors = templateColors[templateId] || templateColors.modern;

      // Create the store (auto-published!)
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
          font_family: 'Inter',
          logo_url: businessSettings?.company_logo_url,
          custom_domain: customDomain,
          domain_verified: false,
          is_published: false, // Users can publish when ready
          seo_title: `${storeName}${businessSettings?.company_name ? ' - ' + businessSettings.company_name : ''}`,
          seo_description: `Explore custom window treatments and book appointments at ${storeName}. Quality products, expert installation, and personalized service.`,
          payment_provider: 'stripe',
        })
        .select()
        .single();

      if (storeError) throw storeError;

      // Create default pages with appointment booking
      const defaultPages = [
        {
          store_id: store.id,
          page_type: 'home',
          title: 'Home',
          slug: 'home',
          content: [
            {
              type: 'hero',
              content: {
                headline: `Welcome to ${storeName}`,
                subheadline: 'Quality window treatments with expert installation',
                ctaText: 'Shop Now',
                imageUrl: '',
                imageAlt: 'Store hero banner',
              },
              order: 0,
            },
            {
              type: 'products',
              content: {
                heading: 'Featured Products',
                displayType: 'featured',
              },
              order: 1,
            },
            {
              type: 'appointments',
              content: {
                heading: 'Book a Consultation',
                description: 'Schedule a time to discuss your window treatment needs',
              },
              order: 2,
            },
            {
              type: 'cta',
              content: {
                headline: 'Ready to transform your space?',
                text: 'Get started with a free consultation today',
                buttonText: 'Contact Us',
              },
              order: 3,
            },
          ],
          sort_order: 0,
          seo_title: `${storeName} - Premium Window Treatments`,
          seo_description: `Shop quality window treatments and book appointments at ${storeName}`,
        },
        {
          store_id: store.id,
          page_type: 'products',
          title: 'Products',
          slug: 'products',
          content: [
            {
              type: 'products',
              content: {
                heading: 'Our Products',
                displayType: 'all',
              },
              order: 0,
            },
          ],
          sort_order: 1,
          seo_title: `Products - ${storeName}`,
          seo_description: 'Browse our complete collection of window treatments',
        },
        {
          store_id: store.id,
          page_type: 'book',
          title: 'Book Appointment',
          slug: 'book',
          content: [
            {
              type: 'appointments',
              content: {
                heading: 'Schedule Your Appointment',
                description: 'Choose a convenient time for your consultation',
              },
              order: 0,
            },
          ],
          sort_order: 2,
          seo_title: `Book Appointment - ${storeName}`,
          seo_description: 'Schedule a consultation with our window treatment experts',
        },
        {
          store_id: store.id,
          page_type: 'contact',
          title: 'Contact',
          slug: 'contact',
          content: [
            {
              type: 'contact',
              content: {
                heading: 'Get in Touch',
                fields: 'name,email,phone,message',
              },
              order: 0,
            },
          ],
          sort_order: 3,
          seo_title: `Contact - ${storeName}`,
          seo_description: 'Contact us for inquiries about our products and services',
        },
      ];

      const { error: pagesError } = await supabase
        .from('store_pages')
        .insert(defaultPages);

      if (pagesError) throw pagesError;

      // Auto-add active products
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
          is_featured: index < 6, // First 6 are featured
          sort_order: index,
        }));

        await supabase
          .from('store_product_visibility')
          .insert(productMappings);
      }

      return store;
    },
    onSuccess: (store) => {
      queryClient.invalidateQueries({ queryKey: ['online-store'] });
      queryClient.invalidateQueries({ queryKey: ['has-online-store'] });
      queryClient.invalidateQueries({ queryKey: ['has-online-store-nav'] });
      
      const storeUrl = store.custom_domain && store.domain_verified
        ? `https://${store.custom_domain}`
        : `${window.location.origin}/store/${store.store_slug}`;

      toast({
        title: "Store Created!",
        description: "Your store is ready to customize. Publish it when you're ready to go live.",
        duration: 6000,
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
