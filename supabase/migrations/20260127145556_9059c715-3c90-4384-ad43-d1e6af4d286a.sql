-- Fix TWC heading_type options incorrectly marked as required
-- These should NOT block validation since heading is handled by the inventory selector
UPDATE treatment_options
SET required = false, updated_at = now()
WHERE source = 'twc'
  AND key LIKE 'heading_type%'
  AND required = true;