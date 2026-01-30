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

    // Get user's account_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, parent_account_id')
      .eq('user_id', user.id)
      .single();

    const accountId = profile?.parent_account_id || user.id;
    console.log('Updating existing TWC products for account:', accountId);

    // Fetch all TWC inventory items with metadata - use accountId for proper tenant isolation
    const { data: twcItems, error: itemsError } = await supabase
      .from('enhanced_inventory_items')
      .select('id, name, category, subcategory, metadata, tags, compatible_treatments, pricing_method, color')
      .eq('user_id', accountId)
      .eq('supplier', 'TWC');

    if (itemsError) {
      console.error('Error fetching TWC items:', itemsError);
      throw itemsError;
    }

    console.log(`Found ${twcItems?.length || 0} TWC inventory items to update`);

    // Extract colors function
    const extractColors = (fabricsAndColours: any): string[] => {
      const colors: string[] = [];
      
      // Handle array of fabricsAndColours
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
      
      // Handle itemMaterials structure
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
      
      // Deduplicate and limit to 30 colors
      return [...new Set(colors)].slice(0, 30);
    };

    // ✅ NEW: Extract primary color (first valid color) for the color field
    const extractPrimaryColor = (fabricsAndColours: any): string | null => {
      const excludeValues = ['TO CONFIRM', 'TBC', 'N/A', 'UNKNOWN', 'VARIOUS', 'MIXED', 'CUSTOM'];
      
      // Handle array of fabricsAndColours
      if (Array.isArray(fabricsAndColours)) {
        for (const item of fabricsAndColours) {
          if (item.fabricOrColourName && !excludeValues.includes(item.fabricOrColourName.toUpperCase().trim())) {
            return item.fabricOrColourName;
          }
        }
      }
      
      // Handle itemMaterials structure
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

    // ✅ Map subcategory to compatible treatments for auto-population
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
        // Hardware items
        'track': ['curtains', 'roman_blinds', 'roller_blinds', 'venetian_blinds', 'vertical_blinds', 'panel_glide'],
        'rod': ['curtains'],
        'motor': ['roller_blinds', 'venetian_blinds', 'vertical_blinds', 'curtains', 'roman_blinds', 'panel_glide'],
        'bracket': ['curtains', 'roller_blinds', 'venetian_blinds', 'vertical_blinds'],
        'accessory': [],
        'slat': ['venetian_blinds', 'vertical_blinds'],
      };
      return SUBCATEGORY_TO_TREATMENTS[subcategory] || [];
    };

    // ✅ Get pricing method based on product category
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

    // Update each TWC item
    let itemsUpdated = 0;
    let colorsExtracted = 0;
    let treatmentsPopulated = 0;
    let primaryColorsSet = 0;

    for (const item of twcItems || []) {
      const metadata = item.metadata || {};
      const fabricsAndColours = metadata.twc_fabrics_and_colours;
      
      // Extract colors from TWC metadata
      const extractedColors = extractColors(fabricsAndColours);
      
      // ✅ NEW: Extract primary color for items that don't have one
      const primaryColor = extractPrimaryColor(fabricsAndColours);
      
      // Get compatible treatments and pricing method based on subcategory
      const treatments = getCompatibleTreatmentsForSubcategory(item.subcategory || '');
      const pricingMethod = getPricingMethodForCategory(item.subcategory || '');
      
      // Check what needs updating
      const existingTags = item.tags || [];
      const needsColorUpdate = extractedColors.length > 0 && 
        (existingTags.length === 0 || !extractedColors.every(c => existingTags.includes(c)));
      const needsTreatmentsUpdate = !item.compatible_treatments?.length && treatments.length > 0;
      const needsPricingMethodUpdate = !item.pricing_method;
      const needsPrimaryColorUpdate = !item.color && primaryColor; // ✅ NEW: Check if primary color needs setting
      
      if (needsColorUpdate || needsTreatmentsUpdate || needsPricingMethodUpdate || needsPrimaryColorUpdate) {
        // Build update object
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
          updateData.color = primaryColor; // ✅ NEW: Set primary color
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
          console.log(`Updated ${item.name}: colors=${needsColorUpdate}, treatments=${needsTreatmentsUpdate}, pricing=${needsPricingMethodUpdate}, primaryColor=${needsPrimaryColorUpdate}`);
        }
      }
    }

    const result = {
      success: true,
      items_found: twcItems?.length || 0,
      items_updated: itemsUpdated,
      colors_extracted: colorsExtracted,
      treatments_populated: treatmentsPopulated,
      primary_colors_set: primaryColorsSet
    };

    console.log('Update complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in twc-update-existing:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
