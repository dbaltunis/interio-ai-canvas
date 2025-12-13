-- PHASE 3: Consolidate TWC color inventory - UNIVERSAL for all accounts
-- This is IDEMPOTENT - safe to run multiple times

-- First, let's update items that already have tags but need proper consolidation
-- For TWC items, the colors should already be in the tags array from the sync
-- We need to consolidate items that have the SAME base name (before " - ") into ONE item

-- Step 1: For items with " - " color suffix pattern, merge colors into the FIRST item per group
WITH color_groups AS (
    SELECT 
        user_id,
        -- Extract base name (product name without color suffix)
        regexp_replace(name, ' - [^-]+$', '') AS base_name,
        array_agg(id ORDER BY created_at ASC) AS item_ids,
        array_agg(DISTINCT 
            regexp_replace(name, '^.+ - ', '')
        ) AS extracted_colors
    FROM public.enhanced_inventory_items
    WHERE supplier = 'TWC'
        AND name LIKE '% - %'  -- Has color suffix
    GROUP BY user_id, regexp_replace(name, ' - [^-]+$', '')
    HAVING count(*) > 1  -- Only groups with duplicates
),
first_items AS (
    SELECT 
        cg.user_id,
        cg.base_name,
        cg.item_ids[1] AS first_id,
        cg.extracted_colors
    FROM color_groups cg
)
UPDATE public.enhanced_inventory_items e
SET 
    name = fi.base_name,
    tags = fi.extracted_colors
FROM first_items fi
WHERE e.id = fi.first_id;

-- Step 2: Delete the duplicate items (keep only first per group)
WITH color_groups AS (
    SELECT 
        user_id,
        regexp_replace(name, ' - [^-]+$', '') AS base_name,
        array_agg(id ORDER BY created_at ASC) AS item_ids
    FROM public.enhanced_inventory_items
    WHERE supplier = 'TWC'
        AND name LIKE '% - %'
    GROUP BY user_id, regexp_replace(name, ' - [^-]+$', '')
    HAVING count(*) > 1
)
DELETE FROM public.enhanced_inventory_items
WHERE id IN (
    SELECT unnest(item_ids[2:])  -- All items except first
    FROM color_groups
);