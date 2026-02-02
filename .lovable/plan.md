

## Enable Options for Daniel/Greg's Templates

This plan will enable the essential options for manual roller blind and vertical blind templates, making them work in the calculator immediately.

---

### Current Status

| Category | Template | Status |
|----------|----------|--------|
| **Roller Blinds** | Roller Blinds (TWC) | ✅ 23 enabled |
| | Roller Blinds (Manual) | ❌ 23 disabled |
| | Roller Blind - Blockout (Custom) | ❌ 23 disabled |
| | Roller Blinds (duplicate) | ❌ 23 disabled |
| **Vertical Blinds** | Verticals | ✅ 10 enabled |
| | Veri Shades Easi | ❌ 17 disabled |
| | Veri Shades Easi Track Only | ❌ 10 disabled |
| | Vertical Blinds (Custom) | ❌ 10 disabled |
| | Verticals (Track Only) | ❌ 10 disabled |

---

### Step 1: Enable Essential Roller Blind Options

Run this SQL to enable the most commonly used options for all manual roller blind templates:

```sql
-- Enable essential roller blind options for Daniel/Greg's manual templates
UPDATE template_option_settings tos
SET is_enabled = true
FROM treatment_options topt, curtain_templates ct
WHERE tos.treatment_option_id = topt.id
AND tos.template_id = ct.id
AND ct.user_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
AND topt.treatment_category = 'roller_blinds'
AND topt.label IN (
  'Motor',
  'Control Type', 
  'Control Length',
  'Fitting',
  'Roll Direction',
  'Component Colour',
  'Remote',
  'Brackets',
  'Bracket Covers'
);
```

---

### Step 2: Enable All Vertical Blind Options

Run this SQL to enable all vertical blind options for all templates:

```sql
-- Enable all vertical blind options for Daniel/Greg's templates
UPDATE template_option_settings tos
SET is_enabled = true
FROM treatment_options topt, curtain_templates ct
WHERE tos.treatment_option_id = topt.id
AND tos.template_id = ct.id
AND ct.user_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
AND topt.treatment_category = 'vertical_blinds';
```

---

### What This Enables

After running these queries, the calculator will show:

**Roller Blinds (all manual templates):**
- Motor
- Control Type
- Control Length  
- Fitting
- Roll Direction
- Component Colour
- Remote
- Brackets
- Bracket Covers

**Vertical Blinds (all templates):**
- All 10-17 options enabled

---

### Step 3: Test in Calculator

After enabling, test by:
1. Creating a quote with a manual "Roller Blinds" template
2. Opening the calculator 
3. Verifying Motor, Control Type, and other options appear
4. Selecting motorised to verify Remote option becomes visible

---

### Optional: Enable ALL Options

If Daniel/Greg want access to every option (not just essentials), run:

```sql
-- Enable ALL roller blind options for all templates
UPDATE template_option_settings tos
SET is_enabled = true
FROM treatment_options topt, curtain_templates ct
WHERE tos.treatment_option_id = topt.id
AND tos.template_id = ct.id
AND ct.user_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
AND topt.treatment_category IN ('roller_blinds', 'vertical_blinds');
```

This enables all 23 roller blind options + all vertical blind options for every template.

