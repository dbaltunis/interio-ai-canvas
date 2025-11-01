# Team Calendar System - Complete Architecture

## Overview

The calendar system now supports **3 levels of sharing** to enable both company-wide collaboration and personal calendar management:

1. **🏢 Organization Calendar** - Visible to entire company
2. **👥 Team Calendar** - Shared with specific team members  
3. **👤 Personal Calendar** - Individual user's private events (+ optional Google sync)

---

## 📊 Calendar Visibility Levels

| Level | Who Can See | Use Cases | Examples |
|-------|-------------|-----------|----------|
| **Organization** | All team members in same company | Company-wide events | All-hands meetings, holidays, training |
| **Team** | Specific team members (via `team_member_ids`) | Project-specific events | Client consultations, installations |
| **Private** | Only the owner | Personal tasks | Individual to-dos, external meetings |

---

## 🗄️ Database Schema

### New Fields on `appointments` Table

```sql
-- Organization-wide sharing
shared_with_organization BOOLEAN DEFAULT FALSE

-- Visibility control
visibility TEXT DEFAULT 'private' 
  CHECK (visibility IN ('private', 'team', 'organization'))
```

### New `calendar_preferences` Table

```sql
CREATE TABLE calendar_preferences (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- View preferences
  default_view TEXT DEFAULT 'week',  -- day, week, month, agenda
  show_organization_events BOOLEAN DEFAULT TRUE,
  show_team_events BOOLEAN DEFAULT TRUE,
  show_personal_events BOOLEAN DEFAULT TRUE,
  
  -- Creation defaults
  default_event_visibility TEXT DEFAULT 'private',
  
  -- Work hours (for calendar display)
  work_hours_start TIME DEFAULT '09:00',
  work_hours_end TIME DEFAULT '17:00',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔐 Security (RLS Policies)

### Who Can See What?

```sql
-- Organization Calendar Policy
"Team members can view organization calendar"
USING (
  (shared_with_organization = true 
   AND get_account_owner(auth.uid()) = get_account_owner(user_id))
  OR
  (visibility = 'organization' 
   AND get_account_owner(auth.uid()) = get_account_owner(user_id))
)

-- Existing policies also check:
-- 1. Same account (via get_account_owner)
-- 2. Team members (via team_member_ids array)
-- 3. Explicit shares (via appointment_shares table)
```

---

## 💡 How It Works

### Scenario 1: Company Holiday
```typescript
// Admin creates company-wide event
{
  title: "Christmas Break",
  visibility: "organization",
  shared_with_organization: true,
  // All team members can see this
}
```

### Scenario 2: Client Consultation
```typescript
// Manager schedules appointment with specific team
{
  title: "Client Smith - Consultation",
  client_id: "client-123",
  visibility: "team",
  team_member_ids: ["staff-1", "staff-2", "installer-1"],
  // Only these 3 team members + manager can see this
}
```

### Scenario 3: Personal Task
```typescript
// Individual user's private event
{
  title: "Order supplies",
  visibility: "private",
  // Only the creator can see this
}
```

### Scenario 4: Personal + Google Sync
```typescript
// User's event synced with their Google Calendar
{
  title: "Doctor appointment",
  visibility: "private",
  google_event_id: "abc123",
  // Syncs to user's personal Google Calendar
}
```

---

## 📧 Email Integration

### Current State
- `invited_client_emails` array exists on appointments
- Can invite clients to appointments via email

### Proposed Enhancement
When inviting users to the organization:

```typescript
// Capture user's business email
{
  invited_email: "john.smith@business.com",
  invited_name: "John Smith",
  role: "Staff"
}

// Use this email for:
// 1. Calendar event notifications
// 2. Team collaboration
// 3. Client communications
// 4. Google Calendar invites (if connected)
```

---

## 🎨 UI Components Needed

### 1. Calendar View Filters
```typescript
<CalendarFilters>
  <Toggle checked={showOrganization}>
    🏢 Company Events
  </Toggle>
  <Toggle checked={showTeam}>
    👥 Team Events  
  </Toggle>
  <Toggle checked={showPersonal}>
    👤 My Events
  </Toggle>
</CalendarFilters>
```

### 2. Event Creation Dialog
```typescript
<CreateEventDialog>
  <VisibilitySelector>
    <Radio value="private">
      👤 Private - Only me
    </Radio>
    <Radio value="team">
      👥 Team - Select members
    </Radio>
    <Radio value="organization">
      🏢 Organization - Everyone
    </Radio>
  </VisibilitySelector>
  
  {visibility === 'team' && (
    <TeamMemberSelector 
      options={organizationMembers}
      selected={teamMemberIds}
    />
  )}
