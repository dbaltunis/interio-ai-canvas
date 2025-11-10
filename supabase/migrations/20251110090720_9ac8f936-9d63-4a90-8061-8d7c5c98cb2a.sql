-- Create function to delete online store and all related data
CREATE OR REPLACE FUNCTION public.delete_online_store(store_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete related data first (foreign key constraints)
  DELETE FROM store_category_settings WHERE store_id = store_id_param;
  DELETE FROM store_product_visibility WHERE store_id = store_id_param;
  DELETE FROM store_inquiries WHERE store_id = store_id_param;
  DELETE FROM store_pages WHERE store_id = store_id_param;
  
  -- Delete the store itself
  DELETE FROM online_stores WHERE id = store_id_param;
  
  RAISE NOTICE 'Online store % and all related data deleted', store_id_param;
END;
$function$;

-- Delete the existing store (ID from console logs)
SELECT public.delete_online_store('8b12e175-f45e-42d8-883a-7d71bd5d08f8'::uuid);