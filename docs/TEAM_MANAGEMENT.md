# Team Management Guide

Complete guide to managing team collaboration in InterioApp.

---

## Overview

InterioApp supports full team collaboration with:
- Role-based access control
- Custom permissions per user
- Account hierarchy
- Team notifications
- Shared resources

---

## Account Structure

### Account Owner
- The primary account holder
- Full access to all features
- Can invite team members
- Manages billing and subscriptions
- Creates quote templates for team

### Team Members
- Staff, Managers, Admins, or Users
- Linked to account owner
- Inherit quote templates automatically
- Permissions based on role + custom settings

### System Owner (Enterprise)
- Multi-account management
- System-wide configuration
- Cross-account reporting
- Available on Enterprise plans

---

## Inviting Team Members

### Step 1: Navigate to Team Settings
1. Go to **Settings** → **Team**
2. Click **Invite Team Member**

### Step 2: Enter Member Details
- **Email Address**: Required
- **Role**: Select appropriate role (Staff, Manager, Admin)
- **Custom Permissions**: Optional, can be set later

### Step 3: Send Invitation
- Click **Send Invitation**
- Team member receives email
- Invitation link valid for 7 days

### Step 4: Member Accepts
- Click link in email
- Creates account (if new user)
- Automatically linked to your account
- Permissions applied instantly

---

## Roles Explained

### Staff
**Best for**: Sales reps, junior team members, trainees

**Default Access**:
- ✅ View own projects
- ✅ Create new projects
- ✅ View inventory
- ✅ Use quote templates
- ✅ Basic calendar access
- ❌ No financial metrics
- ❌ No workroom access
- ❌ No material ordering

**Use Cases**:
- Sales representatives
- Customer service agents
- Trainees or apprentices

### Manager
**Best for**: Production managers, senior sales, supervisors

**Default Access**:
- ✅ View all projects
- ✅ Create and edit projects
- ✅ Access workroom
- ✅ Order materials
- ✅ View inventory
- ✅ All dashboard metrics
- ✅ Full calendar access
- ❌ Cannot delete projects
- ❌ Cannot manage quote templates

**Use Cases**:
- Production managers
- Senior sales managers
- Operations supervisors

### Admin
**Best for**: Office managers, operations leads

**Default Access**:
- ✅ Full project management
- ✅ Manage inventory
- ✅ Access all features
- ✅ All dashboard metrics
- ✅ Workroom and ordering
- ❌ Cannot manage quote templates
- ❌ Not the billing owner

**Use Cases**:
- Office managers
- Operations managers
- Senior administrators

### User (Client Portal)
**Best for**: Clients, external collaborators

**Default Access**:
- ✅ View assigned projects
- ✅ View their quotes
- ✅ Basic project info
- ❌ No editing
- ❌ No financial data
- ❌ No other client access

**Use Cases**:
- Clients needing project visibility
- External contractors
- Limited partner access

---

## Custom Permissions

### When to Use Custom Permissions

**Use Role Defaults When**:
- Team member fits standard role perfectly
- You want consistent team access
- Simplicity is important

**Use Custom Permissions When**:
- Unique job requirements
- Transitioning between roles
- Special project needs
- Testing new responsibilities

### Setting Custom Permissions

1. **Go to Team Member Profile**
   - Settings → Team → Select Member

2. **Enable Custom Mode**
   - Toggle "Custom Permissions"
   - Warning: This overrides role defaults

3. **Configure Permissions**
   - Check desired permissions
   - Dependencies are validated automatically
   - Changes save immediately

4. **Test & Verify**
   - Ask team member to log out and back in
   - Verify access is correct
   - Make adjustments as needed

See [PERMISSIONS.md](./PERMISSIONS.md) for detailed permission documentation.

---

## Team Collaboration Features

### Shared Quote Templates
- Account owner creates templates
- Team members automatically inherit them
- Always in sync with owner's updates
- Cannot be disabled (ensures consistency)

### Project Visibility
- **Staff**: See only their own projects
- **Manager/Admin/Owner**: See all projects

**Override**: Grant `view_all_jobs` to specific staff members if needed.

### Owner Notifications
When a team member creates a project:
- Owner receives instant notification
- Notification includes project name and creator
- Direct link to view the project
- Ensures owner awareness of team activity

### Team Calendar
- Shared appointments visible to team
- Private appointments stay private
- Color-coded by creator
- Filter by team member

---

## Best Practices

### Onboarding New Team Members

**Day 1: Set Up Access**
1. Send invitation
2. Assign appropriate role
3. Verify they can log in
4. Walk through basic features

