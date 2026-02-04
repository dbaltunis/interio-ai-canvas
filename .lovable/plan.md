
## Notes Enhancement Plan

This plan addresses three improvements to the notes and team collaboration system:

1. **Make notes editable** - Users can modify existing notes
2. **Show team assignment in notes** - Automatic note created when team member is added
3. **Team Hub notification** - Assigned team members receive a message with a job link

---

### Changes Overview

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useProjectNotes.ts` | Modify | Add `updateNote` function |
| `src/components/jobs/ProjectNotesCard.tsx` | Modify | Add inline edit UI for notes |
| `src/components/jobs/JobNotesDialog.tsx` | Modify | Add edit capability to dialog notes |
| `src/hooks/useProjectAssignments.ts` | Modify | Auto-create note + Team Hub message on assignment |

---

### 1. Make Notes Editable

#### Hook Enhancement (`useProjectNotes.ts`)

Add new `updateNote` function to the hook:

```tsx
const updateNote = async (noteId: string, newContent: string, mentionedUserIds: string[] = []) => {
  const { error } = await supabase
    .from("project_notes")
    .update({ 
      content: newContent.trim(),
      updated_at: new Date().toISOString()
    })
    .eq("id", noteId);

  if (error) throw error;

  // Handle mentions update (delete old, insert new)
  await supabase.from("project_note_mentions").delete().eq("note_id", noteId);
  
  if (mentionedUserIds.length > 0) {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("project_note_mentions").insert(
      mentionedUserIds.map(uid => ({
        note_id: noteId,
        mentioned_user_id: uid,
        created_by: userData.user?.id
      }))
    );
  }

  // Update local state
  setNotes(prev => prev.map(n => 
    n.id === noteId 
      ? { ...n, content: newContent.trim(), mentions: mentionedUserIds.map(uid => ({ mentioned_user_id: uid })) }
      : n
  ));
};
```

#### UI Updates (`ProjectNotesCard.tsx`)

Add edit state and inline editing:

```tsx
// New state
const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
const [editContent, setEditContent] = useState("");

// Note display with edit mode
{editingNoteId === n.id ? (
  <div className="space-y-2">
    <Textarea
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      className="min-h-[60px]"
    />
    <div className="flex gap-2 justify-end">
      <Button variant="ghost" size="sm" onClick={() => setEditingNoteId(null)}>
        Cancel
      </Button>
      <Button size="sm" onClick={() => handleSaveEdit(n.id)}>
        Save
      </Button>
    </div>
  </div>
) : (
  <p className="text-sm">{n.content}</p>
)}

// Edit button (appears on hover next to delete)
<Button 
  variant="ghost" 
  size="icon" 
  onClick={() => {
    setEditingNoteId(n.id);
    setEditContent(n.content);
  }}
>
  <Edit className="h-3.5 w-3.5" />
</Button>
```

#### Dialog Updates (`JobNotesDialog.tsx`)

Similar inline edit capability for the dialog view of notes.

---

### 2. Show Team Assignment in Notes

When a team member is assigned to a project, automatically create a project note to provide audit trail visibility.

#### Assignment Hook (`useProjectAssignments.ts`)

Add note creation after successful assignment (after line 199):

```tsx
// After activity log insert, add a project note
await supabase
  .from("project_notes")
  .insert({
    project_id: projectId,
    user_id: user.id,
    content: `${assignedUserProfile?.display_name || 'Team member'} was assigned to this project by ${currentUserProfile?.display_name || 'Admin'}`,
    type: 'system_assignment'
  });
```

This creates a visible record in the Project Notes section showing when and who added a team member.

---

### 3. Team Hub Notification for Assigned Members

When a team member is added to a project, send them a direct message in the Team Hub so they see a notification with a link to the job.

#### Assignment Hook (`useProjectAssignments.ts`)

Add direct message after notification insert (after line 211):

```tsx
// Send Team Hub direct message for better visibility
await supabase
  .from("direct_messages")
  .insert({
    sender_id: user.id,
    recipient_id: userId,
    content: `You've been assigned to the project "${projectName || 'Untitled Project'}"! 🎉\n\nClick here to view: ${window.location.origin}/?jobId=${projectId}`
  });
```

This ensures:
- The red badge appears on the Team Hub showing unread messages
- When the team member opens Team Hub, they see the message with the job link
- Clicking the link navigates them directly to the assigned project

---

### Data Flow Summary

```text
Team Member Assignment Flow:
┌──────────────────────┐
│ Admin assigns user   │
│ to project           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 1. project_assignments │ (existing)
│ 2. project_activity_log │ (existing)
│ 3. notifications        │ (existing)
│ 4. project_notes        │ NEW - visible in notes
│ 5. direct_messages      │ NEW - Team Hub notification
│ 6. Email notification   │ (existing)
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│ Assigned user sees:  │
│ - Team Hub badge     │
│ - Direct message     │
│ - Note in project    │
│ - Email notification │
└──────────────────────┘
```

---

### Expected Results

1. **Editable Notes**: 
   - Edit button appears on hover next to delete
   - Click to enter inline edit mode with textarea
   - Save/Cancel buttons to confirm or discard changes

2. **Assignment Visibility in Notes**:
   - Automatic note: "John Smith was assigned to this project by Jane Doe"
   - Type marked as `system_assignment` to distinguish from user notes if needed
   - Shows in Project Notes section for full audit trail

3. **Team Hub Notification**:
   - Red badge appears on assigned user's Team Hub
   - Message includes project name and clickable link
   - Friendly emoji for positive notification experience

---

### Technical Details

**Database operations required:**
- `UPDATE` on `project_notes` table (for edit functionality)
- `INSERT` into `project_notes` table (for assignment notes)
- `INSERT` into `direct_messages` table (for Team Hub messages)
- `DELETE` + `INSERT` on `project_note_mentions` (for updating mentions on edit)

**Query invalidations needed:**
- `["project-notes", projectId]` - after note edit
- `["conversations"]` - after direct message sent
- Already existing invalidations for assignments remain

**No new database tables or columns required** - all functionality uses existing schema.
