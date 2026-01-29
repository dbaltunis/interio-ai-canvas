
# Complete Notification System Overhaul

## Executive Summary

A comprehensive redesign of the notification system to transform it from a passive display into an actionable, intelligent communication hub with unified inbox, real-time delivery, filtering, email digests, and team collaboration features.

---

## Current System Analysis

### What Exists Today

| Component | Status | Issues |
|-----------|--------|--------|
| `notifications` table | Basic | No category, priority, or grouping fields |
| `appointment_notifications` table | Separate | Creates confusion - two notification systems |
| `broadcast_notifications` table | Exists | Works but disconnected from inbox |
| `GeneralNotificationDropdown` | UI only | Passive - no real-time, no filters |
| `NotificationDropdown` | Appointment-specific | Confusing UX |
| Edge functions | Multiple | Manual trigger required, no cron automation |
| Real-time | Partial | Some areas have it, notifications don't |

### Data Issues Found
- Duplicate notifications (same appointment creates 2+ entries)
- Many notifications lack `action_url` (buttons do nothing)
- No cleanup mechanism (old notifications accumulate forever)
- No priority/category system

---

## Proposed Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UNIFIED NOTIFICATION HUB                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   INBOX     │  │   FILTERS   │  │  SETTINGS   │  │  ACTIVITY   │        │
│  │  (Default)  │  │  By Type    │  │  Preferences│  │  History    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      NOTIFICATION LIST                                │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ★ HIGH   Project assigned: "Smith Renovation"      [View Job]  │  │  │
│  │  │          @Mike mentioned you in a note              2 min ago  │  │  │
│  │  ├────────────────────────────────────────────────────────────────┤  │  │
│  │  │ ○ NORMAL Appointment reminder: Client consultation  [Join]     │  │  │
│  │  │          Tomorrow at 10:00 AM                       1 hour ago │  │  │
│  │  ├────────────────────────────────────────────────────────────────┤  │  │
│  │  │ ○ NORMAL Quote approved by client                   [View]     │  │  │
│  │  │          Quote #Q-2025-0142 - $12,450               3 hours    │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  QUICK ACTIONS: Mark all read | Clear all | Notification settings    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Schema Enhancement

### 1.1 Migrate `notifications` table

Add new columns to support advanced features:

```sql
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source_type TEXT; -- 'project', 'appointment', 'quote', 'team', 'system'
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS group_key TEXT; -- For deduplication/grouping
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES notifications(id); -- For threading
```

### 1.2 Create `notification_preferences` table

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Channel preferences
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  -- Digest preferences  
  digest_frequency TEXT DEFAULT 'never', -- 'never', 'daily', 'weekly'
  digest_day TEXT DEFAULT 'monday', -- For weekly digest
  digest_time TIME DEFAULT '09:00',
  -- Category preferences (JSONB for flexibility)
  category_preferences JSONB DEFAULT '{}',
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
```

### 1.3 Create `notification_mentions` table

For @mentions and team collaboration:

```sql
CREATE TABLE notification_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  mentioned_by_user_id UUID NOT NULL,
  context_type TEXT NOT NULL, -- 'project_note', 'comment', 'task'
  context_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Phase 2: Unified Notification Service

### 2.1 Create Edge Function: `unified-notification-service`

Central service to handle all notification creation with deduplication:

```typescript
// Key features:
// - Deduplication using group_key (prevents duplicate appointment notifications)
// - Auto-sets action_url based on source_type
// - Handles priority escalation
// - Triggers real-time broadcast
// - Respects user preferences and quiet hours
```

### 2.2 Create Edge Function: `notification-digest`

For email digest delivery:

```typescript
// Scheduled via cron (daily/weekly)
// Aggregates unread notifications
// Sends formatted HTML digest email
// Groups by category for easy scanning
```

### 2.3 Update Existing Triggers

Modify appointment, project, and quote creation to use unified service instead of direct inserts.

---

## Phase 3: Real-Time Notification Delivery

### 3.1 Supabase Realtime Subscription

```typescript
// In NotificationProvider context:
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
    (payload) => {
      // Show toast/browser notification
      // Update notification count badge
      // Play sound if enabled
    }
  )
  .subscribe();
```

### 3.2 Browser Notification API Integration

```typescript
// Request permission on first login
// Show native browser notifications for high-priority items
// Deep link to relevant page on click
```

---

## Phase 4: New UI Components

### 4.1 `UnifiedNotificationCenter.tsx`

Full-page notification hub accessible from sidebar:

