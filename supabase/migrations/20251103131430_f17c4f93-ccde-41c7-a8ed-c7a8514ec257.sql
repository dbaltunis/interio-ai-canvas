-- =============================================
-- PHASE 1: ADD MISSING PERMISSIONS & FIX SYSTEM
-- =============================================

-- 1. ADD MISSING PERMISSIONS TO PERMISSIONS TABLE
-- =============================================

INSERT INTO public.permissions (name, description, category)
VALUES 
    ('view_purchasing', 'Can view purchasing and materials', 'purchasing'),
    ('manage_purchasing', 'Can manage purchase orders and materials', 'purchasing'),
    ('view_billing', 'Can view billing and invoices', 'billing'),
    ('export_clients', 'Can export client data', 'admin'),
    ('import_clients', 'Can import client data', 'admin'),
    ('export_jobs', 'Can export job data', 'admin'),
    ('import_jobs', 'Can import job data', 'admin'),
    ('export_inventory', 'Can export inventory data', 'admin'),
    ('import_inventory', 'Can import inventory data', 'admin')
ON CONFLICT (name) DO NOTHING;

-- 2. FIX PERMISSIONS SYSTEM - CREATE INITIALIZATION FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.initialize_user_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    expected_perms text[];
    perm_to_add text;
BEGIN
    -- Get default permissions for the user's role
    expected_perms := public.get_default_permissions_for_role(NEW.role);
    
    IF expected_perms IS NOT NULL THEN
        FOREACH perm_to_add IN ARRAY expected_perms LOOP
            INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
            VALUES (NEW.user_id, perm_to_add, NEW.parent_account_id)
            ON CONFLICT (user_id, permission_name) DO NOTHING;
        END LOOP;
    END IF;
    
    -- Sync to user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Create trigger to fire on INSERT (for new users)
DROP TRIGGER IF EXISTS initialize_permissions_on_insert ON public.user_profiles;
CREATE TRIGGER initialize_permissions_on_insert
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_permissions();

-- 3. BACKFILL PERMISSIONS FOR EXISTING USERS
-- =============================================

DO $$
DECLARE
    user_record RECORD;
    expected_perms text[];
    perm_to_add text;
    users_fixed int := 0;
BEGIN
    FOR user_record IN 
        SELECT DISTINCT up.user_id, up.role, up.parent_account_id
        FROM public.user_profiles up
        WHERE up.role IS NOT NULL
    LOOP
        -- Get permissions for role
        expected_perms := public.get_default_permissions_for_role(user_record.role);
        
        IF expected_perms IS NOT NULL THEN
            FOREACH perm_to_add IN ARRAY expected_perms LOOP
                INSERT INTO public.user_permissions (user_id, permission_name, granted_by)
                VALUES (user_record.user_id, perm_to_add, user_record.parent_account_id)
                ON CONFLICT (user_id, permission_name) DO NOTHING;
            END LOOP;
            users_fixed := users_fixed + 1;
        END IF;
        
        -- Sync to user_roles
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_record.user_id, user_record.role::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Backfilled permissions for % users', users_fixed;
END $$;

-- 4. BUG REPORTING SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'in_progress', 'resolved', 'closed', 'wont_fix')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    route TEXT,
    user_agent TEXT,
    browser_info JSONB,
    screenshot_url TEXT,
    attachments JSONB,
    app_version TEXT DEFAULT 'BETA v0.1.0',
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT
);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create bug reports" ON public.bug_reports;
CREATE POLICY "Users can create bug reports"
    ON public.bug_reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own bug reports" ON public.bug_reports;
CREATE POLICY "Users can view own bug reports"
    ON public.bug_reports FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all bug reports" ON public.bug_reports;
CREATE POLICY "Admins can view all bug reports"
    ON public.bug_reports FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update bug reports" ON public.bug_reports;
CREATE POLICY "Admins can update bug reports"
    ON public.bug_reports FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.bug_report_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_report_id UUID REFERENCES public.bug_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bug_report_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view comments on their bugs" ON public.bug_report_comments;
