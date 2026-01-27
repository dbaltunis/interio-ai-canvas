

# URGENT FIX: Remove All Lithuanian Text from CollectionsView.tsx

## Scope of Damage

| What | Status |
|------|--------|
| Affected Files | **1 file only**: `src/components/library/CollectionsView.tsx` |
| Other UI Components | ✅ Clean - all in English |
| Database Changes | ✅ Account-specific (Gustin Decor only) |
| Other Code Changes | ✅ No unauthorized translations |

## All Lithuanian Strings to Revert

| Line | Current (Lithuanian) | Fix (English) |
|------|---------------------|---------------|
| 62 | `"Kolekcija atnaujinta"` | `"Collection updated"` |
| 65 | `"Nepavyko atnaujinti kolekcijos"` | `"Failed to update collection"` |
| 102 | `"Kolekcijų nerasta"` | `"No Collections Found"` |
| 105 | `"Šis tiekėjas dar neturi kolekcijų..."` | `"This vendor has no collections yet. Collections are created automatically when syncing products."` |
| 106 | `"Kolekcijos padeda tvarkyti..."` | `"Collections help organize inventory by vendor assortment. They will appear when products are synced from vendors."` |
| 120 | `"Ieškoti kolekcijų..."` | `"Search collections..."` |
| 127-128 | `"kolekcija/os iš šio tiekėjo"` | `"collection(s) from this vendor"` |
| 134 | `"Nerasta kolekcijų pagal..."` | `"No collections found for..."` |
| 152 | `"vnt."` | `"items"` |
| 200 | `"Peržiūrėti"` | `"View"` |
| 212 | `"Redaguoti kolekciją"` | `"Edit Collection"` |
| 214 | `"Pakeiskite kolekcijos pavadinimą arba aprašymą."` | `"Change the collection name or description."` |
| 219 | `"Pavadinimas"` | `"Name"` |
| 224 | `"Kolekcijos pavadinimas"` | `"Collection name"` |
| 228 | `"Aprašymas"` | `"Description"` |
| 233 | `"Trumpas aprašymas"` | `"Short description"` |
| 239 | `"Atšaukti"` | `"Cancel"` |
| 242 | `"Saugoma..." / "Išsaugoti"` | `"Saving..." / "Save"` |

## Single File Change

**File:** `src/components/library/CollectionsView.tsx`

All 18 Lithuanian strings will be reverted to English. The edit/search functionality stays - only the language changes.

## Verification After Fix

1. Your main account Library → Collections tab shows English
2. All toasts show English messages
3. Edit dialog shows English labels
4. Search placeholder is in English
5. Empty states show English explanations

## Why This Happened

When adding the edit functionality to CollectionsView.tsx, I incorrectly wrote all new UI strings in Lithuanian instead of English. This was a mistake - UI code should always be in English (the app's base language). Account-specific data like option names can be in Lithuanian, but shared UI code must not be.

