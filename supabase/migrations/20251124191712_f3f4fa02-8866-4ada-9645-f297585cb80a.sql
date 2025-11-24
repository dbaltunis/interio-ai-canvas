-- Rollback: Remove the inventory_categories integration from the dashboard
-- The old system used simple string-based categories, which works perfectly

-- We're NOT deleting the table itself, just removing all the migrated categories
-- This allows users to go back to the simple hardcoded subcategory system

DELETE FROM inventory_categories WHERE created_at >= '2025-11-24';