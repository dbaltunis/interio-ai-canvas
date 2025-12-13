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

    // PHASE 1 FIX: Fetch ALL templates for this account - not just those linked to inventory items
    // This ensures manually-created templates AND TWC-imported templates all get options linked
    const { data: allTemplates } = await supabase
      .from('curtain_templates')
      .select('id, name, inventory_item_id, treatment_category')
      .eq('user_id', accountId);

    console.log(`Found ${allTemplates?.length || 0} total templates for account`);

    // Create a map of treatment_category to templates (not inventory_item_id)
    // This allows linking options to ALL templates of the same category
    const templatesByCategory = new Map<string, Array<{ id: string; name: string }>>();
    for (const template of allTemplates || []) {
      const category = template.treatment_category;
      if (category) {
        if (!templatesByCategory.has(category)) {
          templatesByCategory.set(category, []);
        }
        templatesByCategory.get(category)!.push({ id: template.id, name: template.name });
      }
    }
    
    console.log(`Template categories found:`, [...templatesByCategory.keys()]);

    // CRITICAL FIX: Extract ALL questions from TWC items properly
    // The TWC data format is: { name: string, options: string[], isRequired: boolean, dependantField?: {...} }
    const uniqueQuestions = new Map<string, {
      key: string;
      label: string;
      options: string[];
      isRequired: boolean;
      treatmentCategory: string;
      sourceItemIds: string[];
    }>();

    let totalQuestionsProcessed = 0;
    let questionsWithOptions = 0;

    for (const item of twcItems || []) {
      const questions = item.metadata?.twc_questions || [];
      const treatmentCategory = mapCategoryToTreatment(item.category);
      
      console.log(`\n=== Processing item: ${item.name} (${item.id}) ===`);
      console.log(`Category: ${item.category} -> Treatment: ${treatmentCategory}`);
      console.log(`Total questions in metadata: ${questions.length}`);
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        totalQuestionsProcessed++;
        
        const questionLabel = q.name || q.question;
        if (!questionLabel || typeof questionLabel !== 'string') {
          console.log(`  [${i}] Skipping - no name`);
          continue;
        }
        
        // CRITICAL: TWC stores options in the 'options' array directly
        // These are the actual answer choices for the dropdown
        let answerOptions: string[] = [];
        
        if (Array.isArray(q.options) && q.options.length > 0) {
          // Filter to only valid string options
          answerOptions = q.options.filter((opt: any) => {
            return opt !== null && opt !== undefined && typeof opt === 'string' && opt.trim() !== '';
          });
        }
        
        console.log(`  [${i}] "${questionLabel}": ${answerOptions.length} options`);
        
        // IMPORTANT: Include questions even with 0 options - they may have dependent options
        // But for now, only create if we have options
        if (answerOptions.length === 0) {
          console.log(`    -> Skipped (no direct options, may have dependent options)`);
          continue;
        }
        
        questionsWithOptions++;
        
        const key = generateKey(questionLabel);
        const isRequired = q.isRequired === true;
        
        if (!uniqueQuestions.has(key)) {
          uniqueQuestions.set(key, {
            key,
            label: questionLabel,
            options: answerOptions,
            isRequired,
            treatmentCategory,
            sourceItemIds: [item.id]
          });
          console.log(`    -> Added new question with ${answerOptions.length} options`);
        } else {
          // Merge options if same key exists
          const existing = uniqueQuestions.get(key)!;
          const mergedOptions = [...new Set([...existing.options, ...answerOptions])];
          existing.options = mergedOptions;
          if (!existing.sourceItemIds.includes(item.id)) {
            existing.sourceItemIds.push(item.id);
          }
          console.log(`    -> Merged into existing (now ${mergedOptions.length} options)`);
        }
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total questions processed: ${totalQuestionsProcessed}`);
    console.log(`Questions with options: ${questionsWithOptions}`);
    console.log(`Unique questions to sync: ${uniqueQuestions.size}`);

    let optionsCreated = 0;
    let valuesCreated = 0;
    let optionsSkipped = 0;
    let templateSettingsCreated = 0;

    // Process each unique question - CREATE REAL TWC OPTIONS
    for (const [key, questionData] of uniqueQuestions) {
      let optionId: string | null = null;
      
      // Check if treatment_option already exists for this account with this key
      const { data: existingOption } = await supabase
        .from('treatment_options')
        .select('id')
        .eq('account_id', accountId)
        .eq('treatment_category', questionData.treatmentCategory)
        .eq('key', key)
        .maybeSingle();

      if (existingOption) {
        console.log(`Option "${key}" already exists, updating values...`);
        optionId = existingOption.id;
        optionsSkipped++;
        
        // Delete old option values and recreate with correct data
        await supabase
          .from('option_values')
          .delete()
          .eq('option_id', optionId);
      } else {
        // Create NEW treatment_option with proper account_id
        // NOTE: treatment_options table does NOT have a 'metadata' column - only use valid columns
        const { data: newOption, error: optionError } = await supabase
          .from('treatment_options')
          .insert({
            account_id: accountId,
            treatment_category: questionData.treatmentCategory,
            key: key,
            label: questionData.label,
            input_type: 'select',
            order_index: 100 + optionsCreated,
            required: questionData.isRequired,
            visible: true,
            source: 'twc'
          })
          .select('id')
          .single();

        if (optionError) {
          console.error(`Error creating option "${key}":`, optionError);
          continue;
        }

        console.log(`Created treatment_option: ${key} (id: ${newOption.id}) with ${questionData.options.length} values`);
        optionId = newOption.id;
        optionsCreated++;
      }

      // Create option_values for EACH answer choice
      for (let i = 0; i < questionData.options.length; i++) {
        const optionValue = questionData.options[i];
        
        if (!optionValue || optionValue.trim() === '') continue;
        
        const valueCode = generateKey(optionValue);

        const { error: valueError } = await supabase
          .from('option_values')
          .insert({
            option_id: optionId,
            account_id: accountId,
            code: valueCode,
            label: optionValue,
            order_index: i,
            extra_data: {
              is_default: i === 0,
              source: 'twc'
            }
          });

        if (valueError) {
          // Ignore duplicate errors
          if (!valueError.message?.includes('duplicate')) {
            console.error(`Error creating value "${optionValue}":`, valueError);
          }
        } else {
          valuesCreated++;
        }
      }

      // PHASE 1 FIX: Link option to ALL templates with matching treatment_category
      // This ensures both manually-created and TWC-imported templates get options linked
      if (optionId) {
        const templatesForCategory = templatesByCategory.get(questionData.treatmentCategory) || [];
        console.log(`Linking option "${key}" to ${templatesForCategory.length} templates of category "${questionData.treatmentCategory}"`);
        
        for (const template of templatesForCategory) {
          // Check if setting already exists
          const { data: existingSetting } = await supabase
            .from('template_option_settings')
            .select('id, is_enabled')
            .eq('template_id', template.id)
            .eq('treatment_option_id', optionId)
            .maybeSingle();

          if (!existingSetting) {
            const { error: settingError } = await supabase
              .from('template_option_settings')
              .insert({
                template_id: template.id,
                treatment_option_id: optionId,
                is_enabled: true
              });

            if (settingError) {
              console.error(`Error creating template_option_setting:`, settingError);
            } else {
              console.log(`Linked option "${key}" to template "${template.name}" (${template.id})`);
              templateSettingsCreated++;
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
      products_processed: twcItems?.length || 0,
      total_questions_found: totalQuestionsProcessed,
      questions_with_options: questionsWithOptions,
      unique_questions_synced: uniqueQuestions.size,
      options_created: optionsCreated,
      options_updated: optionsSkipped,
      values_created: valuesCreated,
      template_settings_created: templateSettingsCreated
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
