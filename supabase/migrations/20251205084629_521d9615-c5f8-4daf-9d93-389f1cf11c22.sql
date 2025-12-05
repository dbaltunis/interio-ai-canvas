-- SECURITY FIX: Drop broken RLS policies with 'OR is_admin()' on quote_templates

-- Drop broken SELECT policies
DROP POLICY IF EXISTS "Users can view own and inherited templates" ON quote_templates;
DROP POLICY IF EXISTS "Users can view templates in their account" ON quote_templates;

-- Drop broken INSERT policies  
DROP POLICY IF EXISTS "Users can create quote templates" ON quote_templates;

-- Drop broken UPDATE policies
DROP POLICY IF EXISTS "Users can update quote templates" ON quote_templates;
DROP POLICY IF EXISTS "Users can update templates in their account" ON quote_templates;

-- Drop broken DELETE policies
DROP POLICY IF EXISTS "Users can delete quote templates" ON quote_templates;
DROP POLICY IF EXISTS "Users can delete templates in their account" ON quote_templates;