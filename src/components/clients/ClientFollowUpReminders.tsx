
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Plus, Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle2, Mail, Smartphone } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useCreateReminderNotification, useScheduleReminder } from "@/hooks/useReminderNotifications";
import { supabase } from "@/integrations/supabase/client";

interface ClientFollowUpRemindersProps {
  clientId: string;
  clientName: string;
}

interface Reminder {
  id: string;
  type: 'email_follow_up' | 'call' | 'meeting' | 'quote_follow_up';
  title: string;
  description: string;
  dueDate: Date;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  createdAt: Date;
}

export const ClientFollowUpReminders = ({ clientId, clientName }: ClientFollowUpRemindersProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([
    // Mock data - in real implementation, this would come from the database
    {
      id: '1',
      type: 'email_follow_up',
      title: 'Follow up on quote discussion',
      description: 'Client showed interest in window treatments for living room',
      dueDate: addDays(new Date(), 2),
      dueTime: '10:00',
      priority: 'high',
      status: 'pending',
      createdAt: new Date()
    },
    {
      id: '2',
      type: 'call',
      title: 'Schedule measurement appointment',
      description: 'Client ready to move forward with consultation',
      dueDate: addDays(new Date(), -1),
      dueTime: '14:30',
      priority: 'high',
      status: 'overdue',
      createdAt: new Date()
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: 'email_follow_up',
    title: '',
    description: '',
    dueDate: addDays(new Date(), 1),
    dueTime: '09:00',
    priority: 'medium'
  });

  const createReminderNotification = useCreateReminderNotification();
  const scheduleReminder = useScheduleReminder();
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotification: true,
    appNotification: true,
    calendarEvent: false,
    smsNotification: false
  });

  const handleCreateReminder = async () => {
    // Combine date and time
    const [hours, minutes] = newReminder.dueTime.split(':').map(Number);
    const combinedDateTime = new Date(newReminder.dueDate);
    combinedDateTime.setHours(hours, minutes, 0, 0);

    const reminder: Reminder = {
      id: Date.now().toString(),
      type: newReminder.type as any,
      title: newReminder.title,
      description: newReminder.description,
      dueDate: combinedDateTime,
      dueTime: newReminder.dueTime,
      priority: newReminder.priority as any,
      status: 'pending',
      createdAt: new Date()
    };

    setReminders([reminder, ...reminders]);

    // Create notifications based on user settings
    if (notificationSettings.emailNotification || notificationSettings.appNotification) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        await createReminderNotification.mutateAsync({
          reminderId: reminder.id,
          clientId,
          clientName,
          clientEmail: user?.email,
          title: reminder.title,
          description: reminder.description,
          dueDate: combinedDateTime,
          type: reminder.type
        });

        // Schedule the reminder
        await scheduleReminder.mutateAsync(reminder);
      } catch (error) {
        console.error('Failed to create notifications:', error);
      }
    }

    setShowCreateForm(false);
    setNewReminder({
      type: 'email_follow_up',
      title: '',
      description: '',
      dueDate: addDays(new Date(), 1),
      dueTime: '09:00',
      priority: 'medium'
    });
  };

  const markCompleted = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, status: 'completed' as const } : r
    ));
  };

  const getStatusInfo = (reminder: Reminder) => {
    const now = new Date();
    if (reminder.status === 'completed') {
      return { color: 'bg-accent/10 text-accent', icon: CheckCircle2 };
    }
    if (isBefore(reminder.dueDate, now)) {
      return { color: 'bg-destructive/10 text-destructive', icon: AlertTriangle };
    }
    return { color: 'bg-secondary/10 text-secondary', icon: Clock };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      default: return 'border-l-green-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email_follow_up': return '📧';
      case 'call': return '📞';
      case 'meeting': return '🗓️';
      case 'quote_follow_up': return '💰';
      default: return '📋';
    }
  };

  // Generate time options (every 30 minutes)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        });
        times.push({ value: timeString, label: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Follow-up Reminders
          </CardTitle>
          <Button onClick={() => setShowCreateForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showCreateForm && (
          <div className="mb-6 p-4 rounded-xl border liquid-glass">
            <h4 className="font-medium mb-3">Create New Reminder</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newReminder.type} onValueChange={(value) => setNewReminder({...newReminder, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email_follow_up">Email Follow-up</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="quote_follow_up">Quote Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newReminder.priority} onValueChange={(value) => setNewReminder({...newReminder, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input 
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                  placeholder="Reminder title..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                  placeholder="Additional details..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(newReminder.dueDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newReminder.dueDate}
                        onSelect={(date) => date && setNewReminder({...newReminder, dueDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium">Due Time</label>
                  <Select value={newReminder.dueTime} onValueChange={(value) => setNewReminder({...newReminder, dueTime: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Notification Settings</Label>
                <div className="space-y-3 p-3 rounded-xl border liquid-glass">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <Label htmlFor="email-notification" className="text-sm">Email Notification</Label>
                    </div>
                    <Switch
                      id="email-notification"
                      checked={notificationSettings.emailNotification}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, emailNotification: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-accent" />
                      <Label htmlFor="app-notification" className="text-sm">App Notification</Label>
                    </div>
                    <Switch
                      id="app-notification"
                      checked={notificationSettings.appNotification}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, appNotification: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <Label htmlFor="calendar-event" className="text-sm">Calendar Event</Label>
                    </div>
                    <Switch
                      id="calendar-event"
                      checked={notificationSettings.calendarEvent}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({...notificationSettings, calendarEvent: checked});
                        if (checked && newReminder.type !== 'meeting') {
                          setNewReminder({...newReminder, type: 'meeting'});
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-secondary" />
                      <Label htmlFor="sms-notification" className="text-sm">SMS Notification</Label>
                    </div>
                    <Switch
                      id="sms-notification"
                      checked={notificationSettings.smsNotification}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, smsNotification: checked})
                      }
                      disabled
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {notificationSettings.emailNotification || notificationSettings.appNotification ? 
                      "Notifications will be sent when the reminder is due" : 
                      "Enable at least one notification method"
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateReminder} 
                  disabled={
                    createReminderNotification.isPending || 
                    (!notificationSettings.emailNotification && !notificationSettings.appNotification)
                  }
                  size="sm"
                >
                  {createReminderNotification.isPending ? 'Creating...' : 'Create Reminder'}
                </Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline" size="sm">Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {reminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No follow-up reminders set</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const statusInfo = getStatusInfo(reminder);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={reminder.id} className={`p-4 border-l-4 ${getPriorityColor(reminder.priority)} bg-white border border-gray-200 rounded-lg`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getTypeIcon(reminder.type)}</span>
                        <h4 className="font-medium text-sm">{reminder.title}</h4>
                        <Badge className={`${statusInfo.color} text-xs border-0`} variant="secondary">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {reminder.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{reminder.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Due: {format(reminder.dueDate, "MMM d, yyyy")} at {reminder.dueTime}</span>
                        <span>Priority: {reminder.priority}</span>
                      </div>
                    </div>
                    
                    {reminder.status === 'pending' && (
                      <Button 
                        onClick={() => markCompleted(reminder.id)}
                        size="sm" 
                        variant="outline"
                        className="ml-4"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
