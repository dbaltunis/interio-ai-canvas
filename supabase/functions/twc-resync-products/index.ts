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
    console.log('Re-syncing TWC products for account:', accountId);

    // Fetch all TWC inventory items with metadata
    const { data: twcItems, error: itemsError } = await supabase
      .from('enhanced_inventory_items')
      .select('id, name, category, metadata')
      .eq('user_id', accountId)
      .eq('supplier', 'TWC');

    if (itemsError) {
      console.error('Error fetching TWC items:', itemsError);
      throw itemsError;
    }

    console.log(`Found ${twcItems?.length || 0} TWC inventory items`);

    // Get mapping of inventory items to their templates
    const { data: allTemplates } = await supabase
      .from('curtain_templates')
      .select('id, name, inventory_item_id, treatment_category')
      .eq('user_id', accountId);

    console.log(`Found ${allTemplates?.length || 0} total templates for account`);

    // Create a map of inventory_item_id to template
    const templateByInventoryId = new Map<string, { id: string; name: string; treatment_category: string }>();
    for (const template of allTemplates || []) {
      if (template.inventory_item_id) {
        templateByInventoryId.set(template.inventory_item_id, {
          id: template.id,
          name: template.name,
          treatment_category: template.treatment_category
        });
      }
    }

    let optionsCreated = 0;
    let valuesCreated = 0;
    let optionsUpdated = 0;
    let templateSettingsCreated = 0;
    let itemsProcessed = 0;

    // CRITICAL FIX: Process each TWC item SEPARATELY - no merging across products!
    for (const item of twcItems || []) {
      const questions = item.metadata?.twc_questions || [];
      const treatmentCategory = mapCategoryToTreatment(item.category);
      
      // Find template linked to this inventory item
      const linkedTemplate = templateByInventoryId.get(item.id);
      
      if (!linkedTemplate) {
        console.log(`Skipping item ${item.name} (${item.id}) - no linked template found`);
        continue;
      }

      // Use template's short ID for product-specific option keys
      const templateShortId = linkedTemplate.id.substring(0, 8);
      
      console.log(`\n=== Processing item: ${item.name} ===`);
      console.log(`Linked template: ${linkedTemplate.name} (${linkedTemplate.id})`);
      console.log(`Template short ID for keys: ${templateShortId}`);
      console.log(`Questions found: ${questions.length}`);

      itemsProcessed++;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        const questionLabel = q.name || q.question;
        if (!questionLabel || typeof questionLabel !== 'string') {
          continue;
        }
        
        // Get answer options
        let answerOptions: string[] = [];
        if (Array.isArray(q.options) && q.options.length > 0) {
          answerOptions = q.options.filter((opt: any) => {
            return opt !== null && opt !== undefined && typeof opt === 'string' && opt.trim() !== '';
          });
        }
        
        if (answerOptions.length === 0) {
          continue;
        }

        // CRITICAL: Create PRODUCT-SPECIFIC key using template ID suffix
        const baseKey = generateKey(questionLabel);
        const optionKey = `${baseKey}_${templateShortId}`;
        const isRequired = q.isRequired === true;

        console.log(`  Creating option: "${optionKey}" with ${answerOptions.length} values`);

        let optionId: string | null = null;

        // Check if this product-specific option already exists
        const { data: existingOption } = await supabase
          .from('treatment_options')
          .select('id')
          .eq('account_id', accountId)
          .eq('treatment_category', treatmentCategory)
          .eq('key', optionKey)
          .maybeSingle();

        if (existingOption) {
          console.log(`    Option exists, updating values...`);
          optionId = existingOption.id;
          optionsUpdated++;
          
          // Delete old values and recreate
          await supabase
            .from('option_values')
            .delete()
            .eq('option_id', optionId);
        } else {
          // Create NEW product-specific treatment_option
          const { data: newOption, error: optionError } = await supabase
            .from('treatment_options')
            .insert({
              account_id: accountId,
              treatment_category: treatmentCategory,
              key: optionKey,
              label: questionLabel,
              input_type: 'select',
              order_index: 100 + optionsCreated,
              required: isRequired,
              visible: true,
              source: 'twc'
            })
            .select('id')
            .single();

          if (optionError) {
            console.error(`    Error creating option:`, optionError);
            continue;
          }

          optionId = newOption.id;
          optionsCreated++;
          console.log(`    Created option: ${optionKey} (id: ${optionId})`);
        }

        // Create option_values
        for (let j = 0; j < answerOptions.length; j++) {
          const optionValue = answerOptions[j];
          if (!optionValue || optionValue.trim() === '') continue;
          
          const valueCode = generateKey(optionValue);

          const { error: valueError } = await supabase
            .from('option_values')
            .insert({
              option_id: optionId,
              account_id: accountId,
              code: valueCode,
              label: optionValue,
              order_index: j,
              extra_data: {
                is_default: j === 0,
                source: 'twc'
              }
            });

          if (valueError && !valueError.message?.includes('duplicate')) {
            console.error(`    Error creating value "${optionValue}":`, valueError);
          } else if (!valueError) {
            valuesCreated++;
          }
        }

        // Link option to ONLY this specific template (not all templates of category)
        if (optionId) {
          const { data: existingSetting } = await supabase
            .from('template_option_settings')
            .select('id, is_enabled')
            .eq('template_id', linkedTemplate.id)
            .eq('treatment_option_id', optionId)
            .maybeSingle();

          if (!existingSetting) {
            const { error: settingError } = await supabase
              .from('template_option_settings')
              .insert({
                template_id: linkedTemplate.id,
                treatment_option_id: optionId,
                is_enabled: true
              });

            if (settingError) {
              console.error(`    Error creating template_option_setting:`, settingError);
            } else {
              templateSettingsCreated++;
              console.log(`    Linked to template: ${linkedTemplate.name}`);
            }
          } else if (!existingSetting.is_enabled) {
            await supabase
              .from('template_option_settings')
              .update({ is_enabled: true })
              .eq('id', existingSetting.id);
            templateSettingsCreated++;
          }
        }
      }
    }

    const result = {
      success: true,
      products_processed: itemsProcessed,
      options_created: optionsCreated,
      options_updated: optionsUpdated,
      values_created: valuesCreated,
      template_settings_created: templateSettingsCreated,
      message: `Created ${optionsCreated} product-specific options with ${valuesCreated} values. Each product now has isolated options.`
    };

    console.log('\n=== RE-SYNC COMPLETE ===');
    console.log(JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in twc-resync-products:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50);
}

function mapCategoryToTreatment(category: string): string {
  const categoryLower = category?.toLowerCase() || '';
  
  if (categoryLower.includes('venetian')) return 'venetian_blinds';
  if (categoryLower.includes('roller')) return 'roller_blinds';
  if (categoryLower.includes('vertical')) return 'vertical_blinds';
  if (categoryLower.includes('cellular') || categoryLower.includes('honeycomb')) return 'cellular_blinds';
  if (categoryLower.includes('curtain')) return 'curtains';
  if (categoryLower.includes('roman')) return 'roman_blinds';
  if (categoryLower.includes('shutter')) return 'shutters';
  if (categoryLower.includes('awning')) return 'awning';
  if (categoryLower.includes('panel')) return 'panel_glide';
  
  return 'roller_blinds';
}
