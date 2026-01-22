# Memory: Database Roles and Multi-Tenant Patterns

**Created:** 2026-01-22
**Purpose:** Prevent future migration failures due to incorrect role names or RLS patterns

---

## CRITICAL: Correct Role Names

The database uses these EXACT role names in `user_profiles.role`:

| Role | Description |
|------|-------------|
| `Owner` | Account owner (NOT 'Account Owner'!) |
| `System Owner` | Platform super admin (Darius) |
| `Admin` | Account administrator |
| `Staff` | Regular team member |
| `Dealer` | Dealer portal user |

### ⚠️ NEVER use 'Account Owner' - this role does not exist!

```sql
-- WRONG (will affect 0 rows silently):
WHERE role = 'Account Owner'

-- CORRECT:
WHERE role IN ('Owner', 'System Owner')
```

---

## Multi-Tenant RLS Pattern

Always use `get_effective_account_owner()` for RLS policies to support team member access:

```sql
-- CORRECT (allows team members to see owner's data):
USING (public.get_effective_account_owner(auth.uid()) = user_id)

-- WRONG (blocks team members):
USING (auth.uid() = user_id)
```

### When to add System Owner bypass:

```sql
-- For SELECT policies where System Owner needs full access:
USING (
  public.get_effective_account_owner(auth.uid()) = user_id
  OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'System Owner'
  )
)
```

---

## Migration Checklist for User Data

Before any migration affecting user data:

1. [ ] Query actual role values: `SELECT DISTINCT role FROM user_profiles`
2. [ ] Use `'Owner'` and `'System Owner'` for account owners
3. [ ] Add `parent_account_id IS NULL` check for top-level owners only
4. [ ] Test with `SELECT COUNT(*)` to verify rows will be affected
5. [ ] Consider creating auto-seeding trigger for new accounts

---

## Auto-Seeding Pattern for New Accounts

Any feature requiring default data per account should have:

1. **One-time migration** to seed existing accounts
2. **Database trigger** to auto-seed new accounts
3. **Fallback UI component** (like `SeedClientStages`) for edge cases

### Example trigger pattern:

```sql
CREATE OR REPLACE FUNCTION public.seed_default_[feature]()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IN ('Owner', 'System Owner') 
     AND (NEW.parent_account_id IS NULL OR NEW.role = 'System Owner') THEN
    IF NOT EXISTS (SELECT 1 FROM [table] WHERE user_id = NEW.user_id) THEN
      INSERT INTO [table] (user_id, ...) VALUES (NEW.user_id, ...);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_seed_[feature]
  AFTER INSERT OR UPDATE OF role ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_default_[feature]();
```

---

## Tables Using This Pattern

| Table | Auto-Seed Trigger | RLS Pattern |
|-------|-------------------|-------------|
| `client_stages` | ✅ `trigger_seed_client_stages` | ✅ `get_effective_account_owner()` |
| `job_status_slots` | ❓ Check if needed | ❓ Verify |

---

## How This Prevents Issues

| Problem | Prevention |
|---------|------------|
| Wrong role names in migrations | This doc lists correct names |
| Team members can't see owner's data | Use `get_effective_account_owner()` |
| New accounts missing default data | Auto-seeding trigger |
| Silent migration failures | Verification checklist |
