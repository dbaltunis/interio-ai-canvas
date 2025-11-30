import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TWCQuestion {
  question: string;
  questionType: string;
  answers: string[];
}

interface TWCFabricColor {
  fabricOrColourName: string;
  fabricOrColourCode?: string;
}

interface TWCProduct {
  itemNumber: string;
  description: string; // TWC uses 'description' not 'itemName'
  productType?: string;
  questions?: TWCQuestion[];
  fabricsAndColours?: TWCFabricColor[];
}

interface SyncRequest {
  products: TWCProduct[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    console.log('User authenticated:', user.id);

    const { products } = await req.json() as SyncRequest;

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No products provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Importing ${products.length} TWC products for user ${user.id}`);

    // Map TWC product description to treatment_category for templates
    const mapTreatmentCategory = (description: string | undefined | null): string => {
      if (!description || typeof description !== 'string') {
        return 'roller_blinds'; // Safe default
      }
      
      const lowerDesc = description.toLowerCase();
      
      // Venetian detection - aluminium, wood, slats = venetian
      if (lowerDesc.includes('aluminium') || lowerDesc.includes('aluminum') || 
          lowerDesc.includes('wood') || lowerDesc.includes('venetian') ||
          lowerDesc.includes('slat')) {
        return 'venetian_blinds';
      }
      
      // Other types - order matters for specificity
      if (lowerDesc.includes('roller')) return 'roller_blinds';
      if (lowerDesc.includes('vertical')) return 'vertical_blinds';
      if (lowerDesc.includes('cellular') || lowerDesc.includes('honeycomb')) return 'cellular_blinds';
      if (lowerDesc.includes('roman')) return 'roman_blinds';
      if (lowerDesc.includes('shutter')) return 'shutters';
      if (lowerDesc.includes('awning')) return 'awning'; // Fixed: was 'awnings'
      if (lowerDesc.includes('panel')) return 'panel_glide';
      if (lowerDesc.includes('curtain')) return 'curtains';
      
      return 'roller_blinds'; // Safe fallback
    };

    // Map category for inventory classification
    const mapCategory = (productType: string | undefined | null): string => {
      if (!productType || typeof productType !== 'string') {
        console.warn('Invalid productType provided to mapCategory:', productType);
        return 'blinds_other';
      }
      
      const lowerType = productType.toLowerCase();
      if (lowerType.includes('venetian')) return 'blinds_venetian';
      if (lowerType.includes('roller')) return 'blinds_roller';
      if (lowerType.includes('vertical')) return 'blinds_vertical';
      if (lowerType.includes('cellular') || lowerType.includes('honeycomb')) return 'blinds_cellular';
      if (lowerType.includes('roman')) return 'roman_blinds';
      if (lowerType.includes('shutter')) return 'shutters';
      if (lowerType.includes('awning')) return 'awnings';
      return 'blinds_other';
    };

    // Prepare inventory items for batch insert
    const inventoryItems = products.map(product => {
      // Safe extraction of product type with multiple fallbacks
      let productType = 'Unknown Product';
      
      if (product.productType) {
        productType = product.productType;
      } else if (product.description) {
        // Try to extract from description (e.g., "Venetian Blinds (Item 1234)" -> "Venetian Blinds")
        const descParts = product.description.split('(');
        productType = descParts[0]?.trim() || product.description;
      }
      
      const productName = product.description || product.itemNumber || 'TWC Product';
      
      return {
        user_id: user.id,
        name: productName,
        sku: product.itemNumber || 'TWC-' + Date.now(),
        category: mapCategory(productType),
        subcategory: productType,
        supplier: 'TWC',
        active: true,
        show_in_quote: true,
        description: `${productType} - Imported from TWC`,
        metadata: {
          twc_item_number: product.itemNumber,
          twc_description: product.description,
          twc_product_type: productType,
          twc_questions: product.questions || [],
          twc_fabrics_and_colours: product.fabricsAndColours || [],
          imported_at: new Date().toISOString(),
        },
        // Default pricing - user can update later
        cost_price: 0,
        selling_price: 0,
      };
    });

    // Batch insert inventory items
    const { data: insertedItems, error: insertError } = await supabaseClient
      .from('enhanced_inventory_items')
      .insert(inventoryItems)
      .select();

    if (insertError) {
      console.error('Error inserting TWC products:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to import products',
          details: insertError.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Successfully imported ${insertedItems?.length || 0} inventory items`);