</CreateEventDialog>
```

### 3. Calendar Legend
```typescript
<CalendarLegend>
  <LegendItem color="blue">
    🏢 Company Events
  </LegendItem>
  <LegendItem color="green">
    👥 Team Events
  </LegendItem>
  <LegendItem color="purple">
    👤 My Events
  </LegendItem>
  <LegendItem color="orange">
    📅 Google Synced
  </LegendItem>
</CalendarLegend>
```

---

## 🔄 Google Calendar Sync (Optional)

### Personal Calendar Sync
Each user can **optionally** connect their Google Calendar:

```typescript
// User connects their Google account
useGoogleCalendarIntegration()

// Their private events can sync both ways:
// 1. InterioApp → Google Calendar
// 2. Google Calendar → InterioApp (personal view)
```

### What Gets Synced?
- ✅ **Personal events** (visibility: private)
- ✅ **Team events where user is invited** (visibility: team)
- ❌ **NOT organization events** (to avoid cluttering personal calendar)

### Sync Configuration
```typescript
// User preferences in calendar_preferences
{
  sync_personal_to_google: true,
  sync_team_to_google: false,
  sync_organization_to_google: false
}
```

---

## 📋 Implementation Roadmap

### Phase 6A: Database ✅ COMPLETE
- [x] Add `shared_with_organization` field
- [x] Add `visibility` field  
- [x] Create `calendar_preferences` table
- [x] Add RLS policies

### Phase 6B: UI Components (Next)
- [ ] Calendar filter toggles
- [ ] Visibility selector in event creation
- [ ] Team member selector for team events
- [ ] Calendar legend with color coding
- [ ] Settings page for calendar preferences

### Phase 6C: Invitation Flow (After 6B)
- [ ] Capture user's business email during invitation
- [ ] Send calendar event invites via email
- [ ] Auto-add invited users to `team_member_ids`

### Phase 6D: Google Sync Enhancement (After 6C)
- [ ] Add sync preferences to calendar_preferences
- [ ] Sync team events to personal Google Calendar (optional)
- [ ] Two-way sync for personal events

---

## 🎯 User Experience

### As an Admin/Owner:
1. Create company-wide events (holidays, all-hands)
2. See all organization events
3. See all team events
4. Manage team calendar permissions

### As a Manager:
1. Create team events for projects
2. Invite specific team members
3. See organization events
4. See team events I'm part of
5. My personal calendar

### As a Staff Member:
1. See organization events (company holidays)
2. See team events I'm invited to
3. My personal calendar
4. Optional: Sync with my Google Calendar

---

## 💡 Benefits

### For the Business:
✅ **Centralized scheduling** - Everyone sees important company events  
✅ **Project coordination** - Share appointments with relevant team  
✅ **Flexibility** - Users can keep personal calendars separate  
✅ **Professional** - No need to share personal Google accounts  

### For Team Members:
✅ **Clear visibility** - Know what's company vs team vs personal  
✅ **Privacy** - Personal events stay private  
✅ **Integration** - Optional Google Calendar sync  
✅ **Notifications** - Email alerts for shared events  

---

## 🔍 Example Queries

### Get User's Calendar View
```sql
-- Get all events visible to current user
SELECT 
  a.*,
  CASE 
    WHEN a.visibility = 'organization' THEN '🏢 Company'
    WHEN a.visibility = 'team' THEN '👥 Team'
    ELSE '👤 Personal'
  END as event_type
FROM appointments a
WHERE 
  -- My own events
  a.user_id = current_user_id
  OR
  -- Organization events
  (a.visibility = 'organization' 
   AND get_account_owner(current_user_id) = get_account_owner(a.user_id))
  OR
  -- Team events I'm part of
  (current_user_id = ANY(a.team_member_ids))
ORDER BY a.start_time
```

### Get Organization's Upcoming Events
```sql
-- Get all company events in next 30 days
SELECT *
FROM appointments
WHERE visibility = 'organization'
  AND get_account_owner(user_id) = organization_owner_id
  AND start_time BETWEEN NOW() AND NOW() + INTERVAL '30 days'
ORDER BY start_time
```

---

## 📚 Related Documentation

- Google Calendar OAuth: Individual users connect their own accounts
- Email Settings: Use business email from user profile for notifications
- Team Management: Invite users with their business email
- Permissions: Control who can create organization-wide events

---

## ✅ Testing Checklist

### Database Tests
- [x] Organization events visible to all team members
- [x] Team events visible only to invited members
- [x] Private events visible only to owner
- [x] RLS policies enforce visibility rules

### UI Tests (After Implementation)
- [ ] Calendar shows correct events based on filters
- [ ] Event creation allows visibility selection
- [ ] Team member selector works for team events
- [ ] Calendar legend displays correctly
- [ ] Google sync respects user preferences

### Integration Tests
- [ ] Invitation captures user's business email
- [ ] Email notifications use correct email
- [ ] Google Calendar sync works for personal events
- [ ] Team event invites sent to team members

---

## 🚀 Ready for Phase 6B

Database structure complete. Ready to build UI components!
