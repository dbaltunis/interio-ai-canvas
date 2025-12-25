import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Calendar, Briefcase, X, Send } from "lucide-react";
import { useClientProjectNotes } from "@/hooks/useClientProjectNotes";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ClientAllNotesSectionProps {
  clientId: string;
  canEditClient?: boolean;
}

export const ClientAllNotesSection = ({ clientId, canEditClient = true }: ClientAllNotesSectionProps) => {
  const { notes, projects, isLoading, addNote } = useClientProjectNotes(clientId);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!selectedProjectId || !noteContent.trim()) {
      toast.error("Please select a project and enter note content");
      return;
    }

    setIsSubmitting(true);
    try {
      await addNote(selectedProjectId, noteContent.trim());
      toast.success("Note added successfully");
      setNoteContent("");
      setSelectedProjectId("");
      setIsAddingNote(false);
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNoteTypeColor = (type?: string) => {
    switch (type) {
      case 'important':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'follow-up':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'general':
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            All Project Notes
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="gap-2"
            disabled={!canEditClient}
          >
            {isAddingNote ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Note
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        {isAddingNote && (
          <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Project</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <Textarea
                placeholder="Write your note here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleAddNote} 
                disabled={isSubmitting || !selectedProjectId || !noteContent.trim()}
                size="sm"
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Add notes to your projects to see them here</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-4">
              {notes.map((note) => (
                <div 
                  key={note.id} 
                  className="p-3 border rounded-lg bg-background hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs flex items-center gap-1 shrink-0"
                    >
                      <Briefcase className="h-3 w-3" />
                      {note.projectName}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  {note.type && note.type !== 'general' && (
                    <Badge 
                      variant="outline" 
                      className={`mt-2 text-xs ${getNoteTypeColor(note.type)}`}
                    >
                      {note.type}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
