/**
 * Utility to recalculate total_selling for windows with incorrect markup values
 * This can be triggered manually when markup settings are updated
 */

import { supabase } from '@/integrations/supabase/client';
import { resolveMarkup, applyMarkup } from './markupResolver';
import { MarkupSettings } from '@/hooks/useMarkupSettings';

export interface ResyncResult {
  windowId: string;
  oldTotalSelling: number;
  newTotalSelling: number;
  updated: boolean;
}

/**
 * Recalculates total_selling for a single window based on current markup settings
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
  const makingCategory = `${treatmentCat.replace(/_/g, '').replace('s', '')}_making`;

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

  // Only update if different
  if (Math.abs(newTotalSelling - oldTotalSelling) > 0.01) {
    const { error: updateError } = await supabase
      .from('windows_summary')
      .update({ total_selling: newTotalSelling })
      .eq('window_id', windowId);

    if (updateError) {
      console.error('Failed to update total_selling:', updateError);
      return { windowId, oldTotalSelling, newTotalSelling, updated: false };
    }

    console.log(`✅ Resynced window ${windowId}: $${oldTotalSelling.toFixed(2)} → $${newTotalSelling.toFixed(2)}`);
    return { windowId, oldTotalSelling, newTotalSelling, updated: true };
  }

  return { windowId, oldTotalSelling, newTotalSelling, updated: false };
}