**Week 1: Training**
1. Show them their permitted features
2. Explain their responsibilities
3. Set expectations for usage
4. Provide documentation access

**Month 1: Review**
1. Check if permissions are appropriate
2. Gather feedback
3. Adjust as needed
4. Document any custom configurations

### Role Assignment Strategy

**Start Conservative**:
- Begin with Staff role for new members
- Expand access as they prove capabilities
- Use custom permissions sparingly

**Document Decisions**:
- Keep notes on why certain permissions were granted
- Review quarterly
- Update as roles evolve

**Security First**:
- Limit access to financial data
- Protect client information
- Use principle of least privilege

### Team Communication

**Set Clear Expectations**:
- What they can and cannot do
- When to ask for help
- How to escalate issues

**Regular Check-ins**:
- Weekly team meetings
- Monthly permission reviews
- Quarterly access audits

**Use Built-in Tools**:
- Project comments for collaboration
- Notifications for updates
- Shared calendar for coordination

---

## Managing Team Size

### Small Teams (1-5 people)
- Simple role assignments
- Minimal custom permissions
- Owner handles most admin tasks

**Recommended Structure**:
- 1 Owner
- 1-2 Admins/Managers
- 2-3 Staff

### Medium Teams (6-20 people)
- Clear role hierarchy
- Some custom permissions needed
- Dedicated operations manager

**Recommended Structure**:
- 1 Owner
- 2-3 Admins
- 3-5 Managers
- Remaining Staff

### Large Teams (20+ people)
- Formal role definitions
- Documented permission policies
- Regular audits

**Recommended Structure**:
- 1 Owner
- 2-4 Admins
- 6-10 Managers (by department)
- Remaining Staff (by specialty)

---

## Account Hierarchy

### Parent Account (Owner)
- Creates the main account
- Owns all company data
- Invites team members
- Manages billing

### Child Accounts (Team Members)
- Linked to parent account
- Access based on permissions
- Share templates and resources
- Cannot see other accounts' data

### Multi-Location Setup
For businesses with multiple locations:

**Option 1: Single Account**
- One owner
- All team members as staff/managers
- Use custom permissions per location
- Shared inventory and templates

**Option 2: Multiple Accounts (Enterprise)**
- System Owner manages all
- Each location has local owner
- Separate inventories
- Cross-location reporting

---

## Removing Team Members

### Offboarding Process

**Step 1: Disable Access**
1. Go to Settings → Team
2. Select team member
3. Click "Remove from Team"
4. Confirm removal

**Step 2: Transfer Data**
- Projects they created remain
- Reassign open projects if needed
- Update project ownership if necessary

**Step 3: Security**
- Access revoked immediately
- Cannot log in to your account
- Their personal account remains separate

**Step 4: Cleanup**
- Remove from shared calendars
- Update team documentation
- Inform remaining team

### What Happens to Their Data?
- **Projects**: Remain in system, ownership shows their name
- **Quotes**: Remain accessible
- **Notes**: Preserved with creator attribution
- **Appointments**: Remain on calendar (historical record)

---

## Troubleshooting

### Team Member Can't Accept Invitation
**Solutions**:
- Check spam folder
- Resend invitation (expires after 7 days)
- Verify email address is correct
- Try different browser

### Team Member Has Wrong Permissions
**Solutions**:
- Verify role assignment
- Check custom permissions aren't overriding
- Ask them to log out and back in
- Check account linkage is correct

### Team Member Can't See Shared Templates
**Solutions**:
- Verify they're linked to your account
- Check templates are marked active
- Ensure templates are created by account owner
- Refresh their browser

### Notifications Not Working
**Solutions**:
- Check notification settings in profile
- Verify email address is correct
- Check spam/junk folder
- Test with a new project creation

---

## Security & Compliance

### Data Protection
- All team member data encrypted
- Access logs maintained
- RLS policies enforce permissions
- Regular security audits

### Compliance
- GDPR compliant
- Data export available
- Right to deletion respected
- Audit trail maintained

### Best Security Practices
1. Review team access quarterly
2. Remove inactive team members
3. Use strong role assignments
4. Don't share account credentials
5. Enable 2FA for all team members

---

## Advanced Features (Coming Soon)

### Team Analytics
- Individual performance metrics
- Team productivity dashboards
- Activity tracking
- Goal setting and tracking

### Advanced Permissions
- Time-based access grants
- Project-specific permissions
- Permission templates
- Bulk permission updates

### Enhanced Collaboration
- Team messaging
- File sharing
- Task assignments
- Workflow automation

---

*Last Updated: November 21, 2025*