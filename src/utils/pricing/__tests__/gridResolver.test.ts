/**
 * Grid Resolution Testing
 * 
 * Run these tests manually to verify the grid resolution system works:
 * 
 * 1. Create test data (grid + rule)
 * 2. Test grid resolution with various scenarios
 * 3. Verify correct grid is returned
 * 
 * To test manually:
 * - Copy functions to browser console
 * - Run createTestData() first
 * - Then run testGridResolution()
 */

import { supabase } from "@/integrations/supabase/client";
import { resolveGridForProduct } from "../gridResolver";

export const TEST_SCENARIOS = {
  roller_open_a: {
    name: "Roller Blind - Open System - Group A",
    productType: "roller_blinds",
    systemType: "open",
    priceGroup: "A"
  },
  roller_cassette_b: {
    name: "Roller Blind - Cassette System - Group B",
    productType: "roller_blinds",
    systemType: "cassette",
    priceGroup: "B"
  },
  venetian_standard_a: {
    name: "Venetian Blind - Standard - Group A",
    productType: "venetian_blinds",
    systemType: "standard",
    priceGroup: "A"
  }
};

/**
 * Creates test pricing grid data
 */
export const createTestGrid = async (scenario: typeof TEST_SCENARIOS[keyof typeof TEST_SCENARIOS]) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const gridData = {
    widths: [100, 150, 200, 250, 300],
    drops: [150, 200, 250, 300],
    prices: [
      [120, 140, 160, 180, 200],  // 150cm drop
      [150, 175, 200, 225, 250],  // 200cm drop
      [180, 210, 240, 270, 300],  // 250cm drop
      [210, 245, 280, 315, 350]   // 300cm drop
    ]
  };

  const { data: grid, error: gridError } = await supabase
    .from('pricing_grids')
    .insert({
      user_id: user.user.id,
      grid_code: `TEST_${scenario.productType}_${scenario.systemType}_${scenario.priceGroup}`.toUpperCase(),
      name: `TEST: ${scenario.name}`,
      description: "Test pricing grid created by automated testing",
      grid_data: gridData as any,
      active: true
    } as any)
    .select()
    .single();

  if (gridError) throw gridError;
  return grid;
};

/**
 * Creates test routing rule
 */
export const createTestRule = async (
  scenario: typeof TEST_SCENARIOS[keyof typeof TEST_SCENARIOS],
  gridId: string
) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data: rule, error: ruleError } = await supabase
    .from('pricing_grid_rules')
    .insert({
      user_id: user.user.id,
      product_type: scenario.productType,
      system_type: scenario.systemType,
      price_group: scenario.priceGroup,
      grid_id: gridId,
      priority: 100,
      active: true
    } as any)
    .select()
    .single();

  if (ruleError) throw ruleError;
  return rule;
};

/**
 * Test grid resolution
 */
export const testGridResolution = async (scenario: typeof TEST_SCENARIOS[keyof typeof TEST_SCENARIOS]) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  console.log(`\n🧪 Testing: ${scenario.name}`);
  console.log("Parameters:", scenario);

  const result = await resolveGridForProduct({
    productType: scenario.productType,
    systemType: scenario.systemType,
    fabricPriceGroup: scenario.priceGroup,
    userId: user.user.id
  });

  console.log("Result:", result);
  
  if (result.gridId) {
    console.log("✅ Grid resolved successfully");
    console.log("  Grid ID:", result.gridId);
    console.log("  Grid Code:", result.gridCode);
    console.log("  Grid Name:", result.gridName);
    console.log("  Matched Rule:", result.matchedRule);
    return true;
  } else {
    console.log("❌ No grid found");
    return false;
  }
};

/**
 * Run complete test suite
 */
export const runAllTests = async () => {
  console.log("🚀 Starting Grid Resolution Tests\n");
  
  try {
    // Test each scenario
    for (const [key, scenario] of Object.entries(TEST_SCENARIOS)) {
      console.log(`\n📋 Creating test data for: ${key}`);
      
      // Create grid
      const grid = await createTestGrid(scenario);
      console.log("✅ Grid created:", grid.id);
      
      // Create rule
      const rule = await createTestRule(scenario, grid.id);
      console.log("✅ Rule created:", rule.id);
      
      // Test resolution
      const success = await testGridResolution(scenario);
      
      if (!success) {
        console.error(`❌ Test failed for ${key}`);
        return false;
      }
    }
    
    console.log("\n✅ All tests passed!");
    return true;
    
  } catch (error) {
    console.error("❌ Test suite failed:", error);
    return false;
  }
};

/**
 * Clean up test data
 */
export const cleanupTestData = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  // Delete test grids (cascade will delete rules)
  const { error } = await supabase
    .from('pricing_grids')
    .delete()
    .like('grid_code', 'TEST_%');

  if (error) {
    console.error("Error cleaning up test data:", error);
    throw error;
  }

  console.log("✅ Test data cleaned up");
};

// Export for manual testing in browser console
if (typeof window !== 'undefined') {
  (window as any).gridResolverTests = {
    runAllTests,
    testGridResolution,
    createTestGrid,
    createTestRule,
    cleanupTestData,
    TEST_SCENARIOS
  };
}
