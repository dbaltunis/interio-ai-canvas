-- Fix roller blind template by clearing treatment_category so it uses curtain_type for detection
UPDATE curtain_templates 
SET treatment_category = NULL
WHERE id = '22b27af6-aa64-4bde-a22b-d0ea0a3ee81a';