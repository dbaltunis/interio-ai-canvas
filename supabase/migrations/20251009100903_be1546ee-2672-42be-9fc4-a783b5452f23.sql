-- Step 1: Drop the existing foreign key constraint
ALTER TABLE treatment_options 
DROP CONSTRAINT IF EXISTS treatment_options_treatment_id_fkey;

-- Step 2: Make treatment_id nullable (for future use with individual treatments)
ALTER TABLE treatment_options 
ALTER COLUMN treatment_id DROP NOT NULL;

-- Step 3: Add template_id column to link to curtain_templates
ALTER TABLE treatment_options 
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES curtain_templates(id) ON DELETE CASCADE;

-- Step 4: Create default treatment options for all Venetian Blind templates
DO $$
DECLARE
    template_record RECORD;
    option_id_slat_size uuid;
    option_id_slat_material uuid;
    option_id_headrail_type uuid;
    option_id_control_type uuid;
    option_id_mount_type uuid;
BEGIN
    FOR template_record IN 
        SELECT id FROM curtain_templates 
        WHERE name LIKE '%Venetian%'
    LOOP
        -- Slat Size option
        INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
        VALUES (template_record.id, 'slat_size', 'Slat Size', 'select', true, true, 1)
        ON CONFLICT DO NOTHING
        RETURNING id INTO option_id_slat_size;

        IF option_id_slat_size IS NOT NULL THEN
            INSERT INTO option_values (option_id, code, label, order_index) VALUES 
            (option_id_slat_size, '25mm', '25mm Slats', 1),
            (option_id_slat_size, '50mm', '50mm Slats', 2),
            (option_id_slat_size, '63mm', '63mm Slat', 3)
            ON CONFLICT DO NOTHING;
        END IF;

        -- Slat Material option
        INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
        VALUES (template_record.id, 'slat_material', 'Slat Material', 'select', true, true, 2)
        ON CONFLICT DO NOTHING
        RETURNING id INTO option_id_slat_material;

        IF option_id_slat_material IS NOT NULL THEN
            INSERT INTO option_values (option_id, code, label, order_index) VALUES 
            (option_id_slat_material, 'aluminum', 'Aluminum', 1),
            (option_id_slat_material, 'wood', 'Wood', 2),
            (option_id_slat_material, 'faux_wood', 'Faux Wood', 3),
            (option_id_slat_material, 'timber', 'Timber', 4)
            ON CONFLICT DO NOTHING;
        END IF;

        -- Headrail Type option
        INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
        VALUES (template_record.id, 'headrail_type', 'Headrail Type', 'select', false, true, 3)
        ON CONFLICT DO NOTHING
        RETURNING id INTO option_id_headrail_type;

        IF option_id_headrail_type IS NOT NULL THEN
            INSERT INTO option_values (option_id, code, label, order_index) VALUES 
            (option_id_headrail_type, 'standard', 'Standard Headrail', 1)
            ON CONFLICT DO NOTHING;
            
            INSERT INTO option_values (option_id, code, label, order_index, extra_data) VALUES 
            (option_id_headrail_type, 'motor', 'Motorised Headrail', 2, '{"price": 150}'::jsonb)
            ON CONFLICT DO NOTHING;
        END IF;

        -- Control Type option
        INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
        VALUES (template_record.id, 'control_type', 'Control Type', 'select', true, true, 4)
        ON CONFLICT DO NOTHING
        RETURNING id INTO option_id_control_type;

        IF option_id_control_type IS NOT NULL THEN
            INSERT INTO option_values (option_id, code, label, order_index) VALUES 
            (option_id_control_type, 'wand', 'Wand Control', 1),
            (option_id_control_type, 'another_option', 'Another Option', 2)
            ON CONFLICT DO NOTHING;
        END IF;

        -- Mount Type option
        INSERT INTO treatment_options (template_id, key, label, input_type, required, visible, order_index)
        VALUES (template_record.id, 'mount_type', 'Mount Type', 'select', true, true, 5)
        ON CONFLICT DO NOTHING
        RETURNING id INTO option_id_mount_type;

        IF option_id_mount_type IS NOT NULL THEN
            INSERT INTO option_values (option_id, code, label, order_index) VALUES 
            (option_id_mount_type, 'outside_mount', 'Outside Mount', 1),
            (option_id_mount_type, 'inside_mount', 'Inside Mount', 2)
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;