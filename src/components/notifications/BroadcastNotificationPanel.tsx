import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, Users, Mail, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useBroadcastNotifications, useCreateBroadcastNotification, useSendBroadcastNotification } from "@/hooks/useBroadcastNotifications";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
import type { BroadcastNotification } from "@/hooks/useBroadcastNotifications";

interface BroadcastFormData {
  title: string;
  message: string;
  type: 'email' | 'sms' | 'both';
  recipient_type: 'all_clients' | 'team_members' | 'selected_users';
  template_id?: string;
  scheduled_for?: string;
}

export const BroadcastNotificationPanel = () => {
  const { data: broadcasts, isLoading } = useBroadcastNotifications();
  const { data: templates } = useNotificationTemplates();
  const createBroadcast = useCreateBroadcastNotification();
  const sendBroadcast = useSendBroadcastNotification();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BroadcastFormData>({
    title: "",
    message: "",
    type: "both",
    recipient_type: "all_clients",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "both",
      recipient_type: "all_clients",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createBroadcast.mutateAsync(formData);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating broadcast:", error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        title: template.name,
        message: template.message,
        type: template.type,
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'sending': return <Send className="h-4 w-4 text-orange-500 animate-pulse" />;
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-orange-100 text-orange-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div>Loading broadcast notifications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Broadcast Notifications
            </CardTitle>
            <CardDescription>
              Send notifications to multiple users at once
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Create Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Broadcast Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to multiple users simultaneously
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="template">Use Template (Optional)</Label>
                  <Select onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Notification Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Only</SelectItem>
                        <SelectItem value="sms">SMS Only</SelectItem>
                        <SelectItem value="both">Both Email & SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recipient_type">Recipients</Label>
                    <Select value={formData.recipient_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recipient_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_clients">All Clients</SelectItem>
                        <SelectItem value="team_members">Team Members</SelectItem>
                        <SelectItem value="selected_users">Selected Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Broadcast notification title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Your broadcast message..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="scheduled_for">Schedule For (Optional)</Label>
                  <Input
                    id="scheduled_for"
                    type="datetime-local"
                    value={formData.scheduled_for || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_for: e.target.value || undefined }))}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Leave empty to send immediately
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBroadcast.isPending}>
                    {formData.scheduled_for ? "Schedule" : "Create"} Broadcast
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {broadcasts && broadcasts.length > 0 ? (
            broadcasts.map((broadcast) => (
              <div key={broadcast.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{broadcast.title}</h3>
                    <Badge className={getStatusColor(broadcast.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(broadcast.status)}
                        {broadcast.status}
                      </div>
                    </Badge>
                    <Badge variant="outline">
                      {broadcast.type === 'email' ? (
                        <Mail className="h-3 w-3 mr-1" />
                      ) : broadcast.type === 'sms' ? (
                        <MessageSquare className="h-3 w-3 mr-1" />
                      ) : (
                        <Send className="h-3 w-3 mr-1" />
                      )}
                      {broadcast.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {broadcast.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {broadcast.recipient_type.replace('_', ' ')}
                    </span>
                    {broadcast.status === 'sent' && (
                      <span>
                        {broadcast.success_count}/{broadcast.recipients_count} successful
                      </span>
                    )}
                    <span>
                      {new Date(broadcast.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {broadcast.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendBroadcast.mutate(broadcast.id)}
                      disabled={sendBroadcast.isPending}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send Now
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No broadcast notifications yet</p>
              <p className="text-sm">Create your first broadcast to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};