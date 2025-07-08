import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Save, Plus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: any;
  project?: any;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  author: string;
}

export const JobNotesDialog = ({ open, onOpenChange, quote, project }: JobNotesDialogProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock notes data - replace with real API call
  useEffect(() => {
    if (open) {
      setNotes([
        {
          id: "1",
          content: "Initial consultation completed. Client prefers neutral colors.",
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          author: "John Smith"
        },
        {
          id: "2", 
          content: "Measurements taken for living room windows. Need to schedule kitchen visit.",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          author: "Sarah Johnson"
        }
      ]);
    }
  }, [open]);

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    
    setIsLoading(true);
    try {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote,
        created_at: new Date().toISOString(),
        author: "Current User"
      };
      
      setNotes(prev => [note, ...prev]);
      setNewNote("");
      
      toast({
        title: "Note Saved",
        description: "Your note has been added to the job",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Job Notes - {quote.quote_number}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 flex-1">
          {/* Add new note */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add a new note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveNote}
                disabled={!newNote.trim() || isLoading}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>

          {/* Notes list */}
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notes yet. Add your first note above.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {note.author}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};