import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Plus, MessageSquare, Trash2 } from "lucide-react";
import { useProjectNotes } from "@/hooks/useProjectNotes";
import { useToast } from "@/hooks/use-toast";

interface CompactProjectNotesProps {
  projectId: string;
}

export const CompactProjectNotes: React.FC<CompactProjectNotesProps> = ({ projectId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { notes = [], addNote, deleteNote } = useProjectNotes({ projectId });

  const handleSaveNote = async () => {
    if (!noteInput.trim()) return;
    
    setIsLoading(true);
    try {
      await addNote(noteInput);
      setNoteInput("");
      setIsAddingNote(false);
      toast({
        title: "Note Added",
        description: "Project note has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      toast({
        title: "Note Deleted",
        description: "Project note has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <CardTitle className="text-base">Project Notes</CardTitle>
                {notes.length > 0 && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    {notes.length}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingNote(true);
                    setIsExpanded(true);
                  }}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Note
                </Button>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {/* Add Note Form */}
            {isAddingNote && (
              <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                <Textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add a project note..."
                  className="min-h-[80px] text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingNote(false);
                      setNoteInput("");
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNote}
                    disabled={!noteInput.trim() || isLoading}
                    className="text-xs"
                  >
                    {isLoading ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Notes */}
            {notes.length > 0 ? (
              <div className="space-y-2">
                {notes.slice(0, 3).map((note: any) => (
                  <div
                    key={note.id}
                    className="text-sm p-3 border rounded-lg bg-background flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <p className="text-foreground whitespace-pre-wrap">{note.note}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(note.created_at).toLocaleDateString()} at{" "}
                        {new Date(note.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="ml-2 p-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {notes.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    and {notes.length - 3} more note{notes.length - 3 > 1 ? 's' : ''}...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No project notes yet
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
