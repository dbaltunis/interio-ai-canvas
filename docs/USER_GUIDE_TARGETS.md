# KPI Targets & Performance Tracking Guide

Complete guide for setting and tracking KPI targets in InterioApp.

---

## Overview

KPI targets allow you to set performance goals for team members and track progress in real-time on the dashboard.

### Who Can Set Targets?
- **Owner**: Can set targets for all users
- **Admin**: Can set targets for team members
- **Manager**: Cannot set targets
- **Staff**: Cannot set targets

### Who Can View Progress?
- All users see their own target progress
- Managers+ can see team performance (with permission)

---

## Setting Targets

### Accessing Target Configuration

#### For Individual Users
1. Go to **Settings → Team**
2. Click on a team member
3. Select the **Dashboard** tab
4. Configure KPIs and targets

### Target Settings Per KPI

For each KPI, you can configure:

| Setting | Description |
|---------|-------------|
| **Enabled** | Toggle to show/hide KPI on user's dashboard |
| **Target Enabled** | Toggle to activate target tracking |
| **Target Value** | The goal number to achieve |
| **Target Period** | Timeframe for the target |

### Available Periods

| Period | Resets |
|--------|--------|
| **Daily** | Every day at midnight |
| **Weekly** | Every Monday |
| **Monthly** | First day of month |
| **Quarterly** | First day of quarter |
| **Yearly** | January 1st |

---

## Available KPIs

### Primary KPIs
- **Total Projects**: Number of projects created
- **Total Clients**: Number of clients added
- **Total Quotes**: Number of quotes generated
- **Appointments**: Calendar appointments scheduled

### Revenue KPIs
- **Total Revenue**: Sum of approved quotes
- **Gross Profit**: Revenue minus costs
- **Average Deal Value**: Mean quote value

### Activity KPIs
- **Emails Sent**: Outbound email count
- **Tasks Completed**: Completed tasks count
- **Meetings Held**: Completed appointments

---

## Target Progress Display

### Progress Bar
Each KPI card with an active target shows:
- Current value / Target value
- Visual progress bar
- Percentage complete

### Color-Coded Status

| Status | Color | Meaning |
|--------|-------|---------|
| 🔴 Critical | Red | Less than 50% of target |
| 🟡 Warning | Yellow | 50-80% of target |
| 🟢 On Track | Green | 80% or more of target |

### Example Display
```
Total Quotes
━━━━━━━━━━━━━━━━━░░░░  15 / 20
                         75% ↑
```

---

## Dashboard Customization

### Enabling/Disabling KPIs

As an admin, you can control which KPIs appear on each user's dashboard:

1. Go to **Settings → Team → [User] → Dashboard**
2. Toggle KPIs on/off for the user
3. Changes apply immediately

### Widget Management

Control which widgets appear:
- **Dealer Performance**: Team leaderboard
- **Revenue Chart**: Revenue over time
- **Activity Feed**: Recent activities
- **Calendar Preview**: Upcoming appointments

### Reset to Defaults
1. Open user's Dashboard settings
2. Click **Reset to Defaults**
3. Restores standard KPI and widget configuration

---

## Dealer Performance Widget

### What It Shows
- Team member rankings by performance
- Quote count per dealer
- Revenue per dealer
- Conversion rates with progress bars
- Top performer highlight

### Permission Required
Viewing team performance requires `view_team_performance` permission:
- **Owner**: Always has access
- **Admin**: Has access by default
- **Manager**: Has access by default
- **Staff**: No access by default

### Enabling for Users
1. Go to **Settings → Team → [User]**
2. Enable **Custom Permissions**
3. Toggle `view_team_performance` ON

---

## Best Practices

### Setting Realistic Targets
- ✅ Base targets on historical performance
- ✅ Consider seasonal variations
- ✅ Start conservative, adjust monthly
- ✅ Discuss targets with team members

### Choosing Periods
- **Daily**: High-volume activities (calls, emails)
- **Weekly**: Project-based work
- **Monthly**: Sales targets, revenue goals
- **Quarterly**: Strategic objectives
- **Yearly**: Annual performance reviews

### Motivating Teams
- ✅ Celebrate when targets are hit
- ✅ Review missed targets constructively
- ✅ Adjust unrealistic targets
- ✅ Use leaderboard for healthy competition

### Avoiding Common Mistakes
- ❌ Don't set targets too high initially
- ❌ Don't change targets mid-period
- ❌ Don't ignore context (holidays, etc.)
- ❌ Don't use targets punitively

---

## Admin Configuration Workflow

### Setting Up a New Team Member

1. **Add User**: Settings → Team → Invite
2. **Assign Role**: Owner/Admin/Manager/Staff
3. **Configure Dashboard**:
   - Enable relevant KPIs
   - Set appropriate targets
   - Choose target periods
4. **Review Permissions**:
   - Can they see revenue?
   - Can they see team performance?

### Monthly Target Review

1. Export performance data
2. Compare actual vs targets
3. Identify overperformers/underperformers
4. Adjust targets for next month
5. Communicate changes to team

---

## Tracking Your Own Progress

### Viewing Your Dashboard
1. Go to main **Dashboard**
2. View your KPI cards with progress
3. Check color status for each target

### Understanding Your Metrics

| KPI | What Affects It |
|-----|-----------------|
| Total Projects | Creating new projects |
| Total Quotes | Generating quotes from measurements |
| Total Clients | Adding new client records |
| Revenue | Quotes approved and invoiced |

### Improving Performance
- Focus on red/yellow KPIs first
- Review daily if targets are daily
- Track which activities drive results
- Ask manager for guidance

---

## Data Persistence

### Where Targets are Stored
- Targets save to database (not browser)
- Persist across devices
- Available after logout/login
- Admin changes apply immediately

### Historical Data
- Current period progress shown
- Previous periods not displayed (yet)
- Export available for analysis

---

## Troubleshooting

### Target Not Showing
1. Verify target is enabled for user
2. Check KPI is enabled on dashboard
3. Confirm user has permission to view KPI
4. Try refreshing the page

### Wrong Progress Number
1. Check date range/period setting
2. Verify data exists for period
3. Review what counts toward KPI
4. Contact support if discrepancy persists

### Progress Not Updating
1. Refresh browser
2. Check that action was saved
3. Allow a few seconds for sync
4. Clear browser cache if needed

### Team Widget Missing
1. Verify `view_team_performance` permission
2. Check widget is enabled for user
3. Ensure there is team data to display

---

## Quick Reference

| Action | Location |
|--------|----------|
| Set user targets | Settings → Team → [User] → Dashboard |
| Enable KPIs | Settings → Team → [User] → Dashboard toggles |
| View own progress | Dashboard KPI cards |
| View team performance | Dashboard → Dealer Performance widget |
| Reset to defaults | Settings → Team → [User] → Dashboard → Reset |

### Target Period Quick Guide

| Period | Best For |
|--------|----------|
| Daily | High-frequency activities |
| Weekly | Project-based work |
| Monthly | Sales and revenue |
| Quarterly | Strategic goals |
| Yearly | Annual reviews |

---

*Last Updated: December 2025*
