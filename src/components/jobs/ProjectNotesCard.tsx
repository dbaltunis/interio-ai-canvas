import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useProjectNotes } from "@/hooks/useProjectNotes";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { StickyNote, Trash2, Save, X, AtSign, ChevronDown, ChevronUp, Plus, Edit } from "lucide-react";
import { PixelNoteIcon } from "@/components/icons/PixelArtIcons";
import { useFormattedDates } from "@/hooks/useFormattedDate";

interface ProjectNotesCardProps {
  projectId: string;
}

export const ProjectNotesCard = ({ projectId }: ProjectNotesCardProps) => {
  const { notes, addNote, updateNote, deleteNote, loading, error } = useProjectNotes({ projectId });
  const { data: teamMembers = [] } = useTeamMembers();
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  // Edit state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  
  // Format dates using user preferences - useCallback prevents infinite re-render
  const getNotesDate = useCallback((n: any) => n.created_at, []);
  const { formattedDates } = useFormattedDates(notes, getNotesDate, true);

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
      setIsAddingNote(false);
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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-card">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Project Notes
                {notes.length > 0 && (
                  <span className="text-sm text-muted-foreground font-normal">({notes.length})</span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {!isOpen && notes.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Last updated {formattedDates[notes[0].id] || 'Loading...'}
                  </span>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Notes List */}
            {loading && (
              <div className="text-sm text-muted-foreground text-center py-4">Loading notes...</div>
            )}
            {error && <div className="text-sm text-destructive text-center py-4">Error: {error}</div>}
            
            {!loading && notes.length === 0 && !isAddingNote && (
              <div className="text-center py-8 bg-muted/20 rounded-lg">
                <PixelNoteIcon className="mx-auto mb-3" size={48} />
                <h4 className="font-medium text-foreground mb-1">Capture your ideas!</h4>
                <p className="text-sm text-muted-foreground mb-4">Add notes to keep track of project details</p>
                <Button onClick={() => setIsAddingNote(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Note
                </Button>
              </div>
            )}
            
            {!loading && notes.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {notes.map(n => (
                  <div key={n.id} className="group relative p-3 bg-muted/20 rounded-lg border border-border/50 hover:border-border transition-all">
                    {editingNoteId === n.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[60px] resize-none bg-background"
                          disabled={editSaving}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={editSaving}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => handleSaveEdit(n.id)} disabled={editSaving || !editContent.trim()}>
                            <Save className="h-3.5 w-3.5 mr-1" />
                            {editSaving ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                            {n.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formattedDates[n.id] || 'Loading...'}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-muted transition-all" 
                            onClick={() => handleStartEdit(n)}
                            title="Edit note"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all" 
                            onClick={() => handleDelete(n.id)}
                            title="Delete note"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Note Section */}
            {(notes.length > 0 || isAddingNote) && (
              <>
                {!isAddingNote ? (
                  <Button 
                    onClick={() => setIsAddingNote(true)} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                ) : (
                  <div className="space-y-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <Textarea
                      placeholder="Type your note here..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      disabled={saving}
                      className="min-h-[80px] resize-none bg-background"
                    />
                    
                    {/* Mention teammate */}
                    <div className="flex items-center gap-2">
                      <AtSign className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Select onValueChange={(val) => {
                        if (!selectedMentions.includes(val)) {
                          setSelectedMentions((prev) => [...prev, val]);
                        }
                      }}>
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="Mention teammate (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Selected mentions */}
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
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setIsAddingNote(false);
                          setNote("");
                          setSelectedMentions([]);
                        }}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAdd} 
                        disabled={saving || !note.trim()} 
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Note"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
