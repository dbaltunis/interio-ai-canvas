# Custom Permissions System

InterioApp features a comprehensive, granular permissions system that allows you to control exactly what each team member can see and do.

---

## Permission Categories

### 1. Jobs (Projects)
Control access to project management features.

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `view_own_jobs` | View only projects you created | Staff |
| `view_all_jobs` | View all projects in the account | Manager, Admin, Owner |
| `create_jobs` | Create new projects | All roles |
| `edit_jobs` | Modify existing projects | Manager, Admin, Owner |
| `delete_jobs` | Delete projects | Admin, Owner |

### 2. Workroom
Control access to production and workroom features.

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `access_workroom` | Access workroom tab and features | Manager, Admin, Owner |

### 3. Materials & Ordering
Control ordering and material management.

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `order_materials` | Place material orders | Manager, Admin, Owner |
| `access_materials` | View materials section | All roles |

### 4. Inventory
Control inventory management access.

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `manage_inventory` | Full inventory management | Admin, Owner |
| `view_inventory` | View inventory items | All roles |

### 5. Quote Templates
Control who can create and manage quote templates.

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `manage_quote_templates` | Create/edit/delete templates | Owner |
| `use_quote_templates` | Use existing templates | All roles |

**Note**: Team members automatically inherit all quote templates from their account owner.

### 6. Navigation
Control which tabs are visible in the main navigation.

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `access_workroom_tab` | Show workroom tab | Manager, Admin, Owner |
| `access_email_tab` | Show email tab (requires SendGrid) | Manager, Admin, Owner |
| `access_calendar_tab` | Show calendar tab | All roles |

### 7. Dashboard KPIs
Control visibility of dashboard metrics and analytics.

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `view_dashboard_primary_kpis` | View project/client/quote counts | All roles |
| `view_dashboard_revenue_kpis` | View revenue, profit, costs | Manager, Admin, Owner |
| `view_dashboard_email_kpis` | View email analytics | Manager, Admin, Owner |

---

## Role Defaults

### Owner
Full access to everything:
- All job permissions
- All workroom permissions
- All material permissions
- All inventory permissions
- Manage quote templates
- All navigation tabs
- All dashboard KPIs

### Admin
Nearly full access:
- All job permissions
- All workroom permissions
- All material permissions
- Manage inventory
- Use quote templates (inherits from owner)
- All navigation tabs
- All dashboard KPIs

### Manager
Supervisory access:
- View all jobs
- Create and edit jobs
- Access workroom
- Order materials
- View inventory
- Use quote templates
- Most navigation tabs
- All dashboard KPIs

### Staff
Limited access:
- View own jobs only
- Create jobs
- View inventory
- Use quote templates
- Basic navigation
- Primary KPIs only

### User (Client Portal)
Client-facing access:
- View assigned projects
- View quotes
- Basic information

---

## Custom Permissions

### Setting Custom Permissions

1. **Navigate to Team Settings**
   - Go to Settings → Team
   - Select a team member

2. **Enable Custom Permissions**
   - Toggle "Custom Permissions"
   - This overrides role defaults

3. **Configure Permissions**
   - Check/uncheck specific permissions
   - Changes save automatically

4. **Test Access**
   - Have team member refresh their browser
   - Verify permissions are working as expected

### Permission Inheritance

**Quote Templates**: Team members automatically inherit all quote templates from their account owner. This cannot be disabled and ensures consistency across your organization.

**Projects**: By default:
- Staff see only their own projects (`view_own_jobs`)
- Managers/Admins/Owners see all projects (`view_all_jobs`)

### Permission Dependencies

Some permissions depend on others:

- `edit_jobs` requires `view_all_jobs` or `view_own_jobs`
- `delete_jobs` requires `edit_jobs`
- `order_materials` requires `access_materials`
- `manage_inventory` requires `view_inventory`

The system validates these dependencies automatically.

---

## Best Practices

### 1. Start with Role Defaults
Don't rush to customize permissions. Role defaults are carefully designed for most use cases.

### 2. Use Roles, Then Customize
Assign the appropriate role first, then make minimal custom adjustments if needed.

### 3. Document Custom Permissions
Keep a record of why you've customized permissions for specific users.

### 4. Review Regularly
Audit permissions quarterly to ensure they still make sense for your team.

### 5. Test Before Deployment
When changing permissions, test with a dummy account before applying to real users.

### 6. Protect Sensitive Data
Use dashboard KPI permissions to hide financial data from staff who don't need it.

### 7. Gradual Access Expansion
Start restrictive and expand access as team members prove themselves.

---

## Common Scenarios

### Scenario 1: Sales Rep
**Role**: Staff with custom permissions

**Permissions**:
- `view_own_jobs`: ✅ (see their own sales)
- `create_jobs`: ✅ (create new quotes)
- `view_dashboard_primary_kpis`: ✅ (see their progress)
- `view_dashboard_revenue_kpis`: ❌ (hide profit margins)

### Scenario 2: Production Manager
**Role**: Manager with custom permissions

**Permissions**:
- `view_all_jobs`: ✅ (see all projects)
- `access_workroom`: ✅ (manage production)
- `order_materials`: ✅ (place orders)
- `manage_inventory`: ✅ (track stock)
- `view_dashboard_revenue_kpis`: ❌ (no need for profit data)

### Scenario 3: Office Admin
**Role**: Admin (full access)

**Permissions**: All enabled (use role defaults)

### Scenario 4: Apprentice
**Role**: Staff with very limited access

**Permissions**:
- `view_own_jobs`: ❌ (supervised work only)
- `create_jobs`: ❌ (no client interaction)
- `view_inventory`: ✅ (learn products)
- `access_materials`: ✅ (help with ordering)

---

## Troubleshooting

### "Access Denied" Errors
**Issue**: Team member can't access a feature

**Solutions**:
1. Check their role assignment
2. Verify custom permissions aren't blocking access
3. Ensure they've refreshed their browser
4. Check if feature requires integration (e.g., SendGrid for email)

### Missing Navigation Tabs
**Issue**: Expected tabs don't appear

**Solutions**:
1. Check navigation permissions
2. Verify integrations are configured (Email tab requires SendGrid)
3. Review custom permissions settings

### Can't See Projects
**Issue**: User complains they can't see their projects

**Solutions**:
1. Verify they have `view_own_jobs` or `view_all_jobs`
2. Check if projects are assigned to their account
3. Ensure RLS policies are working (should be automatic)

### Template Inheritance Not Working
**Issue**: Team member can't see owner's templates

**Solutions**:
1. Verify account owner has templates
2. Check that templates are marked as active
3. Ensure team member is properly linked to account owner

---

## Security Considerations

### Row Level Security (RLS)
All permissions are enforced at the database level using PostgreSQL RLS policies. This means:
- Permissions cannot be bypassed
- Data is protected even in API calls
- No client-side security risks

### Permission Caching
Permissions are cached for performance but automatically refresh when:
- User logs in
- Permissions are changed
- User refreshes the page

### Audit Trail
All permission changes are logged in the audit log for compliance and troubleshooting.

---

## API & Integration Notes

When building custom integrations:
- Always check permissions before API calls
- Use `has_permission(user_id, permission_name)` function
- Handle permission errors gracefully
- Don't cache permission results longer than 5 minutes

---

## Future Enhancements

Coming soon:
- **Permission Templates**: Save custom permission sets for reuse
- **Temporary Access**: Grant time-limited permissions
- **Permission Groups**: Assign multiple permissions at once
- **Activity-Based Permissions**: Automatic permission suggestions based on user activity

---

*Last Updated: November 21, 2025*