import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Mail, AlertCircle, CheckCircle, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FollowUp {
  id: string;
  client_id: string;
  client_name: string;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'overdue';
  type: 'call' | 'email' | 'meeting' | 'task';
  created_at: string;
}

interface FollowUpManagerProps {
  clientId?: string;
  showAllClients?: boolean;
}

export const FollowUpManager = ({ clientId, showAllClients = false }: FollowUpManagerProps) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([
    {
      id: '1',
      client_id: '1',
      client_name: 'John Smith',
      title: 'Follow up on proposal',
      description: 'Check if they have reviewed the window treatment proposal',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      status: 'pending',
      type: 'call',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      client_id: '2',
      client_name: 'ABC Corporation',
      title: 'Send updated quote',
      description: 'Client requested changes to fabric selection',
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      status: 'pending',
      type: 'email',
      created_at: new Date().toISOString()
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as const,
    type: 'call' as const
  });

  const filteredFollowUps = showAllClients 
    ? followUps 
    : followUps.filter(fu => fu.client_id === clientId);

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-blue-100 text-blue-600',
      'high': 'bg-orange-100 text-orange-600',
      'urgent': 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'call': <Phone className="h-4 w-4" />,
      'email': <Mail className="h-4 w-4" />,
      'meeting': <Calendar className="h-4 w-4" />,
      'task': <CheckCircle className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || icons.call;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleAddFollowUp = () => {
    const newId = (followUps.length + 1).toString();
    const followUp: FollowUp = {
      id: newId,
      client_id: clientId || '1',
      client_name: 'Current Client',
      ...newFollowUp,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    setFollowUps([...followUps, followUp]);
    setNewFollowUp({
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      type: 'call'
    });
    setShowAddDialog(false);
  };

  const markAsCompleted = (id: string) => {
    setFollowUps(followUps.map(fu => 
      fu.id === id ? { ...fu, status: 'completed' as const } : fu
    ));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Follow-ups {showAllClients ? '' : 'for this Client'}
        </CardTitle>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Follow-up</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newFollowUp.title}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, title: e.target.value })}
                  placeholder="Follow-up title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newFollowUp.description}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, description: e.target.value })}
                  placeholder="Additional details"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newFollowUp.type} onValueChange={(value: any) => setNewFollowUp({ ...newFollowUp, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] bg-background border border-border shadow-lg">
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newFollowUp.priority} onValueChange={(value: any) => setNewFollowUp({ ...newFollowUp, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] bg-background border border-border shadow-lg">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newFollowUp.due_date}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, due_date: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddFollowUp} disabled={!newFollowUp.title || !newFollowUp.due_date}>
                  Create Follow-up
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {filteredFollowUps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No follow-ups scheduled</h3>
            <p className="text-sm">Create your first follow-up to stay on top of client communications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFollowUps
              .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
              .map((followUp) => (
                <div key={followUp.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getTypeIcon(followUp.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{followUp.title}</h4>
                          {isOverdue(followUp.due_date) && followUp.status === 'pending' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {showAllClients && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                            <User className="h-3 w-3" />
                            {followUp.client_name}
                          </p>
                        )}
                        {followUp.description && (
                          <p className="text-sm text-muted-foreground mb-2">{followUp.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(followUp.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${getPriorityColor(followUp.priority)} border-0 text-xs`} 
                        variant="outline"
                      >
                        {followUp.priority.toUpperCase()}
                      </Badge>
                      <Badge 
                        className={`${getStatusColor(followUp.status)} border-0 text-xs`} 
                        variant="outline"
                      >
                        {followUp.status.toUpperCase()}
                      </Badge>
                      {followUp.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsCompleted(followUp.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};