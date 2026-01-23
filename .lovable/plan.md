
# Fix: Email Footer and Signature Ignore Disabled Settings

## Problem Summary
When you disable both "Email Footer" and "Auto-generate signature" in Settings, emails still include both. The settings are saved correctly to the database, but the email sending logic ignores them.

## Root Causes Found

| Issue | Location | Problem |
|-------|----------|---------|
| 1 | Edge function (`send-email`) | Doesn't fetch `use_auto_signature` or `show_footer` from database |
| 2 | Edge function | Always adds signature if any signature text exists |
| 3 | Edge function | Has no footer logic at all |
| 4 | Hook (`useEnhancedEmailSettings`) | Ignores `use_auto_signature` flag and auto-generates anyway |

## Solution

### Fix 1: Update Edge Function Query

Add missing columns to the email settings query:

```sql
-- Before (line 383)
.select("from_email, from_name, reply_to_email, signature, active")

-- After  
.select("from_email, from_name, reply_to_email, signature, active, use_auto_signature, show_footer")
```

### Fix 2: Respect `use_auto_signature` in Edge Function

Only add signature when `use_auto_signature` is false AND a custom signature exists:

```typescript
// Before (lines 488-502)
if (emailSettings?.signature) {
  // Always adds signature
}

// After
const shouldAddSignature = emailSettings && 
  emailSettings.use_auto_signature === false && 
  emailSettings.signature;

if (shouldAddSignature) {
  // Only add custom signature when explicitly configured
}
```

### Fix 3: Update `useEnhancedEmailSettings` Hook

Check the `use_auto_signature` setting before returning a signature:

```typescript
// Before
const getEmailSignature = () => {
  if (emailSettings?.signature) {
    return emailSettings.signature;
  }
  // Auto-generates from business settings...
};

// After
const getEmailSignature = () => {
  // If auto-signature is disabled AND user has a custom signature, use it
  if (emailSettings?.use_auto_signature === false) {
    return emailSettings.signature || '';
  }
  
  // If auto-signature is enabled (or default), generate from business settings
  if (businessSettings) {
    // Generate auto signature...
  }
  
  return '\n\nBest regards,\nYour Company';
};
```

### Fix 4: Add `shouldShowFooter` Helper

Add a function to check footer visibility:

```typescript
const shouldShowFooter = () => {
  // Default to true if not set, otherwise respect the setting
  return emailSettings?.show_footer !== false;
};
```

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/send-email/index.ts` | Fetch and respect `use_auto_signature` and `show_footer` settings |
| `src/hooks/useEnhancedEmailSettings.ts` | Check `use_auto_signature` flag before generating signature; add `shouldShowFooter` helper |
| `src/components/email/EmailTemplateWithBusiness.tsx` | Use `shouldShowFooter()` to conditionally render footer |

## Technical Details

### Edge Function Changes (send-email/index.ts)

**Line 383** - Update SELECT query:
```typescript
.select("from_email, from_name, reply_to_email, signature, active, use_auto_signature, show_footer")
```

**Lines 488-502** - Add conditional check:
```typescript
// Only add signature if:
// 1. use_auto_signature is false (user wants custom)
// 2. AND a signature is provided
let contentWithSignature = finalContent;
const shouldAddCustomSignature = emailSettings && 
  emailSettings.use_auto_signature === false && 
  emailSettings.signature;

if (shouldAddCustomSignature) {
  const formattedSignature = `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; font-family: Arial, sans-serif;">
      ${emailSettings.signature.replace(/\n/g, '<br>')}
    </div>
  `;
  // ... append signature
}
```

### Hook Changes (useEnhancedEmailSettings.ts)

```typescript
const getEmailSignature = () => {
  // If auto-signature is explicitly disabled, return empty or custom signature
  if (emailSettings?.use_auto_signature === false) {
    return emailSettings.signature || '';
  }

  // Auto-signature is enabled (default) - generate from business settings
  if (businessSettings) {
    let signature = `\n\nBest regards,\n`;
    if (businessSettings.company_name) {
      signature += `${businessSettings.company_name}\n`;
    }
    // ... rest of auto-generation
    return signature;
  }

  return '\n\nBest regards,\nYour Company';
};

const shouldShowFooter = () => {
  return emailSettings?.show_footer !== false;
};

return {
  // ... existing returns
  shouldShowFooter,
};
```

### Component Changes (EmailTemplateWithBusiness.tsx)

```typescript
const { getEmailSignature, getFromName, shouldShowFooter } = useEnhancedEmailSettings();

// In render:
{/* Email Signature - only show if there's content */}
{signature && (
  <div className="mt-6 pt-4 border-t">
    <SafeHTML ... />
  </div>
)}

{/* Business Footer - respect the setting */}
{shouldShowFooter() && businessSettings && (
  <div className="border-t p-4 ...">
    ...
  </div>
)}
```

## Expected Result

After this fix:
- **Footer disabled** → No footer in sent emails
- **Auto-signature disabled** → No signature in sent emails
- **Both enabled** (default) → Footer and auto-generated signature appear
- **Custom signature** → Only custom signature appears, no auto-generation

## Testing Steps

1. Go to Settings → Email tab
2. Turn OFF both "Auto-generate signature" and "Email Footer" toggles
3. Save changes
4. Send a test email
5. Verify: No footer and no signature in the received email
