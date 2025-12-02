-- =============================================
-- CRITICAL SECURITY FIX: Google Calendar Sync Events
-- =============================================

-- Drop the dangerous policy that allows unrestricted access
DROP POLICY IF EXISTS "System can manage sync events" ON google_calendar_sync_events;

-- Add proper INSERT policy - users can only insert for their own integrations
CREATE POLICY "Users can insert their own sync events" 
ON google_calendar_sync_events 
FOR INSERT 
WITH CHECK (
  integration_id IN (
    SELECT id FROM integration_settings WHERE user_id = auth.uid()
  )
);

-- Add proper UPDATE policy
CREATE POLICY "Users can update their own sync events" 
ON google_calendar_sync_events 
FOR UPDATE 
USING (
  integration_id IN (
    SELECT id FROM integration_settings WHERE user_id = auth.uid()
  )
);

-- Add proper DELETE policy
CREATE POLICY "Users can delete their own sync events" 
ON google_calendar_sync_events 
FOR DELETE 
USING (
  integration_id IN (
    SELECT id FROM integration_settings WHERE user_id = auth.uid()
  )
);

-- =============================================
-- CRITICAL SECURITY FIX: Online Stores
-- =============================================

-- Drop duplicate public policy (keep one properly scoped)
DROP POLICY IF EXISTS "Public stores are viewable by everyone" ON online_stores;

-- Create a secure view for public store access that excludes sensitive data
CREATE OR REPLACE VIEW public_store_info AS
SELECT 
  id,
  store_name,
  store_slug,
  logo_url,
  primary_color,
  secondary_color,
  accent_color,
  font_family,
  template_id,
  seo_title,
  seo_description,
  is_published,
  created_at,
  updated_at
FROM online_stores
WHERE is_published = true;

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public_store_info TO anon;
GRANT SELECT ON public_store_info TO authenticated;

-- =============================================
-- MEDIUM PRIORITY: Store Pages cleanup
-- =============================================

-- Drop duplicate policy on store_pages
DROP POLICY IF EXISTS "Public pages are viewable by everyone" ON store_pages;

-- =============================================
-- MEDIUM PRIORITY: Store Product Visibility - restrict to visible products only
-- =============================================

-- Drop overly permissive public policy
DROP POLICY IF EXISTS "Public can view visible products" ON store_product_visibility;

-- Create properly scoped policy that only shows visible products
CREATE POLICY "Public can view visible products in published stores" 
ON store_product_visibility 
FOR SELECT 
USING (
  is_visible = true 
  AND store_id IN (
    SELECT id FROM online_stores WHERE is_published = true
  )
);