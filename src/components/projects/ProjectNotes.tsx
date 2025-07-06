
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StickyNote, Plus, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProjectNotesProps {
  projectId: string;
}

interface ProjectNote {
  id: string;
  content: string;
  type: 'general' | 'client' | 'technical' | 'important';
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export const ProjectNotes = ({ projectId }: ProjectNotesProps) => {
  const [notes, setNotes] = useState<ProjectNote[]>([
    {
      id: '1',
      content: 'Client prefers darker fabric colors. Avoid bright or light shades.',
      type: 'client',
      createdBy: 'Sarah Wilson',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      content: 'Special mounting brackets required for the bay window. Check with supplier.',
      type: 'technical',
      createdBy: 'Mike Johnson',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      content: 'URGENT: Client requested completion by end of month for special event.',
      type: 'important',
      createdBy: 'John Doe',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'general' as ProjectNote['type']
  });

  const handleAddNote = () => {
    if (newNote.content.trim()) {
      const note: ProjectNote = {
        id: Date.now().toString(),
        content: newNote.content,
        type: newNote.type,
        createdBy: 'Current User', // In real implementation, get from auth context
        createdAt: new Date().toISOString()
      };
      
      setNotes([note, ...notes]);
      setNewNote({ content: '', type: 'general' });
      setShowAddNote(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-green-100 text-green-800';
      case 'important': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'client': return 'Client';
      case 'technical': return 'Technical';
      case 'important': return 'Important';
      default: return 'General';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Project Notes ({notes.length})
            </CardTitle>
            <Button onClick={() => setShowAddNote(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNote className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No notes added to this project yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getNoteTypeColor(note.type)}>
                        {getNoteTypeLabel(note.type)}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{note.createdBy}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                  
                  <p className="text-gray-900 leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Note Form */}
      {showAddNote && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Note Type</label>
              <select
                value={newNote.type}
                onChange={(e) => setNewNote({...newNote, type: e.target.value as ProjectNote['type']})}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="general">General</option>
                <option value="client">Client Related</option>
                <option value="technical">Technical</option>
                <option value="important">Important</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Note Content</label>
              <Textarea
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                placeholder="Enter your note here..."
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleAddNote} disabled={!newNote.content.trim()}>
                Add Note
              </Button>
              <Button variant="outline" onClick={() => setShowAddNote(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
