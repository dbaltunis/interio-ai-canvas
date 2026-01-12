-- Fix Issue 2: Delete the 4 incorrect tieback option_values added on Jan 11
DELETE FROM option_values WHERE id IN (
  '6952d190-454a-4fbe-9f66-ed324527681d',  -- Decorative Hook
  '587cb5b1-5860-4fb2-af7c-68875096e90d',  -- Holdback
  '78e334b2-943c-45bd-a6d2-585e1f7b337b',  -- None (duplicate)
  '7574be5b-14ea-469a-92b3-c7c7f017c06c'   -- Standard Hook
);