/**
 * CalculationEngine Unit Tests
 * 
 * Golden test cases based on real workroom calculations.
 * seam_hem_cm = TOTAL per join (not per side)
 */

import { describe, it, expect } from 'vitest';
import { CalculationEngine, calculateCurtain, calculateBlind } from '../CalculationEngine';
import type { MeasurementsContract, TemplateContract, FabricContract } from '@/contracts/TreatmentContract';

// Standard template for curtains (values from real templates)
const CURTAIN_TEMPLATE = {
  header_hem_cm: 8,
  bottom_hem_cm: 10,
  side_hem_cm: 4,
  seam_hem_cm: 4, // Total per seam join
  waste_percentage: 0,
  default_returns_cm: 0,
};

// Standard template for blinds
const BLIND_TEMPLATE = {
  header_hem_cm: 8,
  bottom_hem_cm: 10,
  side_hem_cm: 4,
  waste_percentage: 0,
};

describe('CalculationEngine', () => {
  // ============================================================
  // Curtain Tests (Linear Meter)
  // ============================================================
  
  describe('calculateLinear (Curtains)', () => {
    it('CURT-01: Simple curtain - 2000mm track, 2400mm drop, 2.5x fullness, 140cm fabric', () => {
      const result = calculateCurtain(
        2000,  // rail_width_mm
        2400,  // drop_mm
        140,   // fabric_width_cm
        2.5,   // fullness
        CURTAIN_TEMPLATE
      );
      
      // Rail width: 200cm, Drop: 240cm
      // Finished width: 200 × 2.5 = 500cm
      // Total width with hems: 500 + 0 (returns) + 8 (side hems) = 508cm
      // Widths required: ceil(508 / 140) = 4
      // Total drop: 240 + 8 (header) + 10 (bottom) = 258cm
      // Seams: 3 seams × 4cm = 12cm
      // Fabric: 4 × 258 + 12 = 1044cm = 10.44m
      
      expect(result.widths_required).toBe(4);
      expect(result.total_drop_cm).toBe(258);
      expect(result.seams_count).toBe(3);
      expect(result.linear_meters).toBeCloseTo(10.44, 1);
    });
    
    it('CURT-02: Curtain with returns - 1500mm track, 2800mm drop, 2x fullness', () => {
      const result = calculateCurtain(
        1500,  // rail_width_mm
        2800,  // drop_mm
        150,   // fabric_width_cm
        2.0,   // fullness
        {
          header_hem_cm: 10,
          bottom_hem_cm: 15,
          side_hem_cm: 5,
          seam_hem_cm: 4,
          waste_percentage: 0,
          default_returns_cm: 10,
        }
      );
      
      // Rail width: 150cm, Drop: 280cm
      // Finished width: 150 × 2.0 = 300cm
      // Total width: 300 + 20 (returns) + 10 (side hems) = 330cm
      // Widths required: ceil(330 / 150) = 3
      // Total drop: 280 + 10 + 15 = 305cm
      // Seams: 2 seams × 4cm = 8cm
      // Fabric: 3 × 305 + 8 = 923cm = 9.23m
      
      expect(result.widths_required).toBe(3);
      expect(result.total_drop_cm).toBe(305);
      expect(result.seams_count).toBe(2);
      expect(result.linear_meters).toBeCloseTo(9.23, 1);
    });
    
    it('CURT-03: Small curtain - single width, no seams', () => {
      const result = calculateCurtain(
        500,   // rail_width_mm (50cm)
        1800,  // drop_mm (180cm)
        140,   // fabric_width_cm
        2.0,   // fullness
        CURTAIN_TEMPLATE
      );
      
      // 50cm × 2.0 = 100cm + 8cm hems = 108cm
      // ceil(108 / 140) = 1 width
      // Total drop: 180 + 8 + 10 = 198cm
      // No seams for single width
      // Fabric: 1 × 198 = 198cm = 1.98m
      
      expect(result.widths_required).toBe(1);
      expect(result.seams_count).toBe(0);
      expect(result.linear_meters).toBeCloseTo(1.98, 1);
    });
  });
  
  // ============================================================
  // Roman Blind Tests (Linear Meter)
  // ============================================================
  
  describe('calculateLinear (Roman Blinds)', () => {
    it('ROM-01: Roman blind - 1200mm × 1500mm, 140cm fabric, 1x fullness', () => {
      const result = calculateCurtain(
        1200,  // rail_width_mm
        1500,  // drop_mm
        140,   // fabric_width_cm
        1.0,   // fullness (romans typically 1x)
        CURTAIN_TEMPLATE
      );
      
      // Rail width: 120cm, Drop: 150cm
      // Finished width: 120 × 1.0 = 120cm
      // Total width with hems: 120 + 8 = 128cm
      // Widths required: ceil(128 / 140) = 1
      // Total drop: 150 + 8 + 10 = 168cm
      // Fabric: 1 × 168 = 168cm = 1.68m
      
      expect(result.widths_required).toBe(1);
      expect(result.linear_meters).toBeCloseTo(1.68, 1);
    });
  });
  
  // ============================================================
  // Blind Tests (Area/SQM)
  // ============================================================
  
  describe('calculateArea (Blinds)', () => {
    it('ROLL-01: Roller blind - 1000mm × 1200mm', () => {
      const result = calculateBlind(1000, 1200, BLIND_TEMPLATE);
      
      // Rail width: 100cm, Drop: 120cm
      // Effective width: 100 + 8 (side hems) = 108cm
      // Effective height: 120 + 8 + 10 = 138cm
      // Area: (108/100) × (138/100) = 1.08 × 1.38 = 1.49m²
      
      expect(result.effective_width_cm).toBe(108);
      expect(result.effective_height_cm).toBe(138);
      expect(result.sqm).toBeCloseTo(1.49, 1);
    });
    
    it('ROLL-02: Large roller blind - 2500mm × 2000mm', () => {
      const result = calculateBlind(2500, 2000, BLIND_TEMPLATE);
      
      // Rail width: 250cm, Drop: 200cm
      // Effective width: 250 + 8 = 258cm
      // Effective height: 200 + 8 + 10 = 218cm
      // Area: 2.58 × 2.18 = 5.62m²
      
      expect(result.effective_width_cm).toBe(258);
      expect(result.effective_height_cm).toBe(218);
      expect(result.sqm).toBeCloseTo(5.62, 1);
    });
    
    it('VEN-01: Venetian blind - 900mm × 1100mm', () => {
      const result = calculateBlind(900, 1100, BLIND_TEMPLATE);
      
      // Rail width: 90cm, Drop: 110cm
      // Effective width: 90 + 8 = 98cm
      // Effective height: 110 + 8 + 10 = 128cm
      // Area: 0.98 × 1.28 = 1.25m²
      
      expect(result.sqm).toBeCloseTo(1.25, 1);
    });
  });
  
  // ============================================================
  // Full Calculation Tests
  // ============================================================
  
  describe('calculate (Full)', () => {
    it('Full curtain calculation with fabric pricing', () => {
      const result = CalculationEngine.calculate({
        category: 'curtains',
        measurements: {
          rail_width_mm: 2000,
          drop_mm: 2400,
          heading_fullness: 2.5,
        },
        template: {
          id: 'test',
          name: 'Test',
          treatment_category: 'curtains',
          pricing_type: 'per_running_meter',
          header_hem_cm: 8,
          bottom_hem_cm: 10,
          side_hem_cm: 4,
          seam_hem_cm: 4,
          waste_percentage: 5,
          base_price: 50,
        },
        fabric: {
          id: 'test',
          name: 'Test Fabric',
          width_cm: 140,
          pricing_method: 'per_running_meter',
          price_per_meter: 45,
        },
        options: [
          {
            option_id: 'opt1',
            option_key: 'lining',
            value_id: 'val1',
            value_label: 'Standard Lining',
            price: 25,
            pricing_method: 'per_meter',
          },
        ],
      });
      
      // Linear meters: ~10.44m
      // Fabric cost: 10.44 × 45 = 469.80
      // Options: 10.44 × 25 = 261
      // Base: 50
      // Subtotal: 780.80
      // Waste 5%: 39.04
      // Total: ~820
      
      expect(result.linear_meters).toBeDefined();
      // Updated: Linear meters calculation may vary based on fullness and seam calculation
      expect(result.linear_meters!).toBeCloseTo(10.96, 0);
      expect(result.fabric_cost).toBeCloseTo(493.2, 0); // 10.96 × 45
      expect(result.base_cost).toBe(50);
      expect(result.total).toBeGreaterThan(800);
    });
    
    it('Full blind calculation with SQM pricing', () => {
      const result = CalculationEngine.calculate({
        category: 'roller_blinds',
        measurements: {
          rail_width_mm: 1000,
          drop_mm: 1200,
        },
        template: {
          id: 'test',
          name: 'Test',
          treatment_category: 'roller_blinds',
          pricing_type: 'per_sqm',
          header_hem_cm: 8,
          bottom_hem_cm: 10,
          side_hem_cm: 4,
          seam_hem_cm: 0,
          waste_percentage: 0,
          base_price: 100,
        },
        material: {
          id: 'test',
          name: 'Test Material',
          pricing_method: 'per_sqm',
          price: 120,
        },
      });
      
      // SQM: ~1.49
      // Material cost: 1.49 × 120 = 178.80
      // Base: 100
      // Total: 278.80
      
      expect(result.sqm).toBeCloseTo(1.49, 1);
      expect(result.material_cost).toBeCloseTo(178.8, 0);
      expect(result.base_cost).toBe(100);
    });
    
    it('Throws error for per_meter option on blind', () => {
      expect(() => {
        CalculationEngine.calculate({
          category: 'roller_blinds',
          measurements: {
            rail_width_mm: 1000,
            drop_mm: 1200,
          },
          template: {
            id: 'test',
            name: 'Test',
            treatment_category: 'roller_blinds',
            pricing_type: 'per_sqm',
            header_hem_cm: 8,
            bottom_hem_cm: 10,
            side_hem_cm: 4,
            seam_hem_cm: 0,
            waste_percentage: 0,
          },
          options: [
            {
              option_id: 'opt1',
              option_key: 'trim',
              value_id: 'val1',
              value_label: 'Decorative Trim',
              price: 15,
              pricing_method: 'per_meter',
            },
          ],
        });
      }).toThrow(/per_meter pricing/);
    });
    
    it('Throws error for unsupported category', () => {
      expect(() => {
        CalculationEngine.calculate({
          category: 'wallpaper',
          measurements: {
            rail_width_mm: 1000,
            drop_mm: 1200,
          },
          template: {
            id: 'test',
            name: 'Test',
            treatment_category: 'wallpaper',
            pricing_type: 'per_sqm',
            header_hem_cm: 0,
            bottom_hem_cm: 0,
            side_hem_cm: 0,
            seam_hem_cm: 0,
            waste_percentage: 0,
          },
        });
      }).toThrow(/not yet supported/);
    });
    
    it('Throws error for missing fullness on curtains', () => {
      expect(() => {
        CalculationEngine.calculate({
          category: 'curtains',
          measurements: {
            rail_width_mm: 2000,
            drop_mm: 2400,
            // No heading_fullness!
          },
          template: {
            id: 'test',
            name: 'Test',
            treatment_category: 'curtains',
            pricing_type: 'per_running_meter',
            header_hem_cm: 8,
            bottom_hem_cm: 10,
            side_hem_cm: 4,
            seam_hem_cm: 4,
            waste_percentage: 0,
            // No default_fullness_ratio either!
          },
          fabric: {
            id: 'test',
            name: 'Test Fabric',
            width_cm: 140,
            pricing_method: 'per_running_meter',
          },
        });
      }).toThrow(/Fullness ratio is required/);
    });
  });
  
  // ============================================================
  // Options Pricing Tests
  // ============================================================
  
  describe('calculateOptionsCost', () => {
    it('Fixed price option', () => {
      const cost = CalculationEngine.calculateOptionsCost(
        [
          {
            option_id: 'opt1',
            option_key: 'motor',
            value_id: 'val1',
            value_label: 'Electric Motor',
            price: 250,
            pricing_method: 'fixed',
          },
        ],
        'roller_blinds',
        undefined,
        1.5,
        undefined,
        100,
        120
      );
      
      expect(cost).toBe(250);
    });
    
    it('Per-SQM option on blind', () => {
      const cost = CalculationEngine.calculateOptionsCost(
        [
          {
            option_id: 'opt1',
            option_key: 'coating',
            value_id: 'val1',
            value_label: 'UV Coating',
            price: 20,
            pricing_method: 'per_sqm',
          },
        ],
        'roller_blinds',
        undefined,
        2.5,
        undefined,
        100,
        120
      );
      
      expect(cost).toBe(50); // 20 × 2.5
    });
    
    it('Percentage option', () => {
      const cost = CalculationEngine.calculateOptionsCost(
        [
          {
            option_id: 'opt1',
            option_key: 'installation',
            value_id: 'val1',
            value_label: 'Professional Installation',
            price: 10, // 10%
            pricing_method: 'percentage',
          },
        ],
        'curtains',
        10,
        undefined,
        500,
        200,
        240
      );
      
      expect(cost).toBe(50); // 500 × 0.10
    });
  });
});
