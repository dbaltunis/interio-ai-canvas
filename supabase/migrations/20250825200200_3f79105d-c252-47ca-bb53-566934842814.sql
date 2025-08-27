-- Add pricing_settings to business_settings table
ALTER TABLE public.business_settings 
ADD COLUMN pricing_settings JSONB DEFAULT '{
  "default_markup_percentage": 50,
  "labor_markup_percentage": 30,
  "material_markup_percentage": 40,
  "category_markups": {
    "fabric": 45,
    "hardware": 35,
    "installation": 25,
    "curtains": 50,
    "blinds": 45,
    "shutters": 55
  },
  "minimum_markup_percentage": 20,
  "dynamic_pricing_enabled": false,
  "quantity_discounts_enabled": false,
  "show_markup_to_staff": false
}'::jsonb;