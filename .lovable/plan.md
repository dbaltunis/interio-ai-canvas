

## Fix Broken Booking Confirmation Emails

### Problem Summary
The booking confirmation email shows raw template variables (like `{{client.name}}`, `{{appointment.date}}`) instead of actual values because:
1. **Variable name mismatch**: Templates use dot notation (`{{appointment.date}}`), but the edge function only replaces snake_case (`{{appointment_date}}`)
2. **Missing variables**: Business settings (phone, email, location, signature) are never fetched or replaced

---

### Solution Overview

Update the `send-booking-confirmation` edge function to:
1. Support BOTH dot notation AND snake_case variable formats
2. Fetch business settings to fill company information
3. Add all missing variable replacements

---

### Technical Implementation

#### Step 1: Update the Edge Function

**File**: `supabase/functions/send-booking-confirmation/index.ts`

Add comprehensive variable replacement that supports both formats:

```text
Changes needed:
1. Fetch business_settings for the scheduler owner
2. Replace ALL variables in both formats:
   - {{client.name}} AND {{customer_name}}
   - {{appointment.date}} AND {{appointment_date}}
   - {{appointment.time}} AND {{appointment_time}}
   - {{appointment.location}} (from scheduler or business settings)
   - {{appointment.type}} (from scheduler name)
   - {{company.name}} (from business_settings)
   - {{company.phone}} (from business_settings)
   - {{company.email}} (from business_settings)
   - {{sender.name}} (from email_settings or business_settings)
   - {{sender.signature}} (from email_settings)
```

#### Step 2: Add Business Settings Fetch

```typescript
// Fetch business settings for company info
const { data: businessSettings } = await supabase
  .from('business_settings')
  .select('*')
  .eq('user_id', scheduler.user_id)
  .single();

// Fetch email settings for signature
const { data: emailSettings } = await supabase
  .from('email_settings')
  .select('*')
  .eq('user_id', scheduler.user_id)
  .single();
```

#### Step 3: Create Universal Replace Function

```typescript
const replaceVariable = (content: string, variable: string, value: string) => {
  // Replace dot notation: {{category.property}}
  const dotPattern = new RegExp(`{{${variable}}}`, 'g');
  // Replace snake_case: {{category_property}}
  const snakePattern = new RegExp(`{{${variable.replace('.', '_')}}}`, 'g');
  
  return content.replace(dotPattern, value).replace(snakePattern, value);
};
```

#### Step 4: Apply All Replacements

```typescript
// Build data object with all available values
const replacements = {
  'client.name': customer_name,
  'appointment.date': appointment_date,
  'appointment.time': appointment_time,
  'appointment.location': businessSettings?.address || 'To be confirmed',
  'appointment.type': scheduler.name,
  'company.name': businessSettings?.company_name || scheduler.name,
  'company.phone': businessSettings?.business_phone || '',
  'company.email': businessSettings?.business_email || scheduler.user_email || '',
  'sender.name': emailSettings?.from_name || businessSettings?.company_name || '',
  'sender.signature': emailSettings?.signature || `Best regards,\n${businessSettings?.company_name || ''}`,
  'duration': appointmentDuration.toString(),
};

// Apply all replacements
for (const [variable, value] of Object.entries(replacements)) {
  subject = replaceVariable(subject, variable, value);
  content = replaceVariable(content, variable, value);
}
```

---

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/send-booking-confirmation/index.ts` | Add business settings fetch, universal variable replacement supporting both formats |

---

### After Fix

The email will correctly display:
- **Hello John Smith** (instead of `{{client.name}}`)
- **Date: February 1, 2026** (instead of `{{appointment.date}}`)
- **Location: 123 Business St** (instead of `{{appointment.location}}`)
- **Contact us at (555) 123-4567** (instead of `{{company.phone}}`)
- And all other variables properly filled in

---

### Optional Enhancement

Also consider updating `src/utils/emailTemplateVariables.ts` to show users BOTH formats are supported, or migrating all templates to use consistent naming.

