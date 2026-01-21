/**
 * Utility to recalculate total_selling, markup_applied, and profit_margin 
 * for windows with incorrect markup values.
 * This can be triggered manually when markup settings are updated.
 */

import { supabase } from '@/integrations/supabase/client';
import { resolveMarkup, applyMarkup, calculateGrossMargin } from './markupResolver';
import { MarkupSettings } from '@/hooks/useMarkupSettings';

export interface ResyncResult {
  windowId: string;
  oldTotalSelling: number;
  newTotalSelling: number;
  markupApplied: number;
  profitMargin: number;
  updated: boolean;
}

export interface BatchResyncResult {
  total: number;
  updated: number;
  failed: number;
  results: ResyncResult[];
}

/**
 * Recalculates total_selling, markup_applied, and profit_margin for a single window
 */
export async function resyncWindowTotalSelling(
  windowId: string,
  markupSettings: MarkupSettings
): Promise<ResyncResult | null> {
  // Fetch window summary
  const { data: summary, error } = await supabase
    .from('windows_summary')
    .select('*')
    .eq('window_id', windowId)
    .maybeSingle();

  if (error || !summary) {
    console.warn('Could not fetch window summary for resync:', windowId, error);
    return null;
  }

  const oldTotalSelling = summary.total_selling || 0;
  const treatmentCat = summary.treatment_category || summary.treatment_type || 'curtains';
  
  // Map treatment categories to proper making categories
  // e.g., roller_blinds -> blind_making, roman_blinds -> roman_making, curtains -> curtain_making
  const getMakingCategory = (category: string): string => {
    const normalizedCat = category.toLowerCase().replace(/[\s-]/g, '_');
    
    // Handle blind variants
    if (normalizedCat.includes('roman')) return 'roman_making';
    if (normalizedCat.includes('blind') || normalizedCat.includes('roller') || 
        normalizedCat.includes('venetian') || normalizedCat.includes('vertical') ||
        normalizedCat.includes('cellular') || normalizedCat.includes('zebra')) return 'blind_making';
    if (normalizedCat.includes('shutter') || normalizedCat.includes('plantation')) return 'shutter_making';
    if (normalizedCat.includes('curtain') || normalizedCat.includes('drape')) return 'curtain_making';
    
    // Fallback: try to construct from category name
    return `${normalizedCat.replace(/_/g, '').replace(/s$/, '')}_making`;
  };
  
  const makingCategory = getMakingCategory(treatmentCat);

  // Get fabric details to check for product markup
  const fabricDetails = summary.fabric_details as any;
  const productMarkup = fabricDetails?.markup_percentage;
  const gridMarkup = fabricDetails?.pricing_grid_markup;

  // Recalculate component selling prices
  const fabricCost = summary.fabric_cost || 0;
  const liningCost = summary.lining_cost || 0;
  const headingCost = summary.heading_cost || 0;
  const manufacturingCost = summary.manufacturing_cost || 0;
  const optionsCost = summary.options_cost || 0;
  const totalCost = fabricCost + liningCost + headingCost + manufacturingCost + optionsCost;

  const fabricSelling = applyMarkup(fabricCost, resolveMarkup({
    productMarkup,
    gridMarkup,
    category: treatmentCat,
    markupSettings
  }).percentage);

  const liningSelling = applyMarkup(liningCost, resolveMarkup({
    category: 'lining',
    markupSettings
  }).percentage);

  const headingSelling = applyMarkup(headingCost, resolveMarkup({
    category: 'heading',
    markupSettings
  }).percentage);

  const manufacturingSelling = applyMarkup(manufacturingCost, resolveMarkup({
    category: makingCategory,
    markupSettings
  }).percentage);

  const optionsSelling = applyMarkup(optionsCost, resolveMarkup({
    category: 'options',
    markupSettings
  }).percentage);

  const newTotalSelling = fabricSelling + liningSelling + headingSelling + manufacturingSelling + optionsSelling;

  // Calculate markup and margin percentages
  const markupApplied = totalCost > 0 
    ? ((newTotalSelling - totalCost) / totalCost) * 100 
    : 0;
  const profitMargin = calculateGrossMargin(totalCost, newTotalSelling);

  // Check if update is needed (selling price changed OR markup/margin not set)
  const oldMarkup = summary.markup_applied || 0;
  const needsUpdate = Math.abs(newTotalSelling - oldTotalSelling) > 0.01 || oldMarkup === 0;

  if (needsUpdate) {
    const { error: updateError } = await supabase
      .from('windows_summary')
      .update({ 
        total_selling: newTotalSelling,
        markup_applied: markupApplied,
        profit_margin: profitMargin
      })
      .eq('window_id', windowId);

    if (updateError) {
      console.error('Failed to update window:', updateError);
      return { windowId, oldTotalSelling, newTotalSelling, markupApplied, profitMargin, updated: false };
    }

    console.log(`✅ Resynced window ${windowId}: $${oldTotalSelling.toFixed(2)} → $${newTotalSelling.toFixed(2)} (${markupApplied.toFixed(1)}% markup)`);
    return { windowId, oldTotalSelling, newTotalSelling, markupApplied, profitMargin, updated: true };
  }

  return { windowId, oldTotalSelling, newTotalSelling, markupApplied, profitMargin, updated: false };
}

/**
 * Batch resync all windows that have markup_applied = 0 or not set
 * This is account-agnostic - it fixes all windows the current user can access
 */
export async function resyncAllWindows(
  markupSettings: MarkupSettings
): Promise<BatchResyncResult> {
  // Fetch all windows that may need resync (markup_applied = 0 or not set)
  const { data: windows, error } = await supabase
    .from('windows_summary')
    .select('window_id, total_cost, total_selling, markup_applied')
    .or('markup_applied.eq.0,markup_applied.is.null');

  if (error || !windows) {
    console.error('Failed to fetch windows for resync:', error);
    return { total: 0, updated: 0, failed: 0, results: [] };
  }

  console.log(`🔄 Found ${windows.length} windows that may need resync`);

  const results: ResyncResult[] = [];
  let updated = 0;
  let failed = 0;

  for (const window of windows) {
    const result = await resyncWindowTotalSelling(window.window_id, markupSettings);
    if (result) {
      results.push(result);
      if (result.updated) {
        updated++;
      }
    } else {
      failed++;
    }
  }

  console.log(`✅ Resync complete: ${updated} updated, ${failed} failed, ${windows.length - updated - failed} unchanged`);

  return {
    total: windows.length,
    updated,
    failed,
    results
  };
}
