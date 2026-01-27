/**
 * Unit Tests for calculateDiscountAmount
 * 
 * Ensures consistent discount calculations across:
 * - useQuotationSync (database persistence)
 * - useQuoteDiscount (UI interactions)
 * - InlineDiscountPanel (user input)
 */

import { describe, it, expect } from 'vitest';
import { calculateDiscountAmount, DiscountConfig } from '../calculateDiscountAmount';

// Sample test items matching real quote structures
const sampleItems = [
  { id: 'item-1', name: 'Roller Blind - Standard', total: 262.50 },
  { id: 'item-2', name: 'Curtain Fabric', description: 'Premium fabric', total: 225.00 },
  { id: 'item-3', name: 'Installation Labour', total: 150.00 },
  { id: 'item-4', name: 'Roman Blind Making', total: 100.00 },
];

describe('calculateDiscountAmount', () => {
  // ============================================
  // 1. GUARD CLAUSE TESTS (Invalid Configs)
  // ============================================
  describe('Guard Clauses - Invalid Configs', () => {
    it('returns 0 when discount type is null', () => {
      const config: DiscountConfig = { type: null, value: 10, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 500)).toBe(0);
    });

    it('returns 0 when discount value is null', () => {
      const config: DiscountConfig = { type: 'percentage', value: null, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 500)).toBe(0);
    });

    it('returns 0 when discount value is undefined', () => {
      const config: DiscountConfig = { type: 'percentage', value: undefined as any, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 500)).toBe(0);
    });

    it('returns 0 when discount scope is null', () => {
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: null };
      expect(calculateDiscountAmount(sampleItems, config, 500)).toBe(0);
    });

    it('returns 0 when all config values are null', () => {
      const config: DiscountConfig = { type: null, value: null, scope: null };
      expect(calculateDiscountAmount(sampleItems, config, 500)).toBe(0);
    });
  });

  // ============================================
  // 2. PERCENTAGE DISCOUNT - Scope "All"
  // ============================================
  describe('Percentage Discount - Scope All', () => {
    it('calculates 10% of £500 correctly', () => {
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 500)).toBe(50);
    });

    it('calculates 15% of £1000 (NZ GST scenario)', () => {
      const config: DiscountConfig = { type: 'percentage', value: 15, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 1000)).toBe(150);
    });

    it('calculates 20% of £487.50 (real quote scenario)', () => {
      const config: DiscountConfig = { type: 'percentage', value: 20, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 487.50)).toBe(97.5);
    });

    it('returns 0 for 0% discount', () => {
      const config: DiscountConfig = { type: 'percentage', value: 0, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 500)).toBe(0);
    });

    it('calculates 100% discount correctly', () => {
      const config: DiscountConfig = { type: 'percentage', value: 100, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 500)).toBe(500);
    });
  });

  // ============================================
  // 3. FIXED DISCOUNT - Scope "All"
  // ============================================
  describe('Fixed Discount - Scope All', () => {
    it('applies £50 fixed discount off £500', () => {
      const config: DiscountConfig = { type: 'fixed', value: 50, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 500)).toBe(50);
    });

    it('applies £100 fixed discount off £487.50', () => {
      const config: DiscountConfig = { type: 'fixed', value: 100, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 487.50)).toBe(100);
    });

    it('caps fixed discount when it exceeds subtotal', () => {
      const config: DiscountConfig = { type: 'fixed', value: 300, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 200)).toBe(200);
    });

    it('applies fixed discount equal to subtotal', () => {
      const config: DiscountConfig = { type: 'fixed', value: 100, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 100)).toBe(100);
    });
  });

  // ============================================
  // 4. FABRICS ONLY SCOPE
  // ============================================
  describe('Fabrics Only Scope', () => {
    it('filters and discounts items containing "fabric" keyword', () => {
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'fabrics_only' };
      // Matches: 'Curtain Fabric' (£225), 'Roller Blind' (£262.50), 'Roman Blind' (£100) = £587.50
      // 10% of £587.50 = £58.75
      expect(calculateDiscountAmount(sampleItems, config, 737.50)).toBe(58.75);
    });

    it('filters and discounts items containing "blind" keyword', () => {
      const blindItems = [
        { id: 'item-1', name: 'Roller Blind', total: 200 },
        { id: 'item-2', name: 'Installation', total: 100 },
      ];
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'fabrics_only' };
      // Only 'Roller Blind' (£200) should be discounted
      expect(calculateDiscountAmount(blindItems, config, 300)).toBe(20);
    });

    it('filters and discounts items containing "curtain" keyword', () => {
      const curtainItems = [
        { id: 'item-1', name: 'Curtain Pole', total: 150 },
        { id: 'item-2', name: 'Hardware', total: 50 },
      ];
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'fabrics_only' };
      expect(calculateDiscountAmount(curtainItems, config, 200)).toBe(15);
    });

    it('filters and discounts items containing "roman" keyword', () => {
      const romanOnlyItems = [
        { id: 'item-1', name: 'Roman Blind', total: 100 },
        { id: 'item-2', name: 'Hardware Kit', total: 50 },
      ];
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'fabrics_only' };
      // Only 'Roman Blind' (£100) should be discounted = £10
      expect(calculateDiscountAmount(romanOnlyItems, config, 150)).toBe(10);
    });

    it('returns 0 when no fabric items match', () => {
      const nonFabricItems = [
        { id: 'item-1', name: 'Installation Labour', total: 150 },
        { id: 'item-2', name: 'Delivery Fee', total: 50 },
      ];
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'fabrics_only' };
      expect(calculateDiscountAmount(nonFabricItems, config, 200)).toBe(0);
    });

    it('handles case-insensitive matching for fabric keywords', () => {
      const uppercaseItems = [
        { id: 'item-1', name: 'FABRIC SAMPLE', total: 100 },
        { id: 'item-2', name: 'Other Item', total: 100 },
      ];
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'fabrics_only' };
      expect(calculateDiscountAmount(uppercaseItems, config, 200)).toBe(10);
    });

    it('matches fabric keywords in description field', () => {
      const itemsWithDescription = [
        { id: 'item-1', name: 'Premium Material', description: 'High quality fabric', total: 100 },
        { id: 'item-2', name: 'Hardware', total: 50 },
      ];
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'fabrics_only' };
      expect(calculateDiscountAmount(itemsWithDescription, config, 150)).toBe(10);
    });
  });

  // ============================================
  // 5. SELECTED ITEMS SCOPE
  // ============================================
  describe('Selected Items Scope', () => {
    it('discounts only selected items (2 of 4)', () => {
      const config: DiscountConfig = { 
        type: 'percentage', 
        value: 10, 
        scope: 'selected_items',
        selectedItems: ['item-1', 'item-2']  // £262.50 + £225 = £487.50
      };
      expect(calculateDiscountAmount(sampleItems, config, 737.50)).toBe(48.75);
    });

    it('discounts all items when all are selected (same as scope all)', () => {
      const config: DiscountConfig = { 
        type: 'percentage', 
        value: 10, 
        scope: 'selected_items',
        selectedItems: ['item-1', 'item-2', 'item-3', 'item-4']
      };
      // Total of all items: 262.50 + 225 + 150 + 100 = 737.50
      expect(calculateDiscountAmount(sampleItems, config, 737.50)).toBe(73.75);
    });

    it('returns 0 when selectedItems is empty array', () => {
      const config: DiscountConfig = { 
        type: 'percentage', 
        value: 10, 
        scope: 'selected_items',
        selectedItems: []
      };
      expect(calculateDiscountAmount(sampleItems, config, 737.50)).toBe(0);
    });

    it('returns 0 when selectedItems contains non-existent IDs', () => {
      const config: DiscountConfig = { 
        type: 'percentage', 
        value: 10, 
        scope: 'selected_items',
        selectedItems: ['non-existent-1', 'non-existent-2']
      };
      expect(calculateDiscountAmount(sampleItems, config, 737.50)).toBe(0);
    });

    it('applies fixed discount capped at selected items total', () => {
      const config: DiscountConfig = { 
        type: 'fixed', 
        value: 500, 
        scope: 'selected_items',
        selectedItems: ['item-3']  // Only £150 item
      };
      expect(calculateDiscountAmount(sampleItems, config, 737.50)).toBe(150);
    });
  });

  // ============================================
  // 6. PRICE FIELD COMPATIBILITY
  // ============================================
  describe('Price Field Compatibility', () => {
    it('uses total field when available', () => {
      const items = [{ id: 'item-1', name: 'Test', total: 100 }];
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'selected_items', selectedItems: ['item-1'] };
      expect(calculateDiscountAmount(items, config, 100)).toBe(10);
    });

    it('falls back to total_price field', () => {
      const items = [{ id: 'item-1', name: 'Test', total_price: 100 }];
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'selected_items', selectedItems: ['item-1'] };
      expect(calculateDiscountAmount(items, config, 100)).toBe(10);
    });

    it('falls back to total_cost field', () => {
      const items = [{ id: 'item-1', name: 'Test', total_cost: 100 }];
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'selected_items', selectedItems: ['item-1'] };
      expect(calculateDiscountAmount(items, config, 100)).toBe(10);
    });

    it('calculates from unit_price * quantity when no total fields', () => {
      const items = [{ id: 'item-1', name: 'Test', unit_price: 50, quantity: 2 }];
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'selected_items', selectedItems: ['item-1'] };
      expect(calculateDiscountAmount(items, config, 100)).toBe(10);
    });

    it('treats items with no price fields as 0', () => {
      const items = [{ id: 'item-1', name: 'Test' }];
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'selected_items', selectedItems: ['item-1'] };
      expect(calculateDiscountAmount(items, config, 100)).toBe(0);
    });
  });

  // ============================================
  // 7. EDGE CASES
  // ============================================
  describe('Edge Cases', () => {
    it('handles empty items array for fabrics_only scope', () => {
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'fabrics_only' };
      expect(calculateDiscountAmount([], config, 0)).toBe(0);
    });

    it('handles empty items array for selected_items scope', () => {
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'selected_items', selectedItems: ['item-1'] };
      expect(calculateDiscountAmount([], config, 0)).toBe(0);
    });

    it('handles zero subtotal', () => {
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 0)).toBe(0);
    });

    it('handles negative subtotal gracefully', () => {
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'all' };
      // Should calculate -10 (10% of -100), allowing refund scenarios
      expect(calculateDiscountAmount(sampleItems, config, -100)).toBe(-10);
    });

    it('handles very large numbers correctly', () => {
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 1000000)).toBe(100000);
    });

    it('maintains decimal precision', () => {
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 33.33)).toBeCloseTo(3.333, 3);
    });

    it('handles fixed discount with decimal values', () => {
      const config: DiscountConfig = { type: 'fixed', value: 25.75, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 100)).toBe(25.75);
    });
  });

  // ============================================
  // 8. REAL-WORLD SCENARIOS
  // ============================================
  describe('Real-World Scenarios', () => {
    it('Tax-exclusive: 10% discount on £487.50 quote', () => {
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 487.50)).toBe(48.75);
    });

    it('Tax-inclusive NZ: 10% discount on NET £423.91 (from £487.50 gross)', () => {
      // In tax-inclusive mode, discount is applied to NET subtotal
      const netSubtotal = 487.50 / 1.15; // £423.91
      const config: DiscountConfig = { type: 'percentage', value: 10, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, netSubtotal)).toBeCloseTo(42.39, 2);
    });

    it('Trade discount: 15% off fabrics only for interior designer', () => {
      const config: DiscountConfig = { type: 'percentage', value: 15, scope: 'fabrics_only' };
      // Fabric items in sampleItems: Curtain Fabric (£225), Roller Blind (£262.50), Roman Blind (£100) 
      const result = calculateDiscountAmount(sampleItems, config, 737.50);
      expect(result).toBeGreaterThan(0);
    });

    it('Fixed promotional discount: £50 off entire order', () => {
      const config: DiscountConfig = { type: 'fixed', value: 50, scope: 'all' };
      expect(calculateDiscountAmount(sampleItems, config, 737.50)).toBe(50);
    });
  });
});
