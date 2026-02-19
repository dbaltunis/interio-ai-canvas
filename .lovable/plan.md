

## Fix: Hide "Push to RFMS" Button for Read-Only Tier

### What Changes

**File: `src/components/integrations/IntegrationSyncStatus.tsx`**

1. **Update `shouldShowRFMSPush`** (lines 169-172) to check the RFMS integration's `configuration.quote_create_unavailable` flag. If `true`, return `false` -- no push button anywhere.

2. **Add a helper** to get the RFMS integration config from the already-loaded `integrations` array:
   ```
   const getRFMSConfig = () => integrations.find(i => i.integration_type === 'rfms' && i.active)?.configuration;
   ```

3. **Update compact popover text** (lines 239-267): When push is unavailable, instead of showing "Connected -- not yet synced" with a Push button, show:
   - "Connected (read-only)" as the message
   - "Your RFMS plan supports reading data only. Pushing quotes requires a higher tier." as explanation
   - No push button at all

4. **Update full card mode** (lines 355-378): Same logic -- hide the Push button, show "Connected (read-only)" badge instead of "Connected" when push is unavailable.

5. **Update badge styling in compact mode** (lines 188-202): When not synced AND push unavailable, use a neutral/muted badge style instead of the blue "clickable-looking" badge, so users aren't tempted to click expecting an action.

### What Users Will See

- **Before:** Blue badge with popover saying "Push to RFMS" (which always fails on Standard tier)
- **After:** Badge says "Connected (read-only)" with a brief explanation. No push button. Link to Settings for diagnostics still available.

### Technical Detail

The `quote_create_unavailable` flag is already being set by `rfms-sync-quotes` edge function when it encounters a 405 error. The `RFMSIntegrationTab.tsx` in Settings already reads this flag to disable buttons there. This fix simply extends that same check to the job header badge/popover.
