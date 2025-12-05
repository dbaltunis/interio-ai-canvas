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

    // Fetch all TWC inventory items with metadata
    const { data: twcItems, error: itemsError } = await supabase
      .from('enhanced_inventory_items')
      .select('id, name, category, metadata, tags')
      .eq('user_id', accountId)
      .eq('supplier', 'TWC');

    if (itemsError) {
      console.error('Error fetching TWC items:', itemsError);
      throw itemsError;
    }

    console.log(`Found ${twcItems?.length || 0} TWC inventory items to update`);

    let itemsUpdated = 0;
    let colorsExtracted = 0;

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

    // Update each TWC item
    for (const item of twcItems || []) {
      const metadata = item.metadata || {};
      const fabricsAndColours = metadata.twc_fabrics_and_colours;
      
      // Extract colors from TWC metadata
      const extractedColors = extractColors(fabricsAndColours);
      
      // Only update if we found colors and tags are empty/different
      const existingTags = item.tags || [];
      const needsColorUpdate = extractedColors.length > 0 && 
        (existingTags.length === 0 || !extractedColors.every(c => existingTags.includes(c)));
      
      if (needsColorUpdate) {
        // Merge existing tags with extracted colors
        const mergedTags = [...new Set([...existingTags, ...extractedColors])].slice(0, 30);
        
        const { error: updateError } = await supabase
          .from('enhanced_inventory_items')
          .update({ tags: mergedTags })
          .eq('id', item.id);

        if (updateError) {
          console.error(`Error updating item ${item.id}:`, updateError);
        } else {
          itemsUpdated++;
          colorsExtracted += extractedColors.length;
          console.log(`Updated ${item.name} with ${extractedColors.length} colors`);
        }
      }
    }

    const result = {
      success: true,
      items_found: twcItems?.length || 0,
      items_updated: itemsUpdated,
      colors_extracted: colorsExtracted
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
