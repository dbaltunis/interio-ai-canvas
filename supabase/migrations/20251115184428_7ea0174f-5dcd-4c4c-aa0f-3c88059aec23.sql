-- Hide unwanted system default option types for curtains
-- Only keep Lining Types and Hardware visible by default

UPDATE option_type_categories
SET hidden_by_user = true
WHERE treatment_category = 'curtains' 
AND is_system_default = true
AND type_key IN ('bracket_type', 'fullness', 'heading_type', 'motor_type', 'track_type');