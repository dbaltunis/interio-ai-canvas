
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useProjectNotes } from "@/hooks/useProjectNotes";
import { StickyNote, Trash2, Save } from "lucide-react";

interface ProjectNotesCardProps {
  projectId: string;
}

export const ProjectNotesCard = ({ projectId }: ProjectNotesCardProps) => {
  const { notes, addNote, deleteNote, loading } = useProjectNotes({ projectId });
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!note.trim()) {
      toast({ title: "Empty note", description: "Please type something", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await addNote(note.trim(), "general");
      setNote("");
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
            <div className="flex justify-end">
              <Button onClick={handleAdd} disabled={saving || !note.trim()} className="bg-brand-primary hover:bg-brand-accent">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Add Note"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Previous notes</label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading && (
              <div className="text-sm text-muted-foreground">Loading notes...</div>
            )}
            {!loading && notes.length === 0 && (
              <div className="text-sm text-muted-foreground">No notes yet.</div>
            )}
            {notes.map(n => (
              <div key={n.id} className="flex items-start justify-between gap-2 border rounded p-2 bg-muted/40">
                <div className="flex-1">
                  <div className="text-sm whitespace-pre-wrap">{n.content}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(n.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
