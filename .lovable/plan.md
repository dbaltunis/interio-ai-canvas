
# Remove New User Guidance System

## What Will Be Removed

| File | Action | Reason |
|------|--------|--------|
| `src/components/onboarding/NewUserWelcome.tsx` | DELETE | Remove welcome modal |
| `src/components/onboarding/index.ts` | REVERT | Remove NewUserWelcome export |
| `src/App.tsx` | REVERT | Remove NewUserWelcome mounting |
| `src/components/library/LibraryHeader.tsx` | REVERT | Remove SectionHelpButton that was added |
| `src/components/calendar/CalendarSyncToolbar.tsx` | REVERT | Remove SectionHelpButton that was added |
| `src/config/sectionHelp.ts` | REVERT | Remove dashboard and calendar content that was added |

## What Will Stay (Already Existed Before)

These were already in place before the recent changes:
- `SectionHelpButton` on Dashboard header (was already there)
- `SectionHelpButton` on Jobs header (was already there)
- `SectionHelpButton` on Clients and Messages (were already there)
- The `SectionHelpButton` component itself
- The `TeachingContext` infrastructure

## Technical Steps

1. Delete `NewUserWelcome.tsx` component file
2. Revert `index.ts` to only export what existed before
3. Remove `NewUserWelcome` import and usage from `App.tsx`
4. Remove `SectionHelpButton` from `LibraryHeader.tsx`
5. Remove `SectionHelpButton` from `CalendarSyncToolbar.tsx`
6. Remove the `dashboard` and `calendar` entries from `sectionHelp.ts`

After this cleanup, the app will be back to its previous state regarding onboarding, and we can discuss a different approach that works better for you.