    // Phase 2: Create templates for each imported product
    const templates = insertedItems?.map((item, index) => {
      const product = products[index];
      let productType = 'Unknown Product';
      
      if (product.productType) {
        productType = product.productType;
      } else if (product.description) {
        const descParts = product.description.split('(');
        productType = descParts[0]?.trim() || product.description;
      }

      return {
        user_id: user.id,
        name: item.name,
        treatment_category: mapTreatmentCategory(product.description),
        pricing_type: 'pricing_grid', // Default to grid pricing
        pricing_grid_data: null, // User will configure this later
        system_type: productType,
        active: true,
        description: `TWC Template: ${item.name}`,
        // Default values for required fields
        fullness_ratio: 2.0,
        bottom_hem: 10,
        side_hems: 5,
        seam_hems: 3,
        heading_name: 'Standard',
        manufacturing_type: 'machine',
        fabric_direction: 'horizontal',
        fabric_width_type: 'standard',
        image_url: null,
      };
    }) || [];

    const { data: insertedTemplates, error: templateError } = await supabaseClient
      .from('curtain_templates')
      .insert(templates)
      .select();

    if (templateError) {
      console.error('Error creating templates:', templateError);
      // Don't fail the whole import - inventory items are already created
      console.warn('Continuing without templates');
    }

    console.log(`Successfully created ${insertedTemplates?.length || 0} templates`);

    // Phase 3: Create treatment options from TWC questions
    let totalOptionsCreated = 0;
    if (insertedTemplates) {
      for (let i = 0; i < insertedTemplates.length; i++) {
        const template = insertedTemplates[i];
        const product = products[i];
        
        if (product.questions && product.questions.length > 0) {
          for (const question of product.questions) {
            // Map TWC question to treatment option key
            const optionKey = question.question.toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/[^a-z0-9_]/g, '');

            // Create treatment option
            const { data: option, error: optionError } = await supabaseClient
              .from('treatment_options')
              .insert({
                treatment_category: template.treatment_category,
                key: optionKey,
                label: question.question,
                description: `TWC Option: ${question.question}`,
                option_type: question.questionType || 'select',
                display_order: 0,
              })
              .select()
              .single();

            if (optionError) {
              console.error(`Error creating option ${optionKey}:`, optionError);
              continue;
            }

            // Create option values from answers
            if (option && question.answers && question.answers.length > 0) {
              const optionValues = question.answers.map((answer, idx) => ({
                option_id: option.id,
                value: answer,
                label: answer,
                display_order: idx,
                additional_cost: 0,
              }));

              const { error: valuesError } = await supabaseClient
                .from('option_values')
                .insert(optionValues);

              if (valuesError) {
                console.error(`Error creating option values for ${optionKey}:`, valuesError);
              } else {
                totalOptionsCreated += optionValues.length;
              }
            }
          }
        }
      }
    }

    console.log(`Successfully created ${totalOptionsCreated} option values`);

    // Phase 4: Create child inventory items for materials/colors
    let totalMaterialsCreated = 0;
    if (insertedItems) {
      for (let i = 0; i < insertedItems.length; i++) {
        const parentItem = insertedItems[i];
        const product = products[i];
        
        if (product.fabricsAndColours?.itemMaterials) {
          for (const material of product.fabricsAndColours.itemMaterials) {
            if (material.colours && material.colours.length > 0) {
              for (const colour of material.colours) {
                const { error: materialError } = await supabaseClient
                  .from('enhanced_inventory_items')
                  .insert({
                    user_id: user.id,
                    name: `${parentItem.name} - ${material.material} - ${colour.colour}`,
                    sku: `${parentItem.sku}-${material.material}-${colour.colour}`.replace(/\s+/g, '-'),
                    category: parentItem.category,
                    subcategory: material.material,
                    supplier: 'TWC',
                    active: true,
                    show_in_quote: true,
                    description: `Material: ${material.material}, Colour: ${colour.colour}`,
                    metadata: {
                      parent_product_id: parentItem.id,
                      twc_material: material.material,
                      twc_colour: colour.colour,
                      twc_pricing_group: colour.pricingGroup,
                      imported_at: new Date().toISOString(),
                    },
                    cost_price: 0,
                    selling_price: 0,
                  });

                if (!materialError) {
                  totalMaterialsCreated++;
                } else {
                  console.error(`Error creating material variant:`, materialError);
                }
              }
            }
          }
        }
      }
    }

    console.log(`Successfully created ${totalMaterialsCreated} material variants`);

    return new Response(
      JSON.stringify({ 
        success: true,
        imported: insertedItems?.length || 0,
        templates_created: insertedTemplates?.length || 0,
        options_created: totalOptionsCreated,
        materials_created: totalMaterialsCreated,
        products: insertedItems,
        templates: insertedTemplates,
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in twc-sync-products:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
