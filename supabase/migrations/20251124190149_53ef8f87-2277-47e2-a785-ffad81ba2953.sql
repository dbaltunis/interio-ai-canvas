-- Insert default inventory categories for all users who don't have them yet
DO $$
DECLARE
  v_user_id uuid;
  v_fabrics_id uuid;
  v_hard_id uuid;
  v_hardware_id uuid;
  v_wall_id uuid;
BEGIN
  FOR v_user_id IN SELECT id FROM auth.users LOOP
    IF EXISTS (SELECT 1 FROM inventory_categories WHERE user_id = v_user_id) THEN
      CONTINUE;
    END IF;
    
    -- Fabrics
    INSERT INTO inventory_categories (user_id, name, description, category_type, sort_order, parent_category_id)
    VALUES (v_user_id, 'Fabrics', 'Soft window covering fabrics', 'fabric', 1, NULL)
    RETURNING id INTO v_fabrics_id;
    
    INSERT INTO inventory_categories (user_id, name, description, category_type, sort_order, parent_category_id) VALUES
    (v_user_id, 'Curtain & Roman Fabrics', 'Linear meter/width pricing', 'fabric', 1, v_fabrics_id),
    (v_user_id, 'Roller - Blockout', 'Roller blind blockout fabrics', 'fabric', 2, v_fabrics_id),
    (v_user_id, 'Roller - Light Filtering', 'Roller blind light filtering', 'fabric', 3, v_fabrics_id),
    (v_user_id, 'Roller - Sunscreen', 'Roller blind sunscreen', 'fabric', 4, v_fabrics_id),
    (v_user_id, 'Roller - Translucent', 'Roller blind translucent', 'fabric', 5, v_fabrics_id),
    (v_user_id, 'Cellular/Honeycomb', 'Cellular shade fabrics', 'fabric', 6, v_fabrics_id),
    (v_user_id, 'Vertical Blind Fabrics', 'Vertical blind fabric vanes', 'fabric', 7, v_fabrics_id),
    (v_user_id, 'Panel Glide Fabrics', 'Panel track system fabrics', 'fabric', 8, v_fabrics_id),
    (v_user_id, 'Sheer & Voile', 'Sheer curtain fabrics', 'fabric', 9, v_fabrics_id),
    (v_user_id, 'Lining Fabrics', 'Curtain lining materials', 'fabric', 10, v_fabrics_id);
    
    -- Hard Coverings (using 'hardware' type)
    INSERT INTO inventory_categories (user_id, name, description, category_type, sort_order, parent_category_id)
    VALUES (v_user_id, 'Hard Coverings', 'Hard window covering materials and slats', 'hardware', 2, NULL)
    RETURNING id INTO v_hard_id;
    
    INSERT INTO inventory_categories (user_id, name, description, category_type, sort_order, parent_category_id) VALUES
    (v_user_id, 'Venetian - 25mm Aluminium', '25mm aluminium venetian slats', 'hardware', 1, v_hard_id),
    (v_user_id, 'Venetian - 50mm Aluminium', '50mm aluminium venetian slats', 'hardware', 2, v_hard_id),
    (v_user_id, 'Venetian - 50mm Wood', '50mm timber venetian slats', 'hardware', 3, v_hard_id),
    (v_user_id, 'Vertical - 89mm Vanes', '89mm vertical blind vanes', 'hardware', 4, v_hard_id),
    (v_user_id, 'Vertical - 127mm Vanes', '127mm vertical blind vanes', 'hardware', 5, v_hard_id),
    (v_user_id, 'Shutters - Timber', 'Timber plantation shutters', 'hardware', 6, v_hard_id),
    (v_user_id, 'Shutters - PVC', 'PVC plantation shutters', 'hardware', 7, v_hard_id),
    (v_user_id, 'Shutters - Aluminium', 'Aluminium shutters', 'hardware', 8, v_hard_id);
    
    -- Hardware & Accessories
    INSERT INTO inventory_categories (user_id, name, description, category_type, sort_order, parent_category_id)
    VALUES (v_user_id, 'Hardware', 'Tracks, rods, brackets, and accessories', 'hardware', 3, NULL)
    RETURNING id INTO v_hardware_id;
    
    INSERT INTO inventory_categories (user_id, name, description, category_type, sort_order, parent_category_id) VALUES
    (v_user_id, 'Tracks & Rails', 'Curtain tracks and blind rails', 'hardware', 1, v_hardware_id),
    (v_user_id, 'Rods & Poles', 'Curtain rods and decorative poles', 'hardware', 2, v_hardware_id),
    (v_user_id, 'Brackets & Accessories', 'Mounting brackets and hardware', 'hardware', 3, v_hardware_id),
    (v_user_id, 'Motors & Controls', 'Motorization and smart controls', 'hardware', 4, v_hardware_id);
    
    -- Wallcoverings
    INSERT INTO inventory_categories (user_id, name, description, category_type, sort_order, parent_category_id)
    VALUES (v_user_id, 'Wallcoverings', 'Wallpaper and wall covering materials', 'wallcovering', 4, NULL)
    RETURNING id INTO v_wall_id;
    
    INSERT INTO inventory_categories (user_id, name, description, category_type, sort_order, parent_category_id) VALUES
    (v_user_id, 'Vinyl Wallcoverings', 'Vinyl-based wallpapers', 'wallcovering', 1, v_wall_id),
    (v_user_id, 'Fabric Wallcoverings', 'Textile wallcoverings', 'wallcovering', 2, v_wall_id),
    (v_user_id, 'Grasscloth & Natural', 'Natural fiber wallcoverings', 'wallcovering', 3, v_wall_id);
  END LOOP;
END $$;