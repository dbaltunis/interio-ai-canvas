-- Standardize option_type_categories to use PLURAL treatment_category names
UPDATE option_type_categories SET treatment_category = 'roller_blinds' WHERE treatment_category = 'roller_blind';
UPDATE option_type_categories SET treatment_category = 'roman_blinds' WHERE treatment_category = 'roman_blind';
UPDATE option_type_categories SET treatment_category = 'venetian_blinds' WHERE treatment_category = 'venetian_blind';
UPDATE option_type_categories SET treatment_category = 'vertical_blinds' WHERE treatment_category = 'vertical_blind';
UPDATE option_type_categories SET treatment_category = 'cellular_blinds' WHERE treatment_category IN ('cellular_shade', 'cellular_shades');
UPDATE option_type_categories SET treatment_category = 'plantation_shutters' WHERE treatment_category = 'plantation_shutter';
UPDATE option_type_categories SET treatment_category = 'shutters' WHERE treatment_category = 'shutter';
UPDATE option_type_categories SET treatment_category = 'awning' WHERE treatment_category = 'awnings';
UPDATE option_type_categories SET treatment_category = 'panel_glide' WHERE treatment_category = 'panel_glides';
UPDATE option_type_categories SET treatment_category = 'curtains' WHERE treatment_category = 'curtain';