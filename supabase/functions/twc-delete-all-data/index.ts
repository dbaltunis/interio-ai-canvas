import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Delete ALL TWC data for an account - comprehensive cleanup function
 * Phase 4: Complete TWC data removal including orphaned data
 */
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

    console.log(`DELETE ALL TWC DATA: Starting for user ${user.id}`);

    // Get user's account_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, parent_account_id')
      .eq('user_id', user.id)
      .single();

    const accountId = profile?.parent_account_id || user.id;
    console.log(`Account ID: ${accountId}`);

    let deletedProducts = 0;
    let deletedMaterials = 0;
    let deletedTemplates = 0;
    let deletedOptions = 0;
    let deletedOptionValues = 0;
    let deletedTemplateSettings = 0;

    // 1. Get all TWC options for this account
    const { data: twcOptions } = await supabase
      .from('treatment_options')
      .select('id')
      .eq('account_id', accountId)
      .eq('source', 'twc');

    const twcOptionIds = twcOptions?.map(o => o.id) || [];
    console.log(`Found ${twcOptionIds.length} TWC options to delete`);

    if (twcOptionIds.length > 0) {
      // Delete template_option_settings for TWC options
      const { data: deletedSettings, error: settingsError } = await supabase
        .from('template_option_settings')
        .delete()
        .in('treatment_option_id', twcOptionIds)
        .select('id');

      if (settingsError) {
        console.error('Error deleting template_option_settings:', settingsError);
      } else {
        deletedTemplateSettings = deletedSettings?.length || 0;
        console.log(`Deleted ${deletedTemplateSettings} template_option_settings`);
      }

      // Delete option_values for TWC options
      const { data: deletedValues, error: valuesError } = await supabase
        .from('option_values')
        .delete()
        .in('option_id', twcOptionIds)
        .select('id');

      if (valuesError) {
        console.error('Error deleting option_values:', valuesError);
      } else {
        deletedOptionValues = deletedValues?.length || 0;
        console.log(`Deleted ${deletedOptionValues} option_values`);
      }

      // Delete TWC options
      const { data: deletedOpts, error: optsError } = await supabase
        .from('treatment_options')
        .delete()
        .eq('account_id', accountId)
        .eq('source', 'twc')
        .select('id');

      if (optsError) {
        console.error('Error deleting treatment_options:', optsError);
      } else {
        deletedOptions = deletedOpts?.length || 0;
        console.log(`Deleted ${deletedOptions} treatment_options`);
      }
    }

    // 2. Get all TWC parent products
    const { data: twcProducts } = await supabase
      .from('enhanced_inventory_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('supplier', 'TWC')
      .not('metadata->twc_questions', 'is', null);

    const productIds = twcProducts?.map(p => p.id) || [];
    console.log(`Found ${productIds.length} TWC parent products`);

    // 3. Delete templates linked to TWC products
    if (productIds.length > 0) {
      const { data: deletedTemps, error: tempsError } = await supabase
        .from('curtain_templates')
        .delete()
        .in('inventory_item_id', productIds)
        .select('id');

      if (tempsError) {
        console.error('Error deleting templates:', tempsError);
      } else {
        deletedTemplates = deletedTemps?.length || 0;
        console.log(`Deleted ${deletedTemplates} templates`);
      }
    }

    // 4. Delete ALL TWC materials (child items)
    const { data: deletedMats, error: matsError } = await supabase
      .from('enhanced_inventory_items')
      .delete()
      .eq('user_id', user.id)
      .eq('supplier', 'TWC')
      .not('metadata->parent_product_id', 'is', null)
      .select('id');

    if (matsError) {
      console.error('Error deleting materials:', matsError);
    } else {
      deletedMaterials = deletedMats?.length || 0;
      console.log(`Deleted ${deletedMaterials} materials`);
    }

    // 5. Delete ALL TWC parent products
    const { data: deletedProds, error: prodsError } = await supabase
      .from('enhanced_inventory_items')
      .delete()
      .eq('user_id', user.id)
      .eq('supplier', 'TWC')
      .select('id');

    if (prodsError) {
      console.error('Error deleting products:', prodsError);
    } else {
      deletedProducts = deletedProds?.length || 0;
      console.log(`Deleted ${deletedProducts} products`);
    }

    const result = {
      success: true,
      deleted: {
        products: deletedProducts,
        materials: deletedMaterials,
        templates: deletedTemplates,
        options: deletedOptions,
        option_values: deletedOptionValues,
        template_settings: deletedTemplateSettings,
      },
      message: `Deleted all TWC data for account ${accountId}`,
    };

    console.log('DELETE ALL TWC DATA COMPLETE:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in twc-delete-all-data:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
