
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, StickyNote, Trash2, Edit, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProjectNotes } from "@/hooks/useProjectNotes";

interface JobNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: any;
  project?: any;
  onNoteSaved?: (projectId: string) => void;
  onNoteDeleted?: (projectId: string) => void;
}

export const JobNotesDialog = ({ open, onOpenChange, quote, project, onNoteSaved, onNoteDeleted }: JobNotesDialogProps) => {
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Edit state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const { notes, addNote, updateNote, deleteNote, loading, error } = useProjectNotes({
    quoteId: quote?.id,
    projectId: project?.id,
  });

  const handleSaveNote = async () => {
    if (!note.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note before saving",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await addNote(note.trim(), "general");
      
      // Immediately notify parent of note count change
      if (project?.id && onNoteSaved) {
        onNoteSaved(project.id);
      }
      
      toast({
        title: "Note Saved",
        description: "Your note has been added successfully",
      });
      setNote("");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      
      // Immediately notify parent of note count change
      if (project?.id && onNoteDeleted) {
        onNoteDeleted(project.id);
      }
      
      toast({ title: "Deleted", description: "Note removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Unable to delete note", variant: "destructive" });
    }
  };

  const handleStartEdit = (n: any) => {
    setEditingNoteId(n.id);
    setEditContent(n.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) {
      toast({ title: "Empty note", description: "Please type something", variant: "destructive" });
      return;
    }
    setEditSaving(true);
    try {
      await updateNote(noteId, editContent.trim());
      setEditingNoteId(null);
      setEditContent("");
      toast({ title: "Updated", description: "Note updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Unable to update note", variant: "destructive" });
    } finally {
      setEditSaving(false);
    }
  };

  const handleClose = () => {
    setNote("");
    setEditingNoteId(null);
    setEditContent("");
    onOpenChange(false);
  };

  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <StickyNote className="h-5 w-5" />
            <span>Notes - {quote.quote_number || quote.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {notes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Previous Notes</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {notes.map((n) => (
                  <div key={n.id} className="text-xs bg-muted/40 p-2 rounded border group">
                    {editingNoteId === n.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[60px] resize-none text-xs"
                          disabled={editSaving}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleCancelEdit} disabled={editSaving}>
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                          <Button size="sm" className="h-6 text-xs" onClick={() => handleSaveEdit(n.id)} disabled={editSaving || !editContent.trim()}>
                            <Save className="h-3 w-3 mr-1" />
                            {editSaving ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="whitespace-pre-wrap text-foreground">{n.content}</div>
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {new Date(n.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleStartEdit(n)} title="Edit note">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive" onClick={() => handleDelete(n.id)} title="Delete note">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">New Note</label>
            <Textarea
              placeholder="Add your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNote}
              disabled={!note.trim() || isLoading}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
