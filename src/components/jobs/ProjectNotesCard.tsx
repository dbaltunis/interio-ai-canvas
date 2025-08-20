
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
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Project Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Compact Add Note Section */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3">
            <Textarea
              placeholder="Meeting notes, decisions, follow-ups..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={saving}
              className="min-h-[80px] resize-none"
            />
            
            {/* Inline mention and submit */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2 flex-1">
                <AtSign className="h-4 w-4 text-muted-foreground shrink-0" />
                <Select onValueChange={(val) => {
                  if (!selectedMentions.includes(val)) {
                    setSelectedMentions((prev) => [...prev, val]);
                  }
                }}>
                  <SelectTrigger className="w-48 h-8">
                    <SelectValue placeholder="Mention teammate" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleAdd} 
                disabled={saving || !note.trim()} 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Add Note"}
              </Button>
            </div>
            
            {/* Mentions Display */}
            {selectedMentions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMentions.map((uid) => {
                  const tm = teamMembers.find((t) => t.id === uid);
                  return (
                    <span key={uid} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-1 text-xs">
                      @{tm?.name || 'User'}
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
            )}
          </div>
        </div>

        {/* Compact Notes List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Recent Notes</span>
            <span className="text-xs text-muted-foreground">{notes.length} notes</span>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto bg-muted/20 rounded-lg p-3">
            {loading && (
              <div className="text-sm text-muted-foreground text-center py-4">Loading notes...</div>
            )}
            {error && <div className="text-sm text-destructive text-center py-4">Error: {error}</div>}
            {!loading && notes.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">
                No notes yet. Add your first note above.
              </div>
            )}
            {notes.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border/50">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground whitespace-pre-wrap break-words">{n.content}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive" 
                  onClick={() => handleDelete(n.id)}
                >
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
