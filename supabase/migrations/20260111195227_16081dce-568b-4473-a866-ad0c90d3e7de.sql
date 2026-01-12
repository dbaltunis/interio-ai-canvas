-- Phase 1.1: Add default_fullness to heading metadata for Homekaara
-- Based on CSV: Eyelet 2.0x, Rod Pocket 1.7x, Pleated 2.0x, Wave 2.5x, European 2.5x

UPDATE enhanced_inventory_items 
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{default_fullness}', '2.0')
WHERE id = '365210bd-8aae-4fc0-801f-0c02765c5e92'; -- Eyelet

UPDATE enhanced_inventory_items 
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{default_fullness}', '1.7')
WHERE id = '78fe81dd-491a-400a-a5f2-a9bf1374f66e'; -- Rod Pocket

UPDATE enhanced_inventory_items 
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{default_fullness}', '2.0')
WHERE id = 'eae74c2f-b2b6-4c2f-9846-b83b1801d2b1'; -- Pleated (with hooks)

UPDATE enhanced_inventory_items 
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{default_fullness}', '2.0')
WHERE id = 'a1b2c3d4-5e6f-7890-abcd-ef1234567890'; -- Pleated (with rings)

UPDATE enhanced_inventory_items 
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{default_fullness}', '2.5')
WHERE id = '293ff3e0-9e50-4867-9e9e-3182acfec238'; -- Wave

UPDATE enhanced_inventory_items 
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{default_fullness}', '2.5')
WHERE id = 'cb41129a-f72a-4a80-b86c-10e7a2caaae7'; -- European