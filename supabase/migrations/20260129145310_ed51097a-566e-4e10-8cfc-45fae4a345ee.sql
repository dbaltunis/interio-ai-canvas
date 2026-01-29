-- =====================================================
-- Fix Security Definer Functions - Add SET search_path = public
-- This prevents search_path manipulation attacks
-- =====================================================

-- 1. create_default_shopify_statuses
CREATE OR REPLACE FUNCTION public.create_default_shopify_statuses()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. ensure_shopify_statuses
CREATE OR REPLACE FUNCTION public.ensure_shopify_statuses()
RETURNS TRIGGER AS $$
BEGIN
  -- Same logic as create_default_shopify_statuses
  IF NEW.role IN ('Owner', 'System Owner') 
     AND (NEW.parent_account_id IS NULL OR NEW.role = 'System Owner') THEN
    
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. generate_batch_number
CREATE OR REPLACE FUNCTION public.generate_batch_number()
RETURNS TEXT AS $$
DECLARE
  new_batch_number TEXT;
  current_count INTEGER;
BEGIN
  -- Get the current count for today
  SELECT COUNT(*) + 1 INTO current_count
  FROM batch_orders
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Generate batch number in format: BATCH-YYYYMMDD-XXXX
  new_batch_number := 'BATCH-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(current_count::TEXT, 4, '0');
  
  RETURN new_batch_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. notify_owner_on_project_creation
CREATE OR REPLACE FUNCTION public.notify_owner_on_project_creation()
RETURNS TRIGGER AS $$
DECLARE
  effective_owner_id UUID;
  creator_name TEXT;
