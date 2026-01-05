-- Fix the seed_account_options function to use correct column names
CREATE OR REPLACE FUNCTION seed_account_options(target_account_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if account already has treatment options
  IF EXISTS (SELECT 1 FROM treatment_options WHERE account_id = target_account_id LIMIT 1) THEN
    RETURN; -- Already seeded
  END IF;

  -- Insert basic treatment options for all new accounts using correct column names
  INSERT INTO treatment_options (account_id, treatment_category, key, label, input_type, order_index, required, visible)
  VALUES
    (target_account_id, 'all', 'control_type', 'Control Type', 'select', 1, false, true),
    (target_account_id, 'all', 'control_side', 'Control Side', 'select', 2, false, true),
    (target_account_id, 'all', 'mount_type', 'Mount Type', 'select', 3, false, true),
    (target_account_id, 'roller', 'roll_direction', 'Roll Direction', 'select', 4, false, true),
    (target_account_id, 'roller', 'headrail', 'Headrail Selection', 'select', 5, false, true),
    (target_account_id, 'roller', 'bottom_bar', 'Bottom Bar', 'select', 6, false, true),
    (target_account_id, 'curtain', 'heading_type', 'Heading Type', 'select', 1, false, true),
    (target_account_id, 'curtain', 'lining', 'Lining', 'select', 2, false, true),
    (target_account_id, 'curtain', 'track_type', 'Track Type', 'select', 3, false, true),
    (target_account_id, 'venetian', 'slat_size', 'Slat Size', 'select', 1, false, true),
    (target_account_id, 'venetian', 'tilt_control', 'Tilt Control', 'select', 2, false, true),
    (target_account_id, 'vertical', 'vane_width', 'Vane Width', 'select', 1, false, true),
    (target_account_id, 'vertical', 'draw_type', 'Draw Type', 'select', 2, false, true),
    (target_account_id, 'cellular', 'cell_size', 'Cell Size', 'select', 1, false, true),
    (target_account_id, 'cellular', 'opacity', 'Opacity', 'select', 2, false, true),
    (target_account_id, 'roman', 'fold_style', 'Fold Style', 'select', 1, false, true),
    (target_account_id, 'roman', 'lining', 'Lining', 'select', 2, false, true),
    (target_account_id, 'shutter', 'blade_size', 'Blade Size', 'select', 1, false, true),
    (target_account_id, 'shutter', 'frame_style', 'Frame Style', 'select', 2, false, true);
END;
$$;