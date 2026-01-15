# SaaS Testing Checklist

This document provides comprehensive test cases for verifying multi-tenant isolation, permissions, and core functionality across all 600+ SaaS accounts.

---

## A. Multi-Tenant Isolation Tests

### A1. Template Isolation
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Template visibility | Create template in Account A, login to Account B | Account B cannot see A's template |
| Template editing | Try to edit Account A's template URL from Account B | Returns 404 or access denied |
| Template deletion | Delete template in Account A | Only A's template deleted, B unaffected |

### A2. Treatment Options Isolation
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Option type visibility | Create option type in Account A | Account B cannot see A's options |
| Option value visibility | Add values to option in Account A | Account B cannot see A's values |
| TWC sync isolation | Sync TWC options to Account A | Account B doesn't receive A's TWC data |

### A3. Inventory Isolation
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Fabric visibility | Add fabric to Account A's inventory | Account B cannot see A's fabrics |
| Hardware visibility | Add hardware to Account A | Account B cannot see A's hardware |
| Material search | Search fabrics from Account B | Only B's materials appear in results |

### A4. Job/Project Isolation
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Job visibility | Create job in Account A | Account B cannot see A's jobs |
| Quote visibility | Create quote in Account A | Account B cannot see A's quotes |
| Client visibility | Create client in Account A | Account B cannot see A's clients |

### A5. Option Rules Isolation
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Rule visibility | Create option_rule in Account A | Account B cannot see A's rules |
| Rule execution | Apply rule in Account A's template | Only affects A's worksheets |
| Rule editing | Edit rule in Account A | B's rules unchanged |

### A6. Team Member Inheritance
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Template inheritance | Add team member to Account A | Team member sees A's templates |
| Options inheritance | Team member opens worksheet | Team member sees A's options |
| Inventory access | Team member searches fabrics | Team member sees A's inventory |
| Query key isolation | Switch between accounts | No stale cache data from other account |

---

## B. Permission Tests

### B1. Role-Based Access Matrix

| Feature | System Owner | Owner | Admin | Sales | Installer | Dealer |
|---------|--------------|-------|-------|-------|-----------|--------|
| View All Jobs | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Assigned Jobs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Jobs | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Edit Jobs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Jobs | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View All Clients | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Assigned Clients | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access Settings | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Team | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Markups/Costs | ✅ | ✅ | Config | ❌ | ❌ | ❌ |
| View Messages | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### B2. Dealer-Specific Restrictions
| Test | Expected Behavior |
|------|-------------------|
| Inventory view | Read-only, no vendors, no costs |
| Quote summary | No cost totals, no markup % |
| Client search | Only sees own clients or assigned |
| Workroom tab | Hidden from job detail |
| Messages | Hidden from navigation |

### B3. Permission Override Tests
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Custom + Role merge | Add custom permission to user with role | User has BOTH role + custom permissions |
| Race condition bypass | Owner loads page | Features work immediately, no "flash" of disabled |

---

## C. Template Configuration Tests

### C1. Option Enable/Disable
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Disable option | Set is_enabled=false in template_option_settings | Option hidden from worksheet |
| Enable option | Set is_enabled=true | Option appears in worksheet |
| Order change | Drag option to new position | order_index updates, UI reflects change |

### C2. Per-Template Value Hiding
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Hide value | Add value ID to hidden_value_ids | Value removed from dropdown |
| Show value | Remove from hidden_value_ids | Value appears in dropdown |
| Filter combo | Hide + filter_values rule | Both apply, rule takes precedence |

### C3. Conditional Rule Visibility
| Test | Rule Type | Expected Behavior |
|------|-----------|-------------------|
| show_option | When X = Y, show Z | Z hidden until X = Y |
| hide_option | When X = Y, hide Z | Z visible until X = Y |
| require_option | When X = Y, require Z | Z marked required, validation enforced |
| set_default | When X = Y, default Z to V | Z auto-selects V when X = Y |
| filter_values | When X = Y, filter Z to [V1, V2] | Z dropdown only shows V1, V2 |

