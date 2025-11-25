
-- Enable mount_type and cell_size by creating template_option_settings entries
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled)
VALUES 
  ('224a0d67-a1bc-4c49-a9d8-0d3222e14813', '6c7542a0-75f4-42fa-97c9-503c5d8d34e1', true),  -- mount_type
  ('224a0d67-a1bc-4c49-a9d8-0d3222e14813', 'a48e2d77-fca7-44ff-8169-66939bbd9627', true)   -- cell_size
ON CONFLICT (template_id, treatment_option_id) DO UPDATE
SET is_enabled = true;

-- Enable the other options that are currently disabled
UPDATE template_option_settings
SET is_enabled = true
WHERE template_id = '224a0d67-a1bc-4c49-a9d8-0d3222e14813'
AND treatment_option_id IN (
  'e704f435-2781-4e14-813e-a3c1fac79c49',  -- operation
  '8e7edb8f-a4dd-47f1-bcad-8cc26cd8c0b2',  -- pleat_cell_size
  '8f7b089c-4eba-4ba9-ba9c-60cde88c7e64',  -- opacity
  '6cce9629-57a3-492a-9979-e298c8301ab9',  -- control_type
  '3d9f879a-04f4-44c3-9474-8092a0bca4a6'   -- motor_type
);
