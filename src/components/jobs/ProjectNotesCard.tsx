
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProjectNotes } from "@/hooks/useProjectNotes";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { StickyNote, Trash2, Save, X, AtSign } from "lucide-react";

interface ProjectNotesCardProps {
  projectId: string;
}

export const ProjectNotesCard = ({ projectId }: ProjectNotesCardProps) => {
  const { notes, addNote, deleteNote, loading, error } = useProjectNotes({ projectId });
  const { data: teamMembers = [] } = useTeamMembers();
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [showAllNotes, setShowAllNotes] = useState(false);

  const displayedNotes = showAllNotes ? notes : notes.slice(0, 3);

  const handleAssignTask = (note: any) => {
    toast({
      title: "Task Assignment",
      description: "Task assignment feature coming soon",
    });
  };

  const handleAdd = async () => {
    if (!note.trim()) {
      toast({ title: "Empty note", description: "Please type something", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await addNote(note.trim(), "general", selectedMentions);
      setNote("");
      setSelectedMentions([]);
      toast({ title: "Saved", description: "Note added" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Unable to add note", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      toast({ title: "Deleted", description: "Note removed" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Unable to delete note", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Project Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Add a note</label>
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="Meeting notes, decisions, follow-ups..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={saving}
              className="min-h-[96px]"
            />
            <div className="flex items-center gap-2">
              <AtSign className="h-4 w-4 text-muted-foreground" />
              <Select onValueChange={(val) => {
                if (!selectedMentions.includes(val)) {
                  setSelectedMentions((prev) => [...prev, val]);
                }
              }}>
                <SelectTrigger className="w-56 z-50">
                  <SelectValue placeholder="Mention teammate" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                {selectedMentions.map((uid) => {
                  const tm = teamMembers.find((t) => t.id === uid);
                  return (
                    <span key={uid} className="inline-flex items-center gap-1 rounded border bg-muted/40 px-2 py-1 text-xs">
                      {tm?.name || 'User'}
                      <button
                        type="button"
                        onClick={() => setSelectedMentions((prev) => prev.filter((id) => id !== uid))}
                        className="opacity-70 hover:opacity-100"
                        aria-label="Remove mention"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAdd} disabled={saving || !note.trim()} className="bg-brand-primary hover:bg-brand-accent">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Add Note"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Recent notes</label>
            {notes.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAllNotes(!showAllNotes)}
                className="text-xs"
              >
                {showAllNotes ? 'Show less' : `Show all ${notes.length} notes`}
              </Button>
            )}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading && (
              <div className="text-sm text-muted-foreground">Loading notes...</div>
            )}
            {error && <div className="text-sm text-destructive">Error: {error}</div>}
            {!loading && notes.length === 0 && (
              <div className="text-sm text-muted-foreground">No notes yet.</div>
            )}
            {displayedNotes.map(n => (
              <div key={n.id} className="flex items-start justify-between gap-2 border rounded p-2 bg-muted/40">
                <div className="flex-1">
                  <div className="text-sm whitespace-pre-wrap">{n.content}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleString()}
                    {n.mentions && n.mentions.length > 0 && (
                      <span className="ml-2">
                        • Mentions: {n.mentions.map(m => teamMembers.find(tm => tm.id === (typeof m === 'string' ? m : m.mentioned_user_id))?.name).filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAssignTask(n)}
                    className="h-7 px-2 text-xs"
                  >
                    Assign Task
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(n.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
