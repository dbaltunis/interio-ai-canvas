import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFollowUpReminders, useMarkReminderCompleted } from "@/hooks/useMarketing";
import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle2, Clock, User, Target, Calendar, Plus, Edit2, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EditableFollowUpManagerProps {
  clientId?: string;
}

export const EditableFollowUpManager = ({ clientId }: EditableFollowUpManagerProps) => {
  const { data: allReminders, isLoading } = useFollowUpReminders();
  const markCompleted = useMarkReminderCompleted();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [newReminder, setNewReminder] = useState({
    message: "",
    reminder_type: "follow_up",
    scheduled_for: "",
  });

  const reminders = clientId 
    ? (allReminders as any[])?.filter((r: any) => r.client_id === clientId)
    : allReminders;

  const handleAddReminder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("follow_up_reminders")
        .insert({
          client_id: clientId,
          user_id: user.id,
          message: newReminder.message,
          reminder_type: newReminder.reminder_type,
          scheduled_for: newReminder.scheduled_for,
          status: "pending",
        });

      if (error) throw error;

      // Removed unnecessary success toast

      setIsAddDialogOpen(false);
      setNewReminder({
        message: "",
        reminder_type: "follow_up",
        scheduled_for: "",
      });
      queryClient.invalidateQueries({ queryKey: ["follow-up-reminders"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive",
      });
    }
  };

  const handleUpdateReminder = async () => {
    try {
      const { error } = await supabase
        .from("follow_up_reminders")
        .update({
          message: editingReminder.message,
          reminder_type: editingReminder.reminder_type,
          scheduled_for: editingReminder.scheduled_for,
        })
        .eq("id", editingReminder.id);

      if (error) throw error;

      // Removed unnecessary success toast

      setEditingReminder(null);
      queryClient.invalidateQueries({ queryKey: ["follow-up-reminders"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from("follow_up_reminders")
        .delete()
        .eq("id", reminderId);

      if (error) throw error;

      // Removed unnecessary success toast

      queryClient.invalidateQueries({ queryKey: ["follow-up-reminders"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Follow-up Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading reminders...</div>
        </CardContent>
      </Card>
    );
  }

  const overdueReminders = (reminders as any[])?.filter((r: any) => new Date(r.scheduled_for) < new Date()) || [];
  const upcomingReminders = (reminders as any[])?.filter((r: any) => new Date(r.scheduled_for) >= new Date()) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Follow-up Reminders ({reminders?.length || 0})
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Follow-up Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newReminder.message}
                    onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                    placeholder="Follow up on quote..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newReminder.reminder_type}
                    onValueChange={(value) => setNewReminder({ ...newReminder, reminder_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="email_reply">Email Reply</SelectItem>
                      <SelectItem value="call_back">Call Back</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled">Scheduled For</Label>
                  <Input
                    id="scheduled"
                    type="datetime-local"
                    value={newReminder.scheduled_for}
                    onChange={(e) => setNewReminder({ ...newReminder, scheduled_for: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddReminder}>Create Reminder</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!reminders?.length ? (
          <div className="text-center text-muted-foreground py-8">
            No pending reminders. Create one to stay on top of follow-ups!
          </div>
        ) : (
          <>
            {overdueReminders.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-destructive mb-3">
                  Overdue ({overdueReminders.length})
                </h4>
                <div className="space-y-2">
                  {overdueReminders.map((reminder: any) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      isOverdue
                      onEdit={setEditingReminder}
                      onDelete={handleDeleteReminder}
                      onComplete={() => markCompleted.mutate(reminder.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {upcomingReminders.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-primary mb-3">
                  Upcoming ({upcomingReminders.length})
                </h4>
                <div className="space-y-2">
                  {upcomingReminders.map((reminder: any) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onEdit={setEditingReminder}
                      onDelete={handleDeleteReminder}
                      onComplete={() => markCompleted.mutate(reminder.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingReminder} onOpenChange={(open) => !open && setEditingReminder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
          </DialogHeader>
          {editingReminder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-message">Message</Label>
                <Textarea
                  id="edit-message"
                  value={editingReminder.message}
                  onChange={(e) => setEditingReminder({ ...editingReminder, message: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={editingReminder.reminder_type}
                  onValueChange={(value) => setEditingReminder({ ...editingReminder, reminder_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="email_reply">Email Reply</SelectItem>
                    <SelectItem value="call_back">Call Back</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-scheduled">Scheduled For</Label>
                <Input
                  id="edit-scheduled"
                  type="datetime-local"
                  value={editingReminder.scheduled_for ? new Date(editingReminder.scheduled_for).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditingReminder({ ...editingReminder, scheduled_for: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingReminder(null)}>Cancel</Button>
                <Button onClick={handleUpdateReminder}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

interface ReminderCardProps {
  reminder: any;
  isOverdue?: boolean;
  onEdit: (reminder: any) => void;
  onDelete: (id: string) => void;
  onComplete: () => void;
}

const ReminderCard = ({ reminder, isOverdue, onEdit, onDelete, onComplete }: ReminderCardProps) => {
  const scheduledDate = new Date(reminder.scheduled_for);
  const client = reminder.clients;
  const deal = reminder.deals;

  return (
    <div className={`p-3 border rounded-lg transition-colors ${
      isOverdue ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm mb-1 break-words">{reminder.message}</div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {client && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{client?.client_type === 'B2B' ? client?.company_name : client?.name}</span>
              </div>
            )}
            {deal && (
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 shrink-0" />
                <span className="truncate">{deal.title}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-xs">
              {reminder.reminder_type.replace('_', ' ')}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {isOverdue ? (
                <span className="text-destructive">
                  {formatDistanceToNow(scheduledDate, { addSuffix: true })}
                </span>
              ) : (
                format(scheduledDate, 'MMM d, h:mm a')
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(reminder)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(reminder.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={onComplete}
            className="h-8 px-3"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
