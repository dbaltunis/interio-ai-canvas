
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: any;
  project?: any;
}

export const JobNotesDialog = ({ open, onOpenChange, quote, project }: JobNotesDialogProps) => {
  const [note, setNote] = useState("");
  const [existingNotes, setExistingNotes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load existing notes when dialog opens
  useEffect(() => {
    if (open && quote?.id) {
      loadExistingNotes();
    }
  }, [open, quote?.id]);

  const loadExistingNotes = async () => {
    try {
      // For now, we'll simulate loading notes from localStorage
      // In a real implementation, this would fetch from Supabase
      const savedNotes = localStorage.getItem(`job_notes_${quote.id}`);
      if (savedNotes) {
        setExistingNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

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
      // For now, we'll save to localStorage
      // In a real implementation, this would save to Supabase
      const timestamp = new Date().toISOString();
      const newNote = `${timestamp}: ${note.trim()}`;
      const updatedNotes = [...existingNotes, newNote];
      
      localStorage.setItem(`job_notes_${quote.id}`, JSON.stringify(updatedNotes));
      setExistingNotes(updatedNotes);
      
      console.log('Saving note for job:', quote?.id, 'Note:', note);
      
      toast({
        title: "Note Saved",
        description: "Your note has been added to the job successfully",
      });
      
      setNote("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNote("");
    onOpenChange(false);
  };

  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <StickyNote className="h-5 w-5" />
            <span>Add Note - {quote.quote_number || quote.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Show existing notes */}
          {existingNotes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Previous Notes:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {existingNotes.map((existingNote, index) => (
                  <div key={index} className="text-xs bg-gray-50 p-2 rounded border">
                    {existingNote}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">New Note:</label>
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
