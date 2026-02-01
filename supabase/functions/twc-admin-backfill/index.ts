import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // Get auth user and verify System Owner role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify caller is System Owner
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Could not verify user role');
    }

    if (profile.role !== 'super_admin') {
      throw new Error('Only System Owner can run admin backfill. Current role: ' + profile.role);
    }

    console.log('System Owner verified, starting admin TWC backfill...');

    // Get all unique account IDs that have TWC items
    const { data: twcAccounts, error: accountsError } = await supabase
      .from('enhanced_inventory_items')
      .select('user_id')
      .eq('supplier', 'TWC');

    if (accountsError) {
      throw accountsError;
    }

    // Get unique account IDs
    const uniqueAccountIds = [...new Set(twcAccounts?.map(a => a.user_id) || [])];
    console.log(`Found ${uniqueAccountIds.length} accounts with TWC items`);

    // Extract colors function
    const extractColors = (fabricsAndColours: any): string[] => {
      const colors: string[] = [];
      
      if (Array.isArray(fabricsAndColours)) {
        for (const item of fabricsAndColours) {
          if (item.fabricOrColourName) {
            colors.push(item.fabricOrColourName);
          }
          if (item.colour) {
            colors.push(item.colour);
          }
        }
      }
      
      if (fabricsAndColours?.itemMaterials && Array.isArray(fabricsAndColours.itemMaterials)) {
        for (const material of fabricsAndColours.itemMaterials) {
          if (material.colours && Array.isArray(material.colours)) {
            for (const colour of material.colours) {
              if (colour.colour) {
                colors.push(colour.colour);
              }
            }
          }
        }
      }
      
      return [...new Set(colors)].slice(0, 30);
    };

    // Extract primary color for the color field
    const extractPrimaryColor = (fabricsAndColours: any): string | null => {
      const excludeValues = ['TO CONFIRM', 'TBC', 'N/A', 'UNKNOWN', 'VARIOUS', 'MIXED', 'CUSTOM'];
      
      if (Array.isArray(fabricsAndColours)) {
        for (const item of fabricsAndColours) {
          if (item.fabricOrColourName && !excludeValues.includes(item.fabricOrColourName.toUpperCase().trim())) {
            return item.fabricOrColourName;
          }
        }
      }
      
      if (fabricsAndColours?.itemMaterials && Array.isArray(fabricsAndColours.itemMaterials)) {
        for (const material of fabricsAndColours.itemMaterials) {
          if (material.colours && Array.isArray(material.colours)) {
            for (const colour of material.colours) {
              if (colour.colour && !excludeValues.includes(colour.colour.toUpperCase().trim())) {
                return colour.colour;
              }
            }
          }
        }
      }
      
      return null;
    };

    // Map subcategory to compatible treatments
    const getCompatibleTreatmentsForSubcategory = (subcategory: string): string[] => {
      const SUBCATEGORY_TO_TREATMENTS: Record<string, string[]> = {
        'curtain_fabric': ['curtains', 'roman_blinds'],
        'awning_fabric': ['awning'],
        'lining_fabric': ['curtains', 'roman_blinds'],
        'sheer_fabric': ['curtains'],
        'roller_fabric': ['roller_blinds', 'zebra_blinds'],
        'venetian_slats': ['venetian_blinds'],
        'vertical_slats': ['vertical_blinds'],
        'vertical_fabric': ['vertical_blinds'],
        'cellular': ['cellular_blinds'],
        'panel_glide_fabric': ['panel_glide'],
        'shutter_material': ['shutters', 'plantation_shutters'],
        'blind_material': ['roller_blinds', 'venetian_blinds', 'vertical_blinds'],
        'track': ['curtains', 'roman_blinds', 'roller_blinds', 'venetian_blinds', 'vertical_blinds', 'panel_glide'],
        'rod': ['curtains'],
        'motor': ['roller_blinds', 'venetian_blinds', 'vertical_blinds', 'curtains', 'roman_blinds', 'panel_glide'],
        'bracket': ['curtains', 'roller_blinds', 'venetian_blinds', 'vertical_blinds'],
        'accessory': [],
        'slat': ['venetian_blinds', 'vertical_blinds'],
      };
      return SUBCATEGORY_TO_TREATMENTS[subcategory] || [];
    };

    // Get pricing method based on product category
    const getPricingMethodForCategory = (subcategory: string): string => {
      const gridCategories = [
        'roller_fabric', 'venetian_slats', 'vertical_slats', 'vertical_fabric',
        'cellular', 'shutter_material', 'panel_glide_fabric', 'awning_fabric', 'blind_material',
        'track', 'motor', 'bracket', 'accessory', 'slat'
      ];
      if (gridCategories.includes(subcategory)) {
        return 'pricing_grid';
      }
      if (['curtain_fabric', 'lining_fabric', 'sheer_fabric'].includes(subcategory)) {
        return 'per-linear-meter';
      }
      return 'pricing_grid';
    };

    // Process each account
    const accountResults: Array<{
      accountId: string;
      itemsFound: number;
      itemsUpdated: number;
      colorsExtracted: number;
      treatmentsPopulated: number;
      primaryColorsSet: number;
    }> = [];

    let totalItemsUpdated = 0;
    let totalPrimaryColorsSet = 0;

    for (const accountId of uniqueAccountIds) {
      console.log(`Processing account: ${accountId}`);

      // Fetch TWC items for this account
      const { data: twcItems, error: itemsError } = await supabase
        .from('enhanced_inventory_items')
        .select('id, name, category, subcategory, metadata, tags, compatible_treatments, pricing_method, color')
        .eq('user_id', accountId)
        .eq('supplier', 'TWC');

      if (itemsError) {
        console.error(`Error fetching TWC items for account ${accountId}:`, itemsError);
        continue;
      }

      let itemsUpdated = 0;
      let colorsExtracted = 0;
      let treatmentsPopulated = 0;
      let primaryColorsSet = 0;

      for (const item of twcItems || []) {
        const metadata = item.metadata || {};
        const fabricsAndColours = metadata.twc_fabrics_and_colours;
        
        const extractedColors = extractColors(fabricsAndColours);
        const primaryColor = extractPrimaryColor(fabricsAndColours);
        const treatments = getCompatibleTreatmentsForSubcategory(item.subcategory || '');
        const pricingMethod = getPricingMethodForCategory(item.subcategory || '');
        
        const existingTags = item.tags || [];
        const needsColorUpdate = extractedColors.length > 0 && 
          (existingTags.length === 0 || !extractedColors.every(c => existingTags.includes(c)));
        const needsTreatmentsUpdate = !item.compatible_treatments?.length && treatments.length > 0;
        const needsPricingMethodUpdate = !item.pricing_method;
        const needsPrimaryColorUpdate = !item.color && primaryColor;
        
        if (needsColorUpdate || needsTreatmentsUpdate || needsPricingMethodUpdate || needsPrimaryColorUpdate) {
          const updateData: Record<string, any> = {};
          
          if (needsColorUpdate) {
            updateData.tags = [...new Set([...existingTags, ...extractedColors])].slice(0, 30);
          }
          if (needsTreatmentsUpdate) {
            updateData.compatible_treatments = treatments;
          }
          if (needsPricingMethodUpdate) {
            updateData.pricing_method = pricingMethod;
          }
          if (needsPrimaryColorUpdate) {
            updateData.color = primaryColor;
          }
          
          const { error: updateError } = await supabase
            .from('enhanced_inventory_items')
            .update(updateData)
            .eq('id', item.id);

          if (updateError) {
            console.error(`Error updating item ${item.id}:`, updateError);
          } else {
            itemsUpdated++;
            if (needsColorUpdate) colorsExtracted += extractedColors.length;
            if (needsTreatmentsUpdate) treatmentsPopulated++;
            if (needsPrimaryColorUpdate) primaryColorsSet++;
          }
        }
      }

      accountResults.push({
        accountId,
        itemsFound: twcItems?.length || 0,
        itemsUpdated,
        colorsExtracted,
        treatmentsPopulated,
        primaryColorsSet,
      });

      totalItemsUpdated += itemsUpdated;
      totalPrimaryColorsSet += primaryColorsSet;
      
      console.log(`Account ${accountId}: ${itemsUpdated} items updated, ${primaryColorsSet} primary colors set`);
    }

    const result = {
      success: true,
      accounts_processed: uniqueAccountIds.length,
      total_items_updated: totalItemsUpdated,
      total_primary_colors_set: totalPrimaryColorsSet,
      account_details: accountResults,
    };

    console.log('Admin backfill complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in twc-admin-backfill:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: error.message?.includes('System Owner') ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
