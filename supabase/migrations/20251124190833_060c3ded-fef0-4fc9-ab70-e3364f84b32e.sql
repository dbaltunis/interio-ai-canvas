-- Clean up all existing inventory categories
DELETE FROM inventory_categories;

-- Insert categories for all users
DO $$
DECLARE
    user_record RECORD;
    fabrics_id UUID;
    hard_coverings_id UUID;
    hardware_id UUID;
    wallcoverings_id UUID;
BEGIN
    -- Loop through all users
    FOR user_record IN SELECT DISTINCT user_id FROM business_settings
    LOOP
        -- Insert main categories
        INSERT INTO inventory_categories (user_id, name, category_type, parent_category_id)
        VALUES (user_record.user_id, 'Fabrics', 'fabric', NULL)
        RETURNING id INTO fabrics_id;
        
        INSERT INTO inventory_categories (user_id, name, category_type, parent_category_id)
        VALUES (user_record.user_id, 'Hard Coverings', 'hardware', NULL)
        RETURNING id INTO hard_coverings_id;
        
        INSERT INTO inventory_categories (user_id, name, category_type, parent_category_id)
        VALUES (user_record.user_id, 'Hardware', 'hardware', NULL)
        RETURNING id INTO hardware_id;
        
        INSERT INTO inventory_categories (user_id, name, category_type, parent_category_id)
        VALUES (user_record.user_id, 'Wallcoverings', 'wallcovering', NULL)
        RETURNING id INTO wallcoverings_id;
        
        -- Insert Fabrics subcategories
        INSERT INTO inventory_categories (user_id, name, category_type, parent_category_id) VALUES
        (user_record.user_id, 'Curtain & Roman Fabrics', 'fabric', fabrics_id),
        (user_record.user_id, 'Roller Blind Fabrics', 'fabric', fabrics_id),
        (user_record.user_id, 'Cellular/Honeycomb Fabrics', 'fabric', fabrics_id),
        (user_record.user_id, 'Vertical Blind Fabrics', 'fabric', fabrics_id),
        (user_record.user_id, 'Panel Glide Fabrics', 'fabric', fabrics_id),
        (user_record.user_id, 'Awning Fabrics', 'fabric', fabrics_id),
        (user_record.user_id, 'Sheer Fabrics', 'fabric', fabrics_id),
        (user_record.user_id, 'Lining Fabrics', 'fabric', fabrics_id),
        (user_record.user_id, 'Upholstery Fabrics', 'fabric', fabrics_id);
        
        -- Insert Hard Coverings subcategories
        INSERT INTO inventory_categories (user_id, name, category_type, parent_category_id) VALUES
        (user_record.user_id, 'Venetian Blinds - Wood', 'hardware', hard_coverings_id),
        (user_record.user_id, 'Venetian Blinds - Aluminum', 'hardware', hard_coverings_id),
        (user_record.user_id, 'Vertical Blinds - PVC', 'hardware', hard_coverings_id),
        (user_record.user_id, 'Shutters - Wood', 'hardware', hard_coverings_id),
        (user_record.user_id, 'Shutters - PVC', 'hardware', hard_coverings_id);
        
        -- Insert Hardware subcategories
        INSERT INTO inventory_categories (user_id, name, category_type, parent_category_id) VALUES
        (user_record.user_id, 'Tracks & Rails', 'hardware', hardware_id),
        (user_record.user_id, 'Rods & Finials', 'hardware', hardware_id),
        (user_record.user_id, 'Brackets & Fittings', 'hardware', hardware_id),
        (user_record.user_id, 'Motors & Automation', 'hardware', hardware_id),
        (user_record.user_id, 'Chains & Cords', 'hardware', hardware_id),
        (user_record.user_id, 'Tiebacks & Holdbacks', 'hardware', hardware_id);
        
        -- Insert Wallcoverings subcategories
        INSERT INTO inventory_categories (user_id, name, category_type, parent_category_id) VALUES
        (user_record.user_id, 'Vinyl Wallcoverings', 'wallcovering', wallcoverings_id),
        (user_record.user_id, 'Fabric Wallcoverings', 'wallcovering', wallcoverings_id),
        (user_record.user_id, 'Textured Wallcoverings', 'wallcovering', wallcoverings_id),
        (user_record.user_id, 'Commercial Wallcoverings', 'wallcovering', wallcoverings_id);
    END LOOP;
END $$;