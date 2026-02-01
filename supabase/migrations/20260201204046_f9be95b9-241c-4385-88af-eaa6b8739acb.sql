-- Fix orphaned data: Reassign all records created by team members to their account owners
-- This migration only affects records where user_id belongs to a team member (has parent_account_id)

-- Fix orphaned rooms
UPDATE rooms r
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = r.user_id)
WHERE r.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned surfaces
UPDATE surfaces s
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = s.user_id)
WHERE s.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned vendors
UPDATE vendors v
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = v.user_id)
WHERE v.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned collections
UPDATE collections c
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = c.user_id)
WHERE c.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned lead_sources
UPDATE lead_sources ls
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = ls.user_id)
WHERE ls.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned window_coverings
UPDATE window_coverings wc
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = wc.user_id)
WHERE wc.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned tasks
UPDATE tasks t
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = t.user_id)
WHERE t.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned client_lists
UPDATE client_lists cl
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = cl.user_id)
WHERE cl.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned sms_templates
UPDATE sms_templates st
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = st.user_id)
WHERE st.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned sms_campaigns
UPDATE sms_campaigns sc
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = sc.user_id)
WHERE sc.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned sms_contacts
UPDATE sms_contacts scon
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = scon.user_id)
WHERE scon.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned email_campaigns
UPDATE email_campaigns ec
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = ec.user_id)
WHERE ec.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned emails
UPDATE emails e
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = e.user_id)
WHERE e.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned project_notes
UPDATE project_notes pn
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = pn.user_id)
WHERE pn.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned online_stores
UPDATE online_stores os
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = os.user_id)
WHERE os.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);

-- Fix orphaned treatments
UPDATE treatments tr
SET user_id = (SELECT COALESCE(up.parent_account_id, up.user_id) FROM user_profiles up WHERE up.user_id = tr.user_id)
WHERE tr.user_id IN (SELECT user_id FROM user_profiles WHERE parent_account_id IS NOT NULL);