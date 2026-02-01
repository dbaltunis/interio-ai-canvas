

# Simple Fix: Add TWC Backfill Button to Settings

## What I'll Do

Add a visible button in your Settings page that runs the TWC backfill with **one click**. No console commands needed.

---

## Implementation

### Add Admin Tools Section to Settings

**File**: `src/components/settings/SettingsView.tsx`

I'll add a new admin section that only appears for System Owners with a button to run the backfill:

```tsx
// New component at the top of Settings for System Owners
{userRoleData?.isSystemOwner && (
  <Card className="border-orange-200 bg-orange-50">
    <CardHeader>
      <CardTitle className="text-orange-800">🔧 Admin Tools</CardTitle>
      <CardDescription>System Owner administrative actions</CardDescription>
    </CardHeader>
    <CardContent>
      <Button 
        onClick={runTwcBackfill}
        disabled={isRunningBackfill}
      >
        {isRunningBackfill ? "Running..." : "Run TWC Color Backfill"}
      </Button>
      {backfillResult && (
        <div className="mt-4 p-3 bg-green-100 rounded">
          <pre>{JSON.stringify(backfillResult, null, 2)}</pre>
        </div>
      )}
    </CardContent>
  </Card>
)}
```

The button handler:
```tsx
const [isRunningBackfill, setIsRunningBackfill] = useState(false);
const [backfillResult, setBackfillResult] = useState(null);

const runTwcBackfill = async () => {
  setIsRunningBackfill(true);
  try {
    const { data, error } = await supabase.functions.invoke('twc-admin-backfill');
    if (error) throw error;
    setBackfillResult(data);
    toast({ title: "Backfill Complete", description: `Processed ${data.accounts_processed} accounts` });
  } catch (err) {
    toast({ title: "Error", description: err.message, variant: "destructive" });
  } finally {
    setIsRunningBackfill(false);
  }
};
```

---

## What Happens When You Click

1. Button sends authenticated request to `twc-admin-backfill`
2. Edge function processes all 4 accounts (~1,000 TWC items)
3. Results display in the UI showing items updated
4. No console needed!

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/settings/SettingsView.tsx` | Add admin tools section with backfill button |

---

## After This

1. Go to Settings in the preview or your production app
2. You'll see an orange **"Admin Tools"** card at the top
3. Click **"Run TWC Color Backfill"**
4. See results directly in the UI

