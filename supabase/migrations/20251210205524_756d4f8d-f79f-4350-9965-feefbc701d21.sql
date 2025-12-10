-- Fix existing quote_templates with empty totals block content
-- Add showSubtotal, showTax, showTotal = true by default
UPDATE quote_templates
SET blocks = (
  SELECT jsonb_agg(
    CASE 
      WHEN block->>'type' = 'totals' AND (block->'content' IS NULL OR block->'content' = '{}'::jsonb OR NOT (block->'content' ? 'showTax')) THEN
        jsonb_set(
          block, 
          '{content}', 
          COALESCE(block->'content', '{}'::jsonb) || '{"showSubtotal": true, "showTax": true, "showTotal": true}'::jsonb
        )
      ELSE block
    END
  )
  FROM jsonb_array_elements(blocks) AS block
)
WHERE blocks @> '[{"type": "totals"}]';