| Tab | Description |
|-----|-------------|
| **Inbox** | All unread notifications with actions |
| **All** | Complete notification history |
| **Mentions** | @mentions and replies directed to you |
| **Settings** | Channel preferences, digest options, quiet hours |

### 4.2 `NotificationFilters.tsx`

Filter bar with:
- Category pills (All, Projects, Appointments, Quotes, Team, System)
- Priority filter (High, Normal, Low)
- Date range selector
- Search box

### 4.3 `NotificationItem.tsx`

Enhanced notification card:
- Priority indicator (colored dot/star)
- Source icon (project, calendar, quote, user)
- Smart action buttons based on source_type
- Relative timestamp with hover for exact time
- Swipe actions (mark read, archive)

### 4.4 `NotificationSettingsPanel.tsx`

Preferences UI:
- Toggle channels (Email, Push, SMS)
- Digest frequency selector
- Per-category notification toggles
- Quiet hours configuration
- Test notification button

---

## Phase 5: @Mentions and Team Replies

### 5.1 Mention Detection

In project notes and comments:

```typescript
// Detect @username patterns
const mentionPattern = /@(\w+)/g;
// Parse and create notification_mentions records
// Notify mentioned users in real-time
```

### 5.2 Reply Threading

```typescript
// Use parent_id field for threading
// Show "In reply to..." context
// Navigate to original notification on click
```

### 5.3 Quick Reply Feature

- Reply inline from notification dropdown
- Full reply opens relevant context (note, comment, etc.)

---

## Phase 6: Automation and Cleanup

### 6.1 Cron Jobs via `pg_cron`

| Schedule | Job | Description |
|----------|-----|-------------|
| Every minute | `process-pending-notifications` | Send due reminders |
| Daily 9 AM | `send-daily-digest` | Email digest for subscribed users |
| Weekly Monday | `send-weekly-digest` | Weekly summary |
| Daily 2 AM | `cleanup-old-notifications` | Archive notifications older than 90 days |

### 6.2 Auto-Cleanup Migration

```sql
-- Delete read notifications older than 90 days
-- Archive unread ones older than 180 days
-- Deduplicate existing duplicates
```

---

## Implementation Order

| Phase | Tasks | Effort |
|-------|-------|--------|
| **Phase 1** | Database schema migration, add new columns | 2 hours |
| **Phase 2** | Unified notification edge function | 3 hours |
| **Phase 3** | Real-time subscription + browser notifications | 2 hours |
| **Phase 4** | New UI components (Inbox, Filters, Settings) | 4 hours |
| **Phase 5** | @Mentions system | 3 hours |
| **Phase 6** | Cron automation + cleanup | 2 hours |

**Total estimated effort: 16 hours (can be done incrementally)**

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/unified-notification-service/index.ts` | Central notification creation API |
| `supabase/functions/notification-digest/index.ts` | Email digest sender |
| `src/contexts/NotificationContext.tsx` | Real-time subscription + state |
| `src/components/notifications/UnifiedNotificationCenter.tsx` | Full inbox page |
| `src/components/notifications/NotificationFilters.tsx` | Filter controls |
| `src/components/notifications/NotificationSettingsPanel.tsx` | Preferences UI |
| `src/components/notifications/MentionInput.tsx` | @mention autocomplete |
| `src/hooks/useUnifiedNotifications.ts` | Data fetching + mutations |
| `src/hooks/useNotificationPreferences.ts` | Preferences CRUD |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/TopBar.tsx` | Link to new notification center |
| `src/components/notifications/GeneralNotificationDropdown.tsx` | Use new context, add quick filters |
| `src/hooks/useProjectNotes.ts` | Add @mention detection |
| `supabase/config.toml` | Add new edge functions |

---

## Expected Outcomes

1. **Unified inbox**: One place for ALL notifications
2. **Real-time delivery**: Instant updates without page refresh
3. **Actionable**: Every notification has a clear action button
4. **No duplicates**: Smart deduplication using group_key
5. **Filterable**: Find what you need quickly
6. **Email digests**: Daily/weekly summaries for offline users
7. **@Mentions**: Team collaboration with direct notifications
8. **Self-cleaning**: Automatic archival of old notifications
9. **Preference control**: Users choose what and how they're notified

---

## Technical Considerations

- RLS policies needed for new tables (user can only see own notifications)
- Index on `notifications(user_id, read, created_at)` for performance
- Rate limiting on notification creation to prevent spam
- Graceful degradation if real-time connection drops
