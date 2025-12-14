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

    // Get user's account_id (for team members, use parent_account_id)
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('user_id, parent_account_id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    // Use parent_account_id if exists, otherwise use user_id (account owner)
    const accountId = userProfile?.parent_account_id || user.id;
    console.log('Using account_id:', accountId);

    const { products } = await req.json() as SyncRequest;

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No products provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Importing ${products.length} TWC products for user ${user.id}`);

    // Check for existing TWC products to prevent duplicates
    const existingSkus = new Set<string>();
    const { data: existingProducts } = await supabaseClient
      .from('enhanced_inventory_items')
      .select('sku')
      .eq('user_id', user.id)
      .eq('supplier', 'TWC');
    
    if (existingProducts) {
      existingProducts.forEach(p => existingSkus.add(p.sku));
    }
    
    // Filter out products that already exist
    const newProducts = products.filter(p => !existingSkus.has(p.itemNumber));
    console.log(`Filtered to ${newProducts.length} new products (${products.length - newProducts.length} duplicates skipped)`);

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

    // Map category for inventory classification using VALID categories from INVENTORY_CATEGORY_GUIDE.md
    // CRITICAL: Use 'material' category for ALL blind products (roller, venetian, vertical, etc.)
    // Use 'fabric' ONLY for soft goods that are sewn (curtains, romans, linings)
    const mapCategory = (description: string | undefined | null): { category: string, subcategory: string } => {
      if (!description || typeof description !== 'string') {
        console.warn('Invalid description provided to mapCategory');
        return { category: 'material', subcategory: 'roller_fabric' };
      }
      
      const lowerDesc = description.toLowerCase();
      
      // Venetian/Aluminium/Wood = material with venetian_slats subcategory
      if (lowerDesc.includes('aluminium') || lowerDesc.includes('aluminum') || 
          lowerDesc.includes('wood') || lowerDesc.includes('venetian') ||
          lowerDesc.includes('slat')) {
        return { category: 'material', subcategory: 'venetian_slats' };
      }
      
      // Roller = MATERIAL with roller_fabric subcategory (blind materials, not sewn)
      if (lowerDesc.includes('roller')) {
        return { category: 'material', subcategory: 'roller_fabric' };
      }
      
      // Vertical = material with vertical_slats subcategory
      if (lowerDesc.includes('vertical')) {
        return { category: 'material', subcategory: 'vertical_slats' };
      }
      
      // Cellular/Honeycomb = MATERIAL with cellular subcategory (manufactured)
      if (lowerDesc.includes('cellular') || lowerDesc.includes('honeycomb')) {
        return { category: 'material', subcategory: 'cellular' };
      }
      
      // Panel Glide = MATERIAL with panel_glide_fabric subcategory
      if (lowerDesc.includes('panel')) {
        return { category: 'material', subcategory: 'panel_glide_fabric' };
      }
      
      // Shutters = material with shutter_material
      if (lowerDesc.includes('shutter')) {
        return { category: 'material', subcategory: 'shutter_material' };
      }
      
      // Roman = FABRIC with roman_fabric (sewn products)
      if (lowerDesc.includes('roman')) {
        return { category: 'fabric', subcategory: 'roman_fabric' };
      }
      
      // Awning = fabric with awning_fabric
      if (lowerDesc.includes('awning')) {
        return { category: 'fabric', subcategory: 'awning_fabric' };
      }
      
      // Curtain = fabric with curtain_fabric
      if (lowerDesc.includes('curtain')) {
        return { category: 'fabric', subcategory: 'curtain_fabric' };
      }
      
      // Default: material with roller_fabric (most TWC products are blinds)
      return { category: 'material', subcategory: 'roller_fabric' };
    };

    // PHASE 2: Improved mapping using PARENT product description for material subcategory
    const mapCategoryForMaterial = (materialName: string | undefined | null, parentProductDescription: string | undefined | null): { category: string, subcategory: string } => {
      // Use parent product description (e.g., "Roller Blinds") for proper subcategory
      const parentDesc = (parentProductDescription || '').toLowerCase();
      
      // Roller blind materials - use MATERIAL category (manufactured, not sewn)
      if (parentDesc.includes('roller')) {
        return { category: 'material', subcategory: 'roller_fabric' };
      }
      
      // Venetian blind materials
      if (parentDesc.includes('venetian') || parentDesc.includes('aluminium') || parentDesc.includes('wood')) {
        return { category: 'material', subcategory: 'venetian_slats' };
      }
      
      // Vertical blind materials
      if (parentDesc.includes('vertical')) {
        return { category: 'material', subcategory: 'vertical_slats' };
      }
      
      // Cellular/Honeycomb materials - use MATERIAL category (manufactured)
      if (parentDesc.includes('cellular') || parentDesc.includes('honeycomb')) {
        return { category: 'material', subcategory: 'cellular' };
      }
      
      // Panel glide materials - use MATERIAL category
      if (parentDesc.includes('panel')) {
        return { category: 'material', subcategory: 'panel_glide_fabric' };
      }
      
      // Shutter materials
      if (parentDesc.includes('shutter')) {
        return { category: 'material', subcategory: 'shutter_material' };
      }
      
      // Fall back to original logic using material name
      return mapCategory(materialName);
    };

    // Extract colors from TWC fabricsAndColours data
    const extractColors = (fabricsAndColours: any): string[] => {
      const colors: string[] = [];
      if (fabricsAndColours && Array.isArray(fabricsAndColours)) {
        for (const item of fabricsAndColours) {
          if (item.fabricOrColourName) {
            colors.push(item.fabricOrColourName);
          }
        }
      }
      // Also check itemMaterials structure
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

    // Prepare inventory items for batch insert (only new products)
    const inventoryItems = newProducts.map(product => {
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
      const categoryMapping = mapCategory(product.description);
      
      // Extract colors from TWC data for tags
      const extractedColors = extractColors(product.fabricsAndColours);
      
      return {
        user_id: user.id,
        name: productName,
        sku: product.itemNumber || 'TWC-' + Date.now(),
        category: categoryMapping.category,
        subcategory: categoryMapping.subcategory,
        supplier: 'TWC',
        active: true,
        show_in_quote: true,
        description: `${productType} - Imported from TWC`,
        // Store extracted colors in tags for display
        tags: extractedColors,
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
      .select('id, user_id, name, sku, category, subcategory, supplier, active, show_in_quote, description, metadata, cost_price, selling_price, created_at');

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

    // Phase 2: Create templates for each imported product with inventory_item_id link
    const templates = insertedItems?.map((item, index) => {
      const product = newProducts[index];
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
        inventory_item_id: item.id, // Link template to inventory item
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
      .select('id, user_id, name, treatment_category, pricing_type, pricing_grid_data, system_type, active, description, created_at');

    if (templateError) {
      console.error('Error creating templates:', templateError);
      // Don't fail the whole import - inventory items are already created
      console.warn('Continuing without templates');
    }

    console.log(`Successfully created ${insertedTemplates?.length || 0} templates`);

    // Phase 3: Create treatment options from TWC questions
    // PHASE 1 FIX: Check for existing options by key+account_id to avoid duplicates, but ensure correct account_id
    let totalOptionsCreated = 0;
    let totalOptionsUpdated = 0;
    
    if (insertedTemplates) {
      for (let i = 0; i < insertedTemplates.length; i++) {
        const template = insertedTemplates[i];
        const product = products[i];
        
        if (product.questions && product.questions.length > 0) {
          console.log(`Processing ${product.questions.length} questions for template ${template.name}`);
          
          for (const question of product.questions) {
            // Skip invalid questions
            if (!question.question || typeof question.question !== 'string') {
              console.warn('Skipping invalid question:', question);
              continue;
            }
            
            // CRITICAL FIX: Skip heading_type questions - these duplicate system headings
            // Users should recreate TWC headings in Settings → Headings instead
            if (question.question.toLowerCase().includes('heading')) {
              console.log(`Skipping heading question "${question.question}" - use Settings → Headings instead`);
              continue;
            }
            
            // Map TWC question to treatment option key
            const optionKey = question.question.toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/[^a-z0-9_]/g, '');

            // Map TWC question type to valid input_type enum
            const mapInputType = (twcType: string | undefined): string => {
              switch (twcType?.toLowerCase()) {
                case 'dropdown':
                case 'select':
                  return 'select';
                case 'checkbox':
                  return 'checkbox';
                case 'radio':
                  return 'radio';
                case 'text':
                  return 'text';
                case 'number':
                  return 'number';
                default:
                  return 'select';
              }
            };

            // PHASE 1 FIX: Check if option already exists for THIS account
            const { data: existingOption, error: checkError } = await supabaseClient
              .from('treatment_options')
              .select('id')
              .eq('account_id', accountId)
              .eq('treatment_category', template.treatment_category)
              .eq('key', optionKey)
              .maybeSingle();

            if (checkError) {
              console.error(`Error checking existing option ${optionKey}:`, checkError);
              continue;
            }

            let optionId: string;

            if (existingOption) {
              // Option already exists for this account - use existing
              optionId = existingOption.id;
              totalOptionsUpdated++;
              console.log(`Using existing option ${optionKey} (${optionId}) for account ${accountId}`);
            } else {
              // Create new option for this account
              const { data: newOption, error: optionError } = await supabaseClient
                .from('treatment_options')
                .insert({
                  account_id: accountId,
                  treatment_category: template.treatment_category,
                  key: optionKey,
                  label: question.question,
                  input_type: mapInputType(question.questionType),
                  order_index: 0,
                  visible: true,
                  required: false,
                  source: 'twc',
                })
                .select('id')
                .single();

              if (optionError) {
                console.error(`Error creating option ${optionKey}:`, optionError);
                continue;
              }
              
              optionId = newOption.id;
              totalOptionsCreated++;
              console.log(`Created new option ${optionKey} (${optionId}) for account ${accountId}`);
            }

            // Check if template_option_settings already exists
            const { data: existingSetting } = await supabaseClient
              .from('template_option_settings')
              .select('id')
              .eq('template_id', template.id)
              .eq('treatment_option_id', optionId)
              .maybeSingle();

            if (!existingSetting) {
              // Create template_option_settings to enable option for this template
              const { error: settingsError } = await supabaseClient
                .from('template_option_settings')
                .insert({
                  template_id: template.id,
                  treatment_option_id: optionId,
                  is_enabled: true,
                  order_index: 0,
                });

              if (settingsError) {
                console.error(`Error enabling option ${optionKey} for template:`, settingsError);
              } else {
                console.log(`Enabled TWC option ${optionKey} for template ${template.name}`);
              }
            }

            // Create option values from answers (only if option was newly created)
            if (!existingOption && question.answers && question.answers.length > 0) {
              const optionValues = question.answers.map((answer, idx) => ({
                account_id: accountId,
                option_id: optionId,
                code: answer.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
                label: answer,
                order_index: idx,
              }));

              const { error: valuesError } = await supabaseClient
                .from('option_values')
                .insert(optionValues);

              if (valuesError) {
                console.error(`Error creating option values for ${optionKey}:`, valuesError);
              }
            }
          }
        }
      }
    }

    console.log(`Options: ${totalOptionsCreated} created, ${totalOptionsUpdated} reused`);

    // Phase 4: Create child inventory items for materials WITH COLORS AS TAGS (not separate items)
    let totalMaterialsCreated = 0;
    if (insertedItems) {
      for (let i = 0; i < insertedItems.length; i++) {
        const parentItem = insertedItems[i];
        const product = products[i];
        
        if (product.fabricsAndColours?.itemMaterials) {
          for (const material of product.fabricsAndColours.itemMaterials) {
            if (material.colours && material.colours.length > 0) {
              // CONSOLIDATE: Create ONE material with ALL colors as tags
              const colorTags = material.colours.map((c: any) => c.colour);
              const priceGroups = [...new Set(material.colours.map((c: any) => c.pricingGroup).filter(Boolean))];
              // Use first price group as primary (all colors typically share same group)
              const primaryPriceGroup = priceGroups[0] || null;
              
              // Use PARENT product description for subcategory, not material name
              const materialCategoryMapping = mapCategoryForMaterial(material.material, product.description);
              
              // Check if material already exists (to avoid duplicates)
              const { data: existingMaterial } = await supabaseClient
                .from('enhanced_inventory_items')
                .select('id')
                .eq('user_id', user.id)
                .eq('name', `${parentItem.name} - ${material.material}`)
                .maybeSingle();
              
              if (existingMaterial) {
                console.log(`Material "${material.material}" already exists, skipping`);
                continue;
              }
              
              // Determine default fabric width based on parent product type
              const getDefaultFabricWidth = (desc: string): number | null => {
                const d = desc.toLowerCase();
                // Roller/Roman/Panel/Curtain/Cellular fabrics are typically 300cm wide
                if (d.includes('roller') || d.includes('roman') || d.includes('panel') || 
                    d.includes('curtain') || d.includes('cellular') || d.includes('honeycomb')) {
                  return 300;
                }
                // Curtain sheers are often 330cm
                if (d.includes('sheer')) {
                  return 330;
                }
                // Hard materials (venetian/vertical/shutter) don't use fabric width
                return null;
              };
              
              // Generate opacity/type tags from material name - enhanced detection
              const generateTypeTags = (name: string): string[] => {
                const n = name.toLowerCase();
                const typeTags: string[] = [];
                if (n.includes('blockout') || n.includes('block out') || n.includes('blackout')) typeTags.push('blockout');
                if (n.includes('sheer')) typeTags.push('sheer');
                if (n.includes('sunscreen') || n.includes('sun screen')) typeTags.push('sunscreen');
                // Detect standalone 'screen' for sunscreen fabrics
                if (n.includes('screen') && !typeTags.includes('sunscreen')) typeTags.push('sunscreen');
                if (n.includes('light filter') || n.includes('translucent') || n.includes('light filtering')) typeTags.push('light_filtering');
                if (n.includes('dim out') || n.includes('dimout') || n.includes('dim-out')) typeTags.push('dimout');
                if (n.includes('thermal') || n.includes('insulating') || n.includes('energy')) typeTags.push('thermal');
                return typeTags;
              };
              
              const defaultWidth = getDefaultFabricWidth(product.description || '');
              const typeTags = generateTypeTags(material.material);
              // Combine color tags with type tags
              const allTags = [...colorTags, ...typeTags];
              // Add wide_width tag if applicable
              if (defaultWidth && defaultWidth >= 250) {
                allTags.push('wide_width');
              }
              
              const { error: materialError } = await supabaseClient
                .from('enhanced_inventory_items')
                .insert({
                  user_id: user.id,
                  name: `${parentItem.name} - ${material.material}`,
                  sku: `${parentItem.sku}-${material.material}`.replace(/\s+/g, '-'),
                  category: materialCategoryMapping.category,
                  subcategory: materialCategoryMapping.subcategory,
                  supplier: 'TWC',
                  active: true,
                  show_in_quote: true,
                  description: `Material: ${material.material} | Colors: ${colorTags.join(', ')}`,
                  // Store ALL colors as tags for the color dropdown (plus type tags)
                  tags: allTags,
                  // Use primary price group for grid matching
                  price_group: primaryPriceGroup,
                  // Pricing method is grid-based for TWC materials
                  pricing_method: 'pricing_grid',
                  // CRITICAL: Set default fabric width for calculations
                  fabric_width: defaultWidth,
                  metadata: {
                    parent_product_id: parentItem.id,
                    twc_material: material.material,
                    twc_colours: material.colours, // Store full color data for reference
                    twc_price_groups: priceGroups,
                    default_width_applied: defaultWidth ? true : false,
                    imported_at: new Date().toISOString(),
                  },
                  cost_price: 0,
                  selling_price: 0,
                });

              if (!materialError) {
                totalMaterialsCreated++;
                console.log(`Created consolidated material: ${material.material} with ${colorTags.length} colors`);
              } else {
                console.error(`Error creating material:`, materialError);
              }
            }
          }
        }
      }
    }

    console.log(`Successfully created ${totalMaterialsCreated} consolidated materials (with colors as tags)`);

    return new Response(
      JSON.stringify({ 
        success: true,
        imported: insertedItems?.length || 0,
        templates_created: insertedTemplates?.length || 0,
        options_created: totalOptionsCreated,
        options_reused: totalOptionsUpdated,
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
