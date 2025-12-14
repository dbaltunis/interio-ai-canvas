import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { productId } = await req.json();
    if (!productId) {
      throw new Error('Product ID is required');
    }

    console.log(`CASCADE DELETE: Starting for product ${productId}`);

    // Get user's account_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, parent_account_id')
      .eq('user_id', user.id)
      .single();

    const accountId = profile?.parent_account_id || user.id;

    // 1. Get the product to find its treatment_category from metadata or subcategory
    const { data: product, error: productError } = await supabase
      .from('enhanced_inventory_items')
      .select('id, name, metadata, category, subcategory')
      .eq('id', productId)
      .eq('user_id', user.id)
      .single();

    if (productError || !product) {
      console.error('Product not found:', productError);
      throw new Error('Product not found or access denied');
    }

    console.log(`Found product: ${product.name}`);

    // Extract treatment_category from product metadata or subcategory
    // This is the FIX: don't rely solely on linked templates
    const productTreatmentCategory = 
      product.metadata?.treatment_category || 
      product.metadata?.twc_treatment_category ||
      product.subcategory;

    console.log(`Product treatment_category: ${productTreatmentCategory}`);

    // 2. Find the linked template
    const { data: linkedTemplates } = await supabase
      .from('curtain_templates')
      .select('id, name, treatment_category')
      .eq('inventory_item_id', productId);

    console.log(`Found ${linkedTemplates?.length || 0} linked templates`);

    // Collect all treatment_categories to clean up
    // FIXED: Also include the product's treatment_category even if no templates linked
    const treatmentCategories = new Set<string>();
    if (productTreatmentCategory) {
      treatmentCategories.add(productTreatmentCategory);
    }
    linkedTemplates?.forEach(t => t.treatment_category && treatmentCategories.add(t.treatment_category));

    console.log(`Treatment categories to clean: ${Array.from(treatmentCategories).join(', ')}`);

    let deletedOptions = 0;
    let deletedOptionValues = 0;
    let deletedTemplateSettings = 0;
    let deletedTemplates = 0;
    let deletedMaterials = 0;

    // 3. For each linked template, delete template_option_settings
    for (const template of linkedTemplates || []) {
      const { data: settings } = await supabase
        .from('template_option_settings')
        .select('id, treatment_option_id')
        .eq('template_id', template.id);

      if (settings && settings.length > 0) {
        // Delete template_option_settings
        const { error: settingsDeleteError } = await supabase
          .from('template_option_settings')
          .delete()
          .eq('template_id', template.id);

        if (!settingsDeleteError) {
          deletedTemplateSettings += settings.length;
          console.log(`Deleted ${settings.length} template_option_settings for template ${template.name}`);
        }
      }
    }

    // 4. Delete TWC-sourced treatment_options and their values for this product's treatment categories
    for (const category of treatmentCategories) {
      // Find TWC options for this category
      const { data: twcOptions } = await supabase
        .from('treatment_options')
        .select('id, key')
        .eq('account_id', accountId)
        .eq('treatment_category', category)
        .eq('source', 'twc');

      console.log(`Found ${twcOptions?.length || 0} TWC options for category ${category}`);

      if (twcOptions && twcOptions.length > 0) {
        const optionIds = twcOptions.map(o => o.id);

        // Delete option_values first
        const { data: deletedValues, error: valuesError } = await supabase
          .from('option_values')
          .delete()
          .in('option_id', optionIds)
          .select('id');

        if (valuesError) {
          console.error('Error deleting option_values:', valuesError);
        } else {
          deletedOptionValues += deletedValues?.length || 0;
          console.log(`Deleted ${deletedValues?.length || 0} option_values`);
        }

        // Delete template_option_settings for these options (from any template)
        const { data: deletedSettings, error: settingsError } = await supabase
          .from('template_option_settings')
          .delete()
          .in('treatment_option_id', optionIds)
          .select('id');

        if (settingsError) {
          console.error('Error deleting template_option_settings:', settingsError);
        } else {
          deletedTemplateSettings += deletedSettings?.length || 0;
          console.log(`Deleted ${deletedSettings?.length || 0} template_option_settings for TWC options`);
        }

        // Now delete the options themselves (no need to check remaining settings - we just deleted them)
        for (const optionId of optionIds) {
          const { error: optionDeleteError } = await supabase
            .from('treatment_options')
            .delete()
            .eq('id', optionId);

          if (!optionDeleteError) {
            deletedOptions++;
          } else {
            console.error(`Error deleting option ${optionId}:`, optionDeleteError);
          }
        }
        console.log(`Deleted ${deletedOptions} treatment_options for category ${category}`);
      }
    }

    // 5. Delete child materials (items with parent_product_id in metadata)
    const { data: childMaterials, error: materialsError } = await supabase
      .from('enhanced_inventory_items')
      .delete()
      .eq('user_id', user.id)
      .eq('supplier', 'TWC')
      .filter('metadata->parent_product_id', 'eq', `"${productId}"`)
      .select('id');

    if (materialsError) {
      console.error('Error deleting child materials:', materialsError);
    } else {
      deletedMaterials = childMaterials?.length || 0;
      console.log(`Deleted ${deletedMaterials} child materials`);
    }

    // 6. Delete linked templates
    for (const template of linkedTemplates || []) {
      const { error: templateDeleteError } = await supabase
        .from('curtain_templates')
        .delete()
        .eq('id', template.id);

      if (!templateDeleteError) {
        deletedTemplates++;
      }
    }

    console.log(`Deleted ${deletedTemplates} templates`);

    // 7. Finally, delete the parent product
    const { error: productDeleteError } = await supabase
      .from('enhanced_inventory_items')
      .delete()
      .eq('id', productId);

    if (productDeleteError) {
      console.error('Error deleting product:', productDeleteError);
      throw productDeleteError;
    }

    const result = {
      success: true,
      deleted: {
        product: product.name,
        templates: deletedTemplates,
        template_settings: deletedTemplateSettings,
        options: deletedOptions,
        option_values: deletedOptionValues,
        materials: deletedMaterials,
      },
    };

    console.log('CASCADE DELETE COMPLETE:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in twc-delete-product:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
