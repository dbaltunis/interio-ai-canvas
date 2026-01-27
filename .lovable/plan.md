
# Create Automated Unit Tests for `calculateDiscountAmount`

## Overview

This plan creates a comprehensive test suite for the `calculateDiscountAmount` utility to prevent future regressions in discount pricing logic. The tests will cover all discount types, scopes, edge cases, and real-world scenarios.

## File to Create

**Location**: `src/utils/quotes/__tests__/calculateDiscountAmount.test.ts`

This follows the existing project convention (e.g., `src/engine/__tests__/CalculationEngine.test.ts`).

---

## Test Coverage

### 1. Guard Clause Tests (Invalid Configs)
| Test Case | Config | Expected |
|-----------|--------|----------|
| Null discount type | `{ type: null, value: 10, scope: 'all' }` | `0` |
| Null discount value | `{ type: 'percentage', value: null, scope: 'all' }` | `0` |
| Undefined discount value | `{ type: 'percentage', value: undefined, scope: 'all' }` | `0` |
| Null discount scope | `{ type: 'percentage', value: 10, scope: null }` | `0` |
| Empty config | `{ type: null, value: null, scope: null }` | `0` |

### 2. Percentage Discount - Scope "All"
| Test Case | Subtotal | Discount % | Expected |
|-----------|----------|------------|----------|
| 10% of £500 | 500 | 10 | £50.00 |
| 15% of £1000 (NZ GST scenario) | 1000 | 15 | £150.00 |
| 20% of £487.50 (real quote) | 487.50 | 20 | £97.50 |
| 0% discount | 500 | 0 | £0.00 |
| 100% discount | 500 | 100 | £500.00 |

### 3. Fixed Discount - Scope "All"
| Test Case | Subtotal | Fixed Amount | Expected |
|-----------|----------|--------------|----------|
| £50 off £500 | 500 | 50 | £50.00 |
| £100 off £487.50 | 487.50 | 100 | £100.00 |
| Fixed > subtotal (capped) | 200 | 300 | £200.00 |
| Fixed = subtotal | 100 | 100 | £100.00 |

### 4. Fabrics Only Scope
| Test Case | Items | Discount | Expected |
|-----------|-------|----------|----------|
| Filter by "fabric" keyword | Mixed items with fabric | 10% | 10% of fabric items only |
| Filter by "blind" keyword | Roller blind items | 10% | 10% of blind items |
| Filter by "curtain" keyword | Curtain items | 10% | 10% of curtain items |
| Filter by "roman" keyword | Roman blind items | 10% | 10% of roman items |
| No fabric items match | Non-fabric items only | 10% | £0.00 |
| Case insensitivity | "FABRIC" uppercase | 10% | Should still match |

### 5. Selected Items Scope
| Test Case | Selected IDs | Discount | Expected |
|-----------|--------------|----------|----------|
| Select specific items | 2 of 4 items | 10% | 10% of selected 2 |
| Select all items | All item IDs | 10% | Same as "all" scope |
| Select no items | Empty array | 10% | £0.00 |
| Select non-existent IDs | Invalid IDs | 10% | £0.00 |

### 6. Price Field Compatibility
| Test Case | Price Field Used | Expected Behavior |
|-----------|------------------|-------------------|
| `total` field | `{ total: 100 }` | Uses total |
| `total_price` field | `{ total_price: 100 }` | Falls back to total_price |
| `total_cost` field | `{ total_cost: 100 }` | Falls back to total_cost |
| `unit_price * quantity` | `{ unit_price: 50, quantity: 2 }` | Calculates 100 |
| No price fields | `{}` | Treats as 0 |

### 7. Edge Cases
| Test Case | Scenario | Expected |
|-----------|----------|----------|
| Empty items array | `[]` with any config | £0.00 (for non-all scopes) |
| Zero subtotal | subtotal = 0 | £0.00 |
| Negative subtotal | subtotal = -100 | Handle gracefully |
| Very large numbers | subtotal = 1,000,000 | Correct calculation |
| Decimal precision | 10% of £33.33 | £3.333 (raw) |

---

## Technical Implementation

```typescript
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
  // Guard clauses, percentage/fixed on all, fabrics_only, selected_items,
  // price field compatibility, edge cases
});
```

---

## Test Execution

After implementation, tests can be run via the Vitest test runner tool, which will validate all scenarios automatically.

---

## Benefits

1. **Regression Prevention**: Any future changes to discount logic will be caught immediately
2. **Documentation**: Tests serve as executable documentation of expected behavior
3. **Confidence**: Safe refactoring of discount code with test coverage
4. **Tax Mode Verification**: Tests validate both tax-exclusive and tax-inclusive scenarios work correctly (since discount is always applied to NET subtotal)
