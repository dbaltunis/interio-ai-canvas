

# Remove Click Navigation from Notifications + Add "Tracking Only" Badge

## Changes (1 file: `ResponsiveHeader.tsx`)

### 1. Remove click-to-navigate behavior (lines 339-390)

Replace the notification item `<div>` to:
- Remove `cursor-pointer` class
- Remove `hover:bg-accent/50` (no hover effect suggesting clickability)
- Replace the entire `onClick` handler with a simple `markAsRead` call (just marks as read on click, no navigation)

### 2. Add a "Tracking" badge

Next to the timestamp row (line 404-412), add a small muted badge that says "Tracking" with an eye icon -- indicating these notifications are informational only, not actionable links. Uses existing Badge component with `outline` variant and muted styling to keep it subtle.

```
<Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 text-muted-foreground/60 border-muted-foreground/20">
  <Eye className="h-2.5 w-2.5 mr-0.5" />
  Tracking
</Badge>
```

### 3. Remove dismiss button hover behavior

The dismiss (X) button currently has `opacity-0 group-hover:opacity-100` but since we removed hover styling, we'll make it always subtly visible at low opacity (`opacity-40 hover:opacity-100`).

## What stays the same
- Notification content (title, message, timestamp, unread dot)
- Mark all read / Clear all buttons
- Real-time subscription
- Bell icon with unread count badge