CREATE POLICY "Users can view comments on their bugs"
    ON public.bug_report_comments FOR SELECT
    TO authenticated
    USING (
        bug_report_id IN (
            SELECT id FROM public.bug_reports WHERE user_id = auth.uid()
        ) AND is_internal = false
    );

DROP POLICY IF EXISTS "Admins can view all comments" ON public.bug_report_comments;
CREATE POLICY "Admins can view all comments"
    ON public.bug_report_comments FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can create comments" ON public.bug_report_comments;
CREATE POLICY "Admins can create comments"
    ON public.bug_report_comments FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.update_bug_report_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
        NEW.resolved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bug_report_updated_at ON public.bug_reports;
CREATE TRIGGER bug_report_updated_at
    BEFORE UPDATE ON public.bug_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bug_report_timestamp();

-- 5. VERSION MANAGEMENT SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS public.app_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT UNIQUE NOT NULL,
    version_number INTEGER NOT NULL,
    version_type TEXT CHECK (version_type IN ('major', 'minor', 'patch', 'beta')) NOT NULL,
    release_date TIMESTAMPTZ DEFAULT NOW(),
    release_notes JSONB NOT NULL,
    is_published BOOLEAN DEFAULT false,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_version_views (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    version_id UUID REFERENCES public.app_versions(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, version_id)
);

INSERT INTO public.app_versions (version, version_number, version_type, release_notes, is_published, is_current)
VALUES (
    'BETA v0.1.0',
    1,
    'beta',
    '{
        "summary": "Initial beta release - Core Features",
        "highlights": [
            "Complete Project Management System",
            "Advanced CRM with Lead Scoring",
            "AI-Powered Quote Generation",
            "Calendar & Scheduling",
            "Inventory Management",
            "5 AI Assistants"
        ],
        "new_features": [
            {"title": "AI Advisor", "description": "Get intelligent business recommendations powered by AI", "category": "AI"},
            {"title": "AI Design Assistant", "description": "Generate design concepts and layouts instantly", "category": "AI"},
            {"title": "Lead Scoring", "description": "Automatic lead quality scoring based on engagement", "category": "CRM"},
            {"title": "Batch Operations", "description": "Process multiple orders efficiently", "category": "Operations"},
            {"title": "Custom Templates", "description": "Create and manage document templates", "category": "Documents"}
        ],
        "improvements": [
            {"title": "Faster Navigation", "description": "Optimized route transitions and lazy loading"},
            {"title": "Mobile Experience", "description": "Enhanced mobile navigation and touch interactions"},
            {"title": "Permission System", "description": "Granular role-based access control"}
        ],
        "known_issues": [
            "PDF export may be slow for large documents",
            "Mobile navigation requires testing on various devices",
            "Some integrations are still in development"
        ]
    }'::jsonb,
    true,
    true
) ON CONFLICT (version) DO NOTHING;

ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_version_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published versions" ON public.app_versions;
CREATE POLICY "Anyone can view published versions"
    ON public.app_versions FOR SELECT
    TO authenticated
    USING (is_published = true);

DROP POLICY IF EXISTS "Users can view own version views" ON public.user_version_views;
CREATE POLICY "Users can view own version views"
    ON public.user_version_views FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own version views" ON public.user_version_views;
CREATE POLICY "Users can insert own version views"
    ON public.user_version_views FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 6. ONBOARDING PROGRESS TRACKING
-- =============================================

CREATE TABLE IF NOT EXISTS public.onboarding_progress (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    completed_steps TEXT[] DEFAULT '{}',
    current_step INTEGER DEFAULT 0,
    company_info JSONB,
    preferences JSONB,
    has_completed_welcome BOOLEAN DEFAULT false,
    has_seen_product_tour BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own onboarding progress" ON public.onboarding_progress;
CREATE POLICY "Users can view own onboarding progress"
    ON public.onboarding_progress FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own onboarding progress" ON public.onboarding_progress;
CREATE POLICY "Users can update own onboarding progress"
    ON public.onboarding_progress FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_onboarding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS onboarding_updated_at ON public.onboarding_progress;
CREATE TRIGGER onboarding_updated_at
    BEFORE UPDATE ON public.onboarding_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_onboarding_timestamp();