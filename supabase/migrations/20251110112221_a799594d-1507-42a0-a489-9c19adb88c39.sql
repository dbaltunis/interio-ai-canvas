-- Enable public access to published online stores
CREATE POLICY "Public stores are viewable by everyone"
ON online_stores FOR SELECT
USING (is_published = true);

-- Enable public access to active pages of published stores
CREATE POLICY "Active pages of published stores are viewable"
ON store_pages FOR SELECT
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM online_stores 
    WHERE online_stores.id = store_pages.store_id 
    AND online_stores.is_published = true
  )
);

-- Enable public access to store templates
CREATE POLICY "Store templates are viewable by everyone"
ON store_templates FOR SELECT
USING (true);

-- Enable public access to visible products in published stores
CREATE POLICY "Visible products in published stores are viewable"
ON store_product_visibility FOR SELECT
USING (
  is_visible = true 
  AND EXISTS (
    SELECT 1 FROM online_stores 
    WHERE online_stores.id = store_product_visibility.store_id 
    AND online_stores.is_published = true
  )
);

-- Enable public access to store inquiries (for creating)
CREATE POLICY "Anyone can create store inquiries"
ON store_inquiries FOR INSERT
WITH CHECK (true);

-- Enable public access to category settings for published stores
CREATE POLICY "Category settings for published stores are viewable"
ON store_category_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM online_stores 
    WHERE online_stores.id = store_category_settings.store_id 
    AND online_stores.is_published = true
  )
);