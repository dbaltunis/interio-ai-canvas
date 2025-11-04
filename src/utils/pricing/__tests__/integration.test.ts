/**
 * Integration Tests for Pricing Grid System
 * Run these tests manually in browser console or via test runner
 */

import { resolveGridForProduct } from '../gridResolver';
import { enrichTemplateWithGrid } from '../templateEnricher';
import { getPriceFromGrid } from '@/hooks/usePricingGrids';

// Test data
const sampleGridData = {
  widthColumns: ['50', '100', '150', '200', '250'],
  dropRows: [
    { drop: '100', prices: [45, 55, 65, 75, 85] },
    { drop: '150', prices: [55, 65, 75, 85, 95] },
    { drop: '200', prices: [65, 75, 85, 95, 105] },
    { drop: '250', prices: [75, 85, 95, 105, 115] }
  ]
};

/**
 * Test 1: Grid Price Lookup
 */
export const testGridPriceLookup = () => {
  console.log('🧪 Test 1: Grid Price Lookup');
  
  // Test exact matches
  const price1 = getPriceFromGrid(sampleGridData, 100, 150);
  console.log('  Width 100cm, Drop 150cm:', price1, '(expected: 65)');
  
  // Test closest match
  const price2 = getPriceFromGrid(sampleGridData, 120, 180);
  console.log('  Width 120cm, Drop 180cm:', price2, '(expected closest)');
  
  // Test edge cases
  const price3 = getPriceFromGrid(sampleGridData, 50, 100);
  console.log('  Width 50cm, Drop 100cm:', price3, '(expected: 45)');
  
  const price4 = getPriceFromGrid(sampleGridData, 250, 250);
  console.log('  Width 250cm, Drop 250cm:', price4, '(expected: 115)');
  
  return { price1, price2, price3, price4 };
};

/**
 * Test 2: Grid Resolution Logic
 */
export const testGridResolution = async (userId: string) => {
  console.log('🧪 Test 2: Grid Resolution Logic');
  
  try {
    // Test with specific parameters
    const result = await resolveGridForProduct({
      productType: 'roller_blinds',
      systemType: 'Cassette',
      fabricPriceGroup: 'Standard',
      userId
    });
    
    console.log('  Resolution result:', result);
    
    if (result) {
      console.log('  ✅ Grid resolved:', result.gridName);
      console.log('  ✅ Grid code:', result.gridCode);
      console.log('  ✅ Matched rule:', result.matchedRule);
    } else {
      console.log('  ⚠️ No grid found for these parameters');
    }
    
    return result;
  } catch (error) {
    console.error('  ❌ Grid resolution failed:', error);
    return null;
  }
};

/**
 * Test 3: Template Enrichment
 */
export const testTemplateEnrichment = async () => {
  console.log('🧪 Test 3: Template Enrichment');
  
  const sampleTemplate = {
    id: 'test-template-1',
    name: 'Test Roller Blind',
    treatment_category: 'roller_blinds',
    pricing_type: 'pricing_grid',
    system_type: 'Cassette',
    price_group: 'Standard',
    user_id: 'test-user'
  };
  
  try {
    const enriched = await enrichTemplateWithGrid(sampleTemplate);
    
    console.log('  Original template:', sampleTemplate.name);
    console.log('  Has grid data:', !!enriched.pricing_grid_data);
    
    if (enriched.pricing_grid_data) {
      console.log('  ✅ Template enriched with grid:', enriched.resolved_grid_name);
    } else {
      console.log('  ⚠️ Template not enriched (no matching grid found)');
    }
    
    return enriched;
  } catch (error) {
    console.error('  ❌ Template enrichment failed:', error);
    return sampleTemplate;
  }
};

/**
 * Test 4: End-to-End Pricing Calculation
 */
export const testEndToEndPricing = () => {
  console.log('🧪 Test 4: End-to-End Pricing');
  
  // Simulate a template with grid data
  const template = {
    name: 'Roller Blind - Standard',
    pricing_type: 'pricing_grid',
    pricing_grid_data: sampleGridData,
    blind_header_hem_cm: 8,
    blind_bottom_hem_cm: 8,
    blind_side_hem_cm: 0,
    waste_percent: 5
  };
  
  const width = 120; // cm
  const height = 180; // cm
  
  console.log(`  Calculating cost for ${width}cm x ${height}cm`);
  
  // Get grid price
  const gridPrice = getPriceFromGrid(sampleGridData, width, height);
  console.log('  Grid price:', gridPrice);
  
  // Calculate with hems
  const effectiveWidth = width + (template.blind_side_hem_cm * 2);
  const effectiveHeight = height + template.blind_header_hem_cm + template.blind_bottom_hem_cm;
  const sqm = (effectiveWidth * effectiveHeight) / 10000 * (1 + template.waste_percent / 100);
  
  console.log('  Effective dimensions:', effectiveWidth, 'x', effectiveHeight, 'cm');
  console.log('  Square meters (with waste):', sqm.toFixed(2));
  console.log('  Total cost:', gridPrice);
  
  return { gridPrice, sqm };
};

/**
 * Run all tests
 */
export const runAllTests = async (userId?: string) => {
  console.log('🚀 Running Pricing Grid System Tests\n');
  
  testGridPriceLookup();
  console.log('\n');
  
  if (userId) {
    await testGridResolution(userId);
    console.log('\n');
    
    await testTemplateEnrichment();
    console.log('\n');
  }
  
  testEndToEndPricing();
  console.log('\n');
  
  console.log('✅ All tests completed');
};

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).pricingGridTests = {
    testGridPriceLookup,
    testGridResolution,
    testTemplateEnrichment,
    testEndToEndPricing,
    runAllTests
  };
}
