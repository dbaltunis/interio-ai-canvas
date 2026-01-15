import { useState } from "react";
import { PixelNoteIcon } from "@/components/icons/PixelArtIcons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Calendar, Briefcase, X, Send, Phone, Mail, Users, FileText } from "lucide-react";
import { useUnifiedClientNotes, UnifiedNote } from "@/hooks/useUnifiedClientNotes";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ClientAllNotesSectionProps {
  clientId: string;
  canEditClient?: boolean;
}

const activityIcons: Record<string, React.ReactNode> = {
  note_added: <MessageSquare className="h-3 w-3" />,
  call_made: <Phone className="h-3 w-3" />,
  email_sent: <Mail className="h-3 w-3" />,
  meeting_held: <Users className="h-3 w-3" />,
  quote_created: <FileText className="h-3 w-3" />,
  project_started: <Briefcase className="h-3 w-3" />,
};

const getSourceBadge = (note: UnifiedNote) => {
  if (note.source === "project_note") {
    return (
      <Badge variant="outline" className="text-xs flex items-center gap-1 shrink-0 bg-primary/5">
        <Briefcase className="h-3 w-3" />
        {note.project_name || "Project"}
      </Badge>
    );
  }
  
  const icon = activityIcons[note.activity_type || "note_added"] || <MessageSquare className="h-3 w-3" />;
  const label = note.activity_type?.replace(/_/g, " ") || "Note";
  
  return (
    <Badge variant="outline" className="text-xs flex items-center gap-1 shrink-0 bg-secondary/10 capitalize">
      {icon}
      {label}
    </Badge>
  );
};

export const ClientAllNotesSection = ({ clientId, canEditClient = true }: ClientAllNotesSectionProps) => {
  const { notes, projects, isLoading, addNote } = useUnifiedClientNotes(clientId);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("general");
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      toast.error("Please enter note content");
      return;
    }

    setIsSubmitting(true);
    try {
      const projectId = selectedProjectId === "general" ? null : selectedProjectId;
      await addNote(projectId, noteContent.trim());
      toast.success("Note added successfully");
      setNoteContent("");
      setSelectedProjectId("general");
      setIsAddingNote(false);
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card variant="analytics">
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="analytics">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Notes
            {notes.length > 0 && (
              <Badge variant="secondary" className="text-xs">{notes.length}</Badge>
            )}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="h-7 text-xs"
            disabled={!canEditClient}
          >
            {isAddingNote ? (
              <>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Add Note Form */}
        {isAddingNote && (
          <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Link to Project (Optional)</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="General note (no project)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Client Note</SelectItem>
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
                disabled={isSubmitting || !noteContent.trim()}
                size="sm"
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </div>
        )}

        {/* Unified Notes List */}
        {notes.length === 0 ? (
          <div className="empty-state">
            <PixelNoteIcon className="mx-auto mb-3" size={48} />
            <p className="empty-state-text">No notes yet — add your first!</p>
          </div>
        ) : (
          <ScrollArea className="widget-scroll">
            <div className="space-y-3 pr-4">
              {notes.map((note) => (
                <div 
                  key={`${note.source}-${note.id}`} 
                  className="p-3 border rounded-lg bg-background hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {getSourceBadge(note)}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  {note.title && note.source === "activity" && (
                    <p className="text-sm font-medium mb-1">{note.title}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {note.content || note.title}
                  </p>
                  {note.team_member && (
                    <p className="text-xs text-muted-foreground mt-2">— {note.team_member}</p>
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
