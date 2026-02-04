
# Remove Update Notification Popups

## What Will Be Removed

Two components that show update notifications to users:

| Component | Location | What It Shows |
|-----------|----------|---------------|
| `UpdateBanner` | Top of screen | "New update available (v1.x.x) - Refresh Now" banner |
| `UpdateAnnouncementModal` | Center popup | "What's New" modal with version changelog |

Both trigger automatically when a new version is detected.

---

## Changes

### File: `src/App.tsx`

**Remove the import statements:**
```tsx
// DELETE these lines:
import { UpdateBanner } from "./components/version/UpdateBanner";
import { UpdateAnnouncementModal } from "./components/version/UpdateAnnouncementModal";
```

**Remove the component usage:**
```tsx
// DELETE these lines from the JSX:
<UpdateBanner />
<UpdateAnnouncementModal />
```

---

## Result

After this change:
- No more automatic "New update available" banner at the top
- No more "What's New" popup modal appearing on version changes
- Users can still manually check the version via the Version Badge in settings (if that feature exists)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Remove UpdateBanner and UpdateAnnouncementModal imports and usage |

The component files themselves (`UpdateBanner.tsx`, `UpdateAnnouncementModal.tsx`) can remain in case you want to re-enable them later.
