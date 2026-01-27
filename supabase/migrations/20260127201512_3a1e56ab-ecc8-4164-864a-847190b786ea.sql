-- Migration 2: Create 5 Treatment Options + 28 Option Values
-- Using user_id as account_id (FK references users table)

-- Option 1: Lamelių plotis (Slat Width)
INSERT INTO treatment_options (key, label, input_type, required, visible, order_index, treatment_category, account_id, source, template_id)
VALUES ('slat_width_gustin', 'Lamelių plotis', 'select', true, true, 1, 'venetian_blinds', '32a92783-f482-4e3d-8ebf-c292200674e5', 'user', '3c4d1b0f-c621-43ec-af72-c93644254fbd');

-- Option 2: Mechanizmo tipas (Mechanism Type)
INSERT INTO treatment_options (key, label, input_type, required, visible, order_index, treatment_category, account_id, source, template_id)
VALUES ('mechanism_type_gustin', 'Mechanizmo tipas', 'select', false, true, 2, 'venetian_blinds', '32a92783-f482-4e3d-8ebf-c292200674e5', 'user', '3c4d1b0f-c621-43ec-af72-c93644254fbd');

-- Option 3: Apdailos tipas (Finish Type)
INSERT INTO treatment_options (key, label, input_type, required, visible, order_index, treatment_category, account_id, source, template_id)
VALUES ('finish_type_gustin', 'Apdailos tipas', 'select', false, true, 3, 'venetian_blinds', '32a92783-f482-4e3d-8ebf-c292200674e5', 'user', '3c4d1b0f-c621-43ec-af72-c93644254fbd');

-- Option 4: Virvelių tipas (Cord Type)
INSERT INTO treatment_options (key, label, input_type, required, visible, order_index, treatment_category, account_id, source, template_id)
VALUES ('cord_type_gustin', 'Virvelių tipas', 'select', false, true, 4, 'venetian_blinds', '32a92783-f482-4e3d-8ebf-c292200674e5', 'user', '3c4d1b0f-c621-43ec-af72-c93644254fbd');

-- Option 5: Varpelių tipas (Cord Tips)
INSERT INTO treatment_options (key, label, input_type, required, visible, order_index, treatment_category, account_id, source, template_id)
VALUES ('cord_tips_gustin', 'Varpelių tipas', 'select', false, true, 5, 'venetian_blinds', '32a92783-f482-4e3d-8ebf-c292200674e5', 'user', '3c4d1b0f-c621-43ec-af72-c93644254fbd');