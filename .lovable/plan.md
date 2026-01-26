
# Enhanced Error Display for TWC Order Submission

## Root Cause Found

The TWC API returns **detailed validation errors** but they're not being shown to users:

```
TWC Response:
{
  "success": false,
  "message": "Item #1 - Control Type is a required field. 
              Item #1 - Cont Side is a required field. 
              Item #1 - Control Length is a required field. 
              Item #1 - Fascia is a required field. 
              Item #1 - Fixing is a required field..."
}
```

**Current code problem (line 312):**
```typescript
throw new Error(data?.error || 'Failed to submit order');
// ❌ Ignores data.message which contains the actual details!
```

## Solution

### Part 1: Fix Error Message Display in Dialog

**File:** `src/components/integrations/TWCSubmitDialog.tsx`

Change lines 311-320 to properly extract and display the detailed message:

```typescript
// Before:
} else {
  throw new Error(data?.error || 'Failed to submit order');
}
} catch (error: any) {
  console.error('Error submitting to TWC:', error);
  toast({
    title: "Submission Failed",
    description: error.message || "Failed to submit order to TWC. Please try again.",
    variant: "destructive",
  });
}

// After:
} else {
  // TWC returns detailed validation in 'message' field
  const errorDetails = data?.message || data?.error || 'Failed to submit order';
  throw new Error(errorDetails);
}
} catch (error: any) {
  console.error('Error submitting to TWC:', error);
  
  // Format multi-line errors for readability
  const errorMessage = error.message || "Failed to submit order to TWC. Please try again.";
  const formattedMessage = errorMessage.replace(/\s*\/n\s*/g, '\n'); // TWC uses "/n" as separator
  
  toast({
    title: "Submission Failed",
    description: formattedMessage,
    variant: "destructive",
    importance: 'important',
    duration: 20000, // 20 seconds for long error messages
  });
}
```

### Part 2: Enhance Toast for Long Error Messages

**File:** `src/components/ui/toast.tsx`

Add support for longer descriptions with scrollable content for detailed error messages (line 84):

```typescript
// Current:
className={cn("text-sm opacity-95 font-medium", className)}

// Updated - allow longer messages to scroll:
className={cn("text-sm opacity-95 font-medium max-h-32 overflow-y-auto whitespace-pre-line", className)}
```

### Part 3: Improve Error Toast Duration

**File:** `src/hooks/use-toast.ts`

Already has 15 second duration for errors, but we'll allow custom duration override via props.

## Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `src/components/integrations/TWCSubmitDialog.tsx` | 311-320 | Extract `data.message`, format for display |
| `src/components/ui/toast.tsx` | 84 | Add `max-h-32 overflow-y-auto whitespace-pre-line` for scrollable long messages |

## Expected Result

Users will see detailed errors like:

```
Submission Failed
───────────────────
Item #1 - Control Type is a required field
Item #1 - Cont Side is a required field  
Item #1 - Control Length is a required field
Item #1 - Fascia is a required field
Item #1 - Fixing is a required field
...
```

Instead of just "Failed to submit order" - giving them actionable information about what's missing.
