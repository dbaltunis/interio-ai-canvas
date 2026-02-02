-- Drop the broken trigger from auth.users that references non-existent columns
DROP TRIGGER IF EXISTS on_auth_user_created_shopify_statuses ON auth.users;

-- Update the function to work with user_profiles table (where role and parent_account_id exist)
CREATE OR REPLACE FUNCTION public.create_default_shopify_statuses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create for account owners (not team members)
  IF NEW.role IN ('Owner', 'System Owner') 
     AND (NEW.parent_account_id IS NULL OR NEW.role = 'System Owner') THEN
    
    -- Check if statuses already exist
    IF NOT EXISTS (SELECT 1 FROM shopify_sync_statuses WHERE user_id = NEW.user_id) THEN
      INSERT INTO shopify_sync_statuses (user_id, job_status, quote_status, is_active, created_at, updated_at)
      VALUES 
        (NEW.user_id, 'quote-pending', 'pending', true, NOW(), NOW()),
        (NEW.user_id, 'quote-draft', 'draft', true, NOW(), NOW()),
        (NEW.user_id, 'quote-sent', 'accepted', true, NOW(), NOW()),
        (NEW.user_id, 'order-confirmed', 'accepted', true, NOW(), NOW()),
        (NEW.user_id, 'completed', 'accepted', true, NOW(), NOW());
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger on user_profiles instead (where role and parent_account_id columns exist)
DROP TRIGGER IF EXISTS on_user_profile_created_shopify_statuses ON public.user_profiles;
CREATE TRIGGER on_user_profile_created_shopify_statuses
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_shopify_statuses();