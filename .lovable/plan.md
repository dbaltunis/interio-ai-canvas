

## Fix RFMS Integration + Improve Error Notifications

### Root Cause Analysis

**Why RFMS sync fails with "RFMS session error: undefined":**

The `ensureSession` function in all 3 RFMS edge functions (`rfms-sync-customers`, `rfms-sync-quotes`, `rfms-session`) calls the RFMS API at `/session/begin`. When the RFMS API returns an unexpected response format (e.g., HTML error page, different JSON structure, or a network-level error), the code does:

```typescript
if (data.status !== "success") {
  throw new Error(`RFMS session error: ${data.reason || data.status}`);
}
```

If the response parses as JSON but has neither `.status` nor `.reason` (or the response is `{}` or has a different structure like `{error: "..."}` or `{message: "..."}`), both are `undefined`, producing the unhelpful "RFMS session error: undefined".

The function also never logs the actual raw response from RFMS, making it impossible to debug what the API actually returned.

**Why the user sees "Edge Function returned a non-2xx status code":**

When an edge function returns HTTP 500, `supabase.functions.invoke()` puts the error body in `data` (not `error.message`). The frontend code does `if (error) throw error` -- but `error` is a generic `FunctionsHttpError` with the message "Edge Function returned a non-2xx status code". The actual error details are in `data.error`, which is never read.

---

### Fix 1: Edge Functions -- Better Error Handling and Logging

**Files: `rfms-sync-customers/index.ts`, `rfms-sync-quotes/index.ts`, `rfms-session/index.ts`**

Update the `ensureSession` function in all 3 files:

```typescript
async function ensureSession(supabase, integration) {
  const { store_queue, api_key, session_token } = integration.api_credentials || {};
  const apiUrl = integration.api_credentials?.api_url || "https://api.rfms.online/v2";

  if (!store_queue || !api_key) {
    throw new Error("RFMS credentials not configured. Please enter your Store Queue and API Key in Settings.");
  }

  if (session_token) {
    return { sessionToken: session_token, storeQueue: store_queue, apiUrl };
  }

  const basicAuth = btoa(`${store_queue}:${api_key}`);
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/session/begin`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
    });
  } catch (fetchErr) {
    // Network-level failure (DNS, timeout, etc.)
    throw new Error(`Cannot reach RFMS server at ${apiUrl}. Check your internet connection and API URL.`);
  }

  const responseText = await response.text();
  console.log(`RFMS session/begin response [${response.status}]: ${responseText.substring(0, 500)}`);

  if (!response.ok) {
    // Parse error details if possible
    try {
      const errData = JSON.parse(responseText);
      throw new Error(`RFMS rejected the connection (${response.status}): ${errData.reason || errData.message || errData.error || responseText.substring(0, 200)}`);
    } catch {
      throw new Error(`RFMS returned HTTP ${response.status}. The API URL or credentials may be incorrect.`);
    }
  }

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`RFMS returned an invalid response. Check your API URL is correct: ${apiUrl}`);
  }

  if (data.status === "failed") {
    throw new Error(`RFMS authentication failed: ${data.reason || "Your Store Queue or API Key was rejected."}`);
  }

  if (data.status !== "success") {
    throw new Error(`Unexpected RFMS response: ${JSON.stringify(data).substring(0, 200)}`);
  }

  const newToken = data.result?.token || data.result?.session_token;
  if (!newToken) throw new Error("RFMS did not return a session token. Contact RFMS support.");

  // Store the token...
}
```

Key improvements:
- Catches network errors (DNS, timeout) separately with a human-readable message
- Logs the raw RFMS response for debugging
- Handles every possible response format (not just `{status, reason}`)
- Every error message tells the user what to check or do next

Also update the error response from the edge functions to return 400 (not 500) for user-fixable errors:

```typescript
} catch (error: any) {
  console.error("RFMS sync error:", error.message);
  const isUserError = error.message.includes("credentials") || 
                      error.message.includes("rejected") ||
                      error.message.includes("not configured");
  return new Response(
    JSON.stringify({ 
      success: false,
      error: error.message,
      user_action_required: isUserError 
    }),
    {
      status: isUserError ? 400 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
```

---

### Fix 2: Frontend -- Extract Actual Error from Edge Function Responses

**File: `src/components/integrations/RFMSIntegrationTab.tsx`**

The Supabase SDK behavior: when an edge function returns non-2xx, `error` is a generic `FunctionsHttpError` and `data` contains the actual response body. Update all 3 handlers:

```typescript
const handleSyncCustomers = async (direction) => {
  setIsSyncing(true);
  try {
    const { data, error } = await supabase.functions.invoke('rfms-sync-customers', {
      body: { direction },
    });

    // Extract the REAL error message from the response body
    if (error) {
      const realMessage = data?.error || error.message;
      throw new Error(realMessage);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Sync returned no results");
    }

    // ... success handling
  } catch (err) {
    toast({
      title: "Customer Sync Failed",
      description: getFriendlyRFMSError(err.message),
      variant: "warning",  // Use warning variant per project standard
    });
  }
};
```

Add a helper to translate technical errors to user-friendly messages:

```typescript
function getFriendlyRFMSError(msg: string): string {
  if (!msg) return "Something went wrong. Please try again.";
  
  // Already user-friendly (from our improved edge functions)
  if (msg.includes("credentials") || msg.includes("Check your") || msg.includes("Contact")) {
    return msg;
  }
  
  // Supabase SDK generic errors
  if (msg.includes("non-2xx")) {
    return "The RFMS sync service encountered an error. Check your credentials in the RFMS settings above and try again.";
  }
  if (msg.includes("Failed to send") || msg.includes("FunctionsHttpError")) {
    return "Could not reach the RFMS sync service. Please try again in a moment.";
  }
  
  return msg;
}
```

Apply the same pattern to `handleTestConnection`, `handleSyncQuotes`, and `handleSyncCustomers`.

---

### Fix 3: Use `warning` Toast Variant (Project Standard)

Per the project's Friendly Error Notification standard, all integration errors should use `variant: "warning"` (orange/amber) instead of `variant: "destructive"` (red). The destructive red toasts are reserved for critical system failures. Integration errors are user-fixable and should use the calmer warning style.

Change all `variant: "destructive"` in RFMSIntegrationTab to `variant: "warning"`.

---

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/rfms-sync-customers/index.ts` | Rewrite `ensureSession` with proper error handling, logging, and user-friendly messages |
| `supabase/functions/rfms-sync-quotes/index.ts` | Same `ensureSession` fix |
| `supabase/functions/rfms-session/index.ts` | Same `ensureSession` fix (already has multi-tenant, just needs error handling) |
| `src/components/integrations/RFMSIntegrationTab.tsx` | Extract real error from `data.error`, add `getFriendlyRFMSError` helper, use `warning` variant |

### After the Fix

- RFMS edge functions log the actual API response for debugging
- Every error message tells the user exactly what went wrong and what to do
- "Edge Function returned a non-2xx status code" is replaced with actionable messages like "RFMS authentication failed: Your Store Queue or API Key was rejected"
- Network errors, credential errors, and API format errors each get distinct, clear messages
- Toast notifications use the orange warning style (not scary red)
- All fixes apply to ALL accounts, not just this one