BEGIN
  -- Get the effective account owner
  effective_owner_id := public.get_effective_account_owner(NEW.user_id);
  
  -- Only notify if the creator is not the owner
  IF effective_owner_id IS NOT NULL AND effective_owner_id != NEW.user_id THEN
    -- Get creator's name
    SELECT COALESCE(display_name, first_name, 'Team member') INTO creator_name
    FROM user_profiles
    WHERE user_id = NEW.user_id;
    
    -- Create notification for owner
    INSERT INTO notifications (user_id, type, title, message, action_url)
    VALUES (
      effective_owner_id,
      'info',
      'New Project Created',
      creator_name || ' created a new project: ' || COALESCE(NEW.project_name, 'Untitled'),
      '/?jobId=' || NEW.id::TEXT
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. seed_default_client_stages
CREATE OR REPLACE FUNCTION public.seed_default_client_stages()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IN ('Owner', 'System Owner') 
     AND (NEW.parent_account_id IS NULL OR NEW.role = 'System Owner') THEN
    IF NOT EXISTS (SELECT 1 FROM client_stages WHERE user_id = NEW.user_id) THEN
      INSERT INTO client_stages (user_id, slot_number, name, label, color, is_default, is_active)
      VALUES 
        (NEW.user_id, 1, 'New Lead', 'new', '#3B82F6', true, true),
        (NEW.user_id, 2, 'Contacted', 'contacted', '#8B5CF6', false, true),
        (NEW.user_id, 3, 'Qualified', 'qualified', '#10B981', false, true),
        (NEW.user_id, 4, 'Proposal Sent', 'proposal', '#F59E0B', false, true),
        (NEW.user_id, 5, 'Negotiating', 'negotiating', '#EF4444', false, true),
        (NEW.user_id, 6, 'Won', 'won', '#22C55E', false, true),
        (NEW.user_id, 7, 'Lost', 'lost', '#6B7280', false, true),
        (NEW.user_id, 8, 'Inactive', 'inactive', '#9CA3AF', false, true);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. seed_default_email_templates
CREATE OR REPLACE FUNCTION public.seed_default_email_templates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IN ('Owner', 'System Owner') 
     AND (NEW.parent_account_id IS NULL OR NEW.role = 'System Owner') THEN
    IF NOT EXISTS (SELECT 1 FROM email_templates WHERE user_id = NEW.user_id) THEN
      INSERT INTO email_templates (user_id, name, subject, body, category, is_default)
      VALUES 
        (NEW.user_id, 'Quote Follow-up', 'Following up on your quote', 'Hi {{client_name}},\n\nI wanted to follow up on the quote I sent you recently. Please let me know if you have any questions.\n\nBest regards', 'follow_up', true),
        (NEW.user_id, 'Thank You', 'Thank you for your business', 'Dear {{client_name}},\n\nThank you for choosing us for your project. We appreciate your business!\n\nBest regards', 'thank_you', true),
        (NEW.user_id, 'Appointment Reminder', 'Reminder: Upcoming Appointment', 'Hi {{client_name}},\n\nThis is a reminder about your upcoming appointment.\n\nLooking forward to seeing you!', 'reminder', true);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. seed_default_job_statuses
CREATE OR REPLACE FUNCTION public.seed_default_job_statuses()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IN ('Owner', 'System Owner') 
     AND (NEW.parent_account_id IS NULL OR NEW.role = 'System Owner') THEN
    IF NOT EXISTS (SELECT 1 FROM job_status_slots WHERE user_id = NEW.user_id) THEN
      INSERT INTO job_status_slots (user_id, slot_number, status_code, display_name, color, is_active, is_terminal, description)
      VALUES 
        (NEW.user_id, 1, 'quote-pending', 'Quote Pending', '#FCD34D', true, false, 'Quote is being prepared'),
        (NEW.user_id, 2, 'quote-draft', 'Quote Draft', '#A78BFA', true, false, 'Quote draft ready for review'),
        (NEW.user_id, 3, 'quote-sent', 'Quote Sent', '#60A5FA', true, false, 'Quote has been sent to client'),
        (NEW.user_id, 4, 'order-confirmed', 'Order Confirmed', '#34D399', true, false, 'Client has confirmed the order'),
        (NEW.user_id, 5, 'in-production', 'In Production', '#F97316', true, false, 'Order is being manufactured'),
        (NEW.user_id, 6, 'ready-for-install', 'Ready for Install', '#8B5CF6', true, false, 'Ready for installation'),
        (NEW.user_id, 7, 'completed', 'Completed', '#22C55E', true, true, 'Project completed'),
        (NEW.user_id, 8, 'on-hold', 'On Hold', '#6B7280', true, false, 'Project is on hold');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. seed_default_quote_template  
CREATE OR REPLACE FUNCTION public.seed_default_quote_template()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IN ('Owner', 'System Owner') 
     AND (NEW.parent_account_id IS NULL OR NEW.role = 'System Owner') THEN
    IF NOT EXISTS (SELECT 1 FROM quote_templates WHERE user_id = NEW.user_id) THEN
      INSERT INTO quote_templates (
        user_id, 
        name, 
        is_default, 
        header_content, 
        footer_content, 
        show_line_items, 
        show_measurements, 
        show_images,
        show_unit_prices,
        show_subtotals,
        template_data
      )
      VALUES (
        NEW.user_id,
        'Default Quote Template',
        true,
        'Thank you for the opportunity to provide this quotation.',
        'This quote is valid for 30 days from the date of issue. Terms and conditions apply.',
        true,
        true,
        true,
        true,
        true,
        '{}'::jsonb
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. update_client_updated_at
CREATE OR REPLACE FUNCTION public.update_client_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. update_project_updated_at
CREATE OR REPLACE FUNCTION public.update_project_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. update_quote_updated_at
CREATE OR REPLACE FUNCTION public.update_quote_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 12. update_room_updated_at
CREATE OR REPLACE FUNCTION public.update_room_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 13. update_surface_updated_at
CREATE OR REPLACE FUNCTION public.update_surface_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 14. update_treatment_updated_at
CREATE OR REPLACE FUNCTION public.update_treatment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 15. update_vendor_updated_at
CREATE OR REPLACE FUNCTION public.update_vendor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 16. handle_inventory_movement
CREATE OR REPLACE FUNCTION public.handle_inventory_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the stock level on the inventory item
  IF NEW.movement_type = 'in' THEN
    UPDATE enhanced_inventory_items 
    SET stock_on_hand = COALESCE(stock_on_hand, 0) + NEW.quantity
    WHERE id = NEW.item_id;
  ELSIF NEW.movement_type = 'out' THEN
    UPDATE enhanced_inventory_items 
    SET stock_on_hand = COALESCE(stock_on_hand, 0) - NEW.quantity
    WHERE id = NEW.item_id;
  ELSIF NEW.movement_type = 'adjustment' THEN
    UPDATE enhanced_inventory_items 
    SET stock_on_hand = NEW.quantity
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 17. update_updated_at_column (generic version)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;