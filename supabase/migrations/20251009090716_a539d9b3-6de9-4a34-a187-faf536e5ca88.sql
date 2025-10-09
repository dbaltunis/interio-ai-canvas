-- Seed default treatment options for all blind types
-- These will be pre-selected when users clone system templates

-- Get the first user ID to use as the user_id for these system-wide options
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found to assign system treatment options';
  END IF;

  -- Cellular Shades options
  INSERT INTO enhanced_inventory_items (
    user_id, category, name, description, treatment_type, 
    cost_price, selling_price, active, created_at, updated_at
  ) VALUES
    -- Cell Types
    (first_user_id, 'treatment_option', 'Single Cell', '{"option_type": "cell_type", "option_value": "single"}', 'cellular_shade', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Double Cell', '{"option_type": "cell_type", "option_value": "double"}', 'cellular_shade', 0, 0, true, now(), now()),
    -- Mounting Options
    (first_user_id, 'treatment_option', 'Inside Mount', '{"option_type": "mounting", "option_value": "inside"}', 'cellular_shade', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Outside Mount', '{"option_type": "mounting", "option_value": "outside"}', 'cellular_shade', 0, 0, true, now(), now()),
    -- Control Types
    (first_user_id, 'treatment_option', 'Cordless', '{"option_type": "control", "option_value": "cordless"}', 'cellular_shade', 0, 5, true, now(), now()),
    (first_user_id, 'treatment_option', 'Continuous Cord Loop', '{"option_type": "control", "option_value": "cord_loop"}', 'cellular_shade', 0, 0, true, now(), now()),

  -- Roller Blinds options
    -- Fabric Types
    (first_user_id, 'treatment_option', 'Light Filtering', '{"option_type": "fabric_type", "option_value": "light_filtering"}', 'roller_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Blockout', '{"option_type": "fabric_type", "option_value": "blockout"}', 'roller_blind', 0, 5, true, now(), now()),
    (first_user_id, 'treatment_option', 'Sunscreen', '{"option_type": "fabric_type", "option_value": "sunscreen"}', 'roller_blind', 0, 3, true, now(), now()),
    -- Tube Sizes
    (first_user_id, 'treatment_option', '32mm Tube', '{"option_type": "tube_size", "option_value": "32mm"}', 'roller_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', '45mm Tube', '{"option_type": "tube_size", "option_value": "45mm"}', 'roller_blind', 0, 5, true, now(), now()),
    -- Control Types
    (first_user_id, 'treatment_option', 'Chain Control', '{"option_type": "control", "option_value": "chain"}', 'roller_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Spring Loaded', '{"option_type": "control", "option_value": "spring"}', 'roller_blind', 0, 8, true, now(), now()),
    (first_user_id, 'treatment_option', 'Motorized', '{"option_type": "control", "option_value": "motorized"}', 'roller_blind', 0, 150, true, now(), now()),

  -- Roman Blinds options
    -- Fold Styles
    (first_user_id, 'treatment_option', 'Flat Fold', '{"option_type": "fold_style", "option_value": "flat"}', 'roman_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Cascade Fold', '{"option_type": "fold_style", "option_value": "cascade"}', 'roman_blind', 0, 15, true, now(), now()),
    (first_user_id, 'treatment_option', 'Hobbled Fold', '{"option_type": "fold_style", "option_value": "hobbled"}', 'roman_blind', 0, 25, true, now(), now()),
    -- Lining Options
    (first_user_id, 'treatment_option', 'Unlined', '{"option_type": "lining", "option_value": "none"}', 'roman_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Standard Lining', '{"option_type": "lining", "option_value": "standard"}', 'roman_blind', 0, 12, true, now(), now()),
    (first_user_id, 'treatment_option', 'Blockout Lining', '{"option_type": "lining", "option_value": "blockout"}', 'roman_blind', 0, 18, true, now(), now()),
    -- Control Types
    (first_user_id, 'treatment_option', 'Cord Control', '{"option_type": "control", "option_value": "cord"}', 'roman_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Chain Control', '{"option_type": "control", "option_value": "chain"}', 'roman_blind', 0, 5, true, now(), now()),

  -- Venetian Blinds options
    -- Slat Sizes
    (first_user_id, 'treatment_option', '25mm Slats', '{"option_type": "slat_size", "option_value": "25mm"}', 'venetian_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', '50mm Slats', '{"option_type": "slat_size", "option_value": "50mm"}', 'venetian_blind', 0, 5, true, now(), now()),
    -- Materials
    (first_user_id, 'treatment_option', 'Aluminum', '{"option_type": "material", "option_value": "aluminum"}', 'venetian_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Wood', '{"option_type": "material", "option_value": "wood"}', 'venetian_blind', 0, 25, true, now(), now()),
    (first_user_id, 'treatment_option', 'Faux Wood', '{"option_type": "material", "option_value": "faux_wood"}', 'venetian_blind', 0, 15, true, now(), now()),
    -- Control Types
    (first_user_id, 'treatment_option', 'Wand Control', '{"option_type": "control", "option_value": "wand"}', 'venetian_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Cord & Tilt', '{"option_type": "control", "option_value": "cord_tilt"}', 'venetian_blind', 0, 0, true, now(), now()),

  -- Vertical Blinds options
    -- Louvre Widths
    (first_user_id, 'treatment_option', '89mm Louvres', '{"option_type": "louvre_width", "option_value": "89mm"}', 'vertical_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', '127mm Louvres', '{"option_type": "louvre_width", "option_value": "127mm"}', 'vertical_blind', 0, 5, true, now(), now()),
    -- Materials
    (first_user_id, 'treatment_option', 'Fabric Louvres', '{"option_type": "material", "option_value": "fabric"}', 'vertical_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'PVC Louvres', '{"option_type": "material", "option_value": "pvc"}', 'vertical_blind', 0, -5, true, now(), now()),
    -- Control Types
    (first_user_id, 'treatment_option', 'Wand Control', '{"option_type": "control", "option_value": "wand"}', 'vertical_blind', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Cord Control', '{"option_type": "control", "option_value": "cord"}', 'vertical_blind', 0, 0, true, now(), now()),

  -- Panel Glide options
    -- Track Types
    (first_user_id, 'treatment_option', '2 Panel Track', '{"option_type": "track_type", "option_value": "2_panel"}', 'panel_glide', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', '3 Panel Track', '{"option_type": "track_type", "option_value": "3_panel"}', 'panel_glide', 0, 15, true, now(), now()),
    (first_user_id, 'treatment_option', '4 Panel Track', '{"option_type": "track_type", "option_value": "4_panel"}', 'panel_glide', 0, 25, true, now(), now()),
    -- Control Types
    (first_user_id, 'treatment_option', 'Manual Track', '{"option_type": "control", "option_value": "manual"}', 'panel_glide', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Motorized Track', '{"option_type": "control", "option_value": "motorized"}', 'panel_glide', 0, 200, true, now(), now()),

  -- Plantation Shutters options
    -- Louvre Sizes
    (first_user_id, 'treatment_option', '63mm Louvres', '{"option_type": "louvre_size", "option_value": "63mm"}', 'plantation_shutter', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', '89mm Louvres', '{"option_type": "louvre_size", "option_value": "89mm"}', 'plantation_shutter', 0, 25, true, now(), now()),
    (first_user_id, 'treatment_option', '114mm Louvres', '{"option_type": "louvre_size", "option_value": "114mm"}', 'plantation_shutter', 0, 40, true, now(), now()),
    -- Materials
    (first_user_id, 'treatment_option', 'Basswood', '{"option_type": "material", "option_value": "basswood"}', 'plantation_shutter', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'PVC', '{"option_type": "material", "option_value": "pvc"}', 'plantation_shutter', 0, -50, true, now(), now()),
    (first_user_id, 'treatment_option', 'Aluminum', '{"option_type": "material", "option_value": "aluminum"}', 'plantation_shutter', 0, -20, true, now(), now()),
    -- Frame Types
    (first_user_id, 'treatment_option', 'Standard Frame', '{"option_type": "frame_type", "option_value": "standard"}', 'plantation_shutter', 0, 0, true, now(), now()),
    (first_user_id, 'treatment_option', 'Z-Frame', '{"option_type": "frame_type", "option_value": "z_frame"}', 'plantation_shutter', 0, 30, true, now(), now())
  ON CONFLICT DO NOTHING;
END $$;

-- Update system templates with pre-selected default options based on their treatment type
DO $$
DECLARE
  template_rec RECORD;
  option_ids uuid[];
BEGIN
  FOR template_rec IN 
    SELECT id, curtain_type, name FROM curtain_templates WHERE is_system_default = true
  LOOP
    -- Get option IDs for this treatment type
    SELECT array_agg(id) INTO option_ids
    FROM enhanced_inventory_items
    WHERE treatment_type = template_rec.curtain_type
      AND category = 'treatment_option'
      AND active = true;
    
    -- Update template with these option IDs if any were found
    IF option_ids IS NOT NULL AND array_length(option_ids, 1) > 0 THEN
      UPDATE curtain_templates
      SET compatible_hardware = option_ids,
          updated_at = now()
      WHERE id = template_rec.id;
      
      RAISE NOTICE 'Updated template % with % options', template_rec.name, array_length(option_ids, 1);
    END IF;
  END LOOP;
END $$;