
-- Remove CRM v2 related tables
DROP TABLE IF EXISTS public.crm_push_queue;
DROP TABLE IF EXISTS public.crm_sheet_links;
DROP TABLE IF EXISTS public.crm_accounts_v2;

-- Remove the mirror function that was created for CRM v2
DROP FUNCTION IF EXISTS public.mirror_crm_v2_to_legacy(uuid);
