-- Rename headings for clarity per user specification

-- Pleated → Pleated (with hooks)
UPDATE enhanced_inventory_items 
SET name = 'Pleated (with hooks)'
WHERE id = 'eae74c2f-b2b6-4c2f-9846-b83b1801d2b1';

-- Wave pleate → Wave
UPDATE enhanced_inventory_items 
SET name = 'Wave'
WHERE id = '293ff3e0-9e50-4867-9e9e-3182acfec238';

-- European Pleat → European
UPDATE enhanced_inventory_items 
SET name = 'European'
WHERE id = 'cb41129a-f72a-4a80-b86c-10e7a2caaae7';