### C4. Rule Wizard UI Tests
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Create show_option | Use wizard, select options by label | Rule created with correct UUIDs |
| Create filter_values | Multi-select target values | All selected values saved |
| Edit rule | Click edit, modify, save | Changes persist |
| Delete rule | Click delete, confirm | Rule removed |
| Preview text | Fill wizard fields | Correct preview description shown |

---

## D. Pricing Tests

### D1. Fabric Pricing
| Test | Formula | Expected |
|------|---------|----------|
| Per meter | width × price_per_meter | Correct calculation |
| Per sqm | (width × height) × price_per_sqm | Correct calculation |
| With wastage | base + wastage_pct | Wastage added |

### D2. Option Pricing
| Test | Method | Expected |
|------|--------|----------|
| Fixed | flat price | Adds flat amount |
| Per unit | price × quantity | Multiplies correctly |
| Per meter | price × linear_meters | Uses calculated meters |
| Per sqm | price × sqm | Uses calculated area |

### D3. Manufacturing/Grid Pricing
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Grid lookup | Enter dimensions | Correct cell selected |
| includes_fabric_price | Grid includes fabric | No separate fabric charge |
| Fabrication only | Grid = labor only | Fabric charged separately |

### D4. Markup Tests
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Category markup | Set markup for category | Applied to all items in category |
| Option markup | Set markup for option type | Applied to specific options |
| Minimum floor | Set minimum margin | Prevents below-floor pricing |
| GP% badges | View quote as authorized user | Correct percentages shown |

---

## E. Data Integrity Tests

### E1. Quote Sync
| Test | Scenario | Expected |
|------|----------|----------|
| Owner edits | Owner updates quote | Changes saved correctly |
| Team member views | Non-owner views quote | Sync disabled, no corruption |
| Concurrent edits | Two users edit same quote | No data loss, merge or lock |

### E2. Job Status Workflow
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Custom statuses | Owner creates custom workflow | Team sees owner's statuses |
| Status transition | Move job to next status | Status updates correctly |
| Audit trail | Change status | Change logged |

---

## F. Integration Tests

### F1. TWC Integration
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Initial sync | Connect TWC account | Options/materials imported |
| Account isolation | Sync to Account A | Account B unaffected |
| Option mapping | Select TWC option in worksheet | Correct pricing applied |
| Grid resolution | Select system + price group | Correct grid loaded |

### F2. Supabase Edge Functions
| Test | Function | Expected |
|------|----------|----------|
| Auth required | Call without token | 401 response |
| Rate limiting | Burst requests | Appropriate throttling |
| Error handling | Invalid input | Graceful error response |

---

## G. Testing Procedure

### Before Each Test Session
1. Clear browser cache and cookies
2. Log out of all accounts
3. Use incognito/private mode for cross-account tests

### Account Setup for Testing
- **Account A**: Primary test account with full data
- **Account B**: Secondary account (should see NO Account A data)
- **Team Member**: User linked to Account A via parent_account_id
- **Dealer**: Restricted user linked to Account A

### Verification Commands (Supabase)
```sql
-- Check template isolation
SELECT id, name, user_id FROM curtain_templates 
WHERE id = '[template_id]';

-- Check option rules isolation
SELECT id, template_id, description FROM option_rules 
WHERE template_id = '[template_id]';

-- Check effectiveOwnerId logic
SELECT user_id, parent_account_id, 
       COALESCE(parent_account_id, user_id) as effective_owner
FROM user_profiles 
WHERE user_id = '[user_id]';
```

---

## H. Known Edge Cases

1. **Empty string values in Select**: Causes crash - use sentinel values like `__none__`
2. **Race condition on page load**: Privileged roles may see disabled buttons briefly
3. **RLS policy stacking**: Old permissive policies can override new restrictive ones
4. **Cache key leakage**: Must include effectiveOwnerId in queryKey

---

## I. Sign-Off Checklist

| Area | Tested By | Date | Status |
|------|-----------|------|--------|
| Multi-Tenant Isolation | | | ⬜ |
| Permission Matrix | | | ⬜ |
| Template Configuration | | | ⬜ |
| Option Rules | | | ⬜ |
| Pricing Calculations | | | ⬜ |
| Data Integrity | | | ⬜ |
| Integrations | | | ⬜ |

---

*Last Updated: January 2026*
