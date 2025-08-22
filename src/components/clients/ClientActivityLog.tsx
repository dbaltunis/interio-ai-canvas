
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, User, Phone, Mail, FileText, DollarSign, Clock, MessageSquare, Settings, AlertCircle } from "lucide-react";
import { useClientActivityLog, useCreateClientActivity, type ClientActivity } from "@/hooks/useClientActivityLog";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ClientActivityLogProps {
  clientId: string;
}

export const ClientActivityLog = ({ clientId }: ClientActivityLogProps) => {
  const { data: activities, isLoading, error } = useClientActivityLog(clientId);
  const { data: currentUser } = useCurrentUserProfile();
  const createActivity = useCreateClientActivity();
  const { toast } = useToast();
  
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activity_type: '',
    title: '',
    description: '',
    value_amount: '',
    team_member: currentUser?.display_name || '',
    follow_up_date: ''
  });

  const handleAddActivity = async () => {
    if (!newActivity.activity_type || !newActivity.title) {
      toast({
        title: "Error",
        description: "Please fill in activity type and title",
        variant: "destructive"
      });
      return;
    }

    try {
      await createActivity.mutateAsync({
        client_id: clientId,
        activity_type: newActivity.activity_type,
        title: newActivity.title,
        description: newActivity.description || null,
        value_amount: newActivity.value_amount ? parseFloat(newActivity.value_amount) : null,
        team_member: newActivity.team_member || null,
        follow_up_date: newActivity.follow_up_date || null,
        metadata: {}
      });

      setNewActivity({
        activity_type: '',
        title: '',
        description: '',
        value_amount: '',
        team_member: currentUser?.display_name || '',
        follow_up_date: ''
      });
      setShowAddActivity(false);
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'quote': return <FileText className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'note': return <MessageSquare className="h-4 w-4" />;
      case 'update': return <Settings className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'email': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
      case 'quote': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      case 'payment': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
      case 'note': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700';
      case 'update': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800';
      default: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading activity log...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Client Activity Log
            </CardTitle>
            <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Client Activity</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="activity_type">Activity Type</Label>
                    <Select 
                      value={newActivity.activity_type} 
                      onValueChange={(value) => setNewActivity(prev => ({ ...prev, activity_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="quote">Quote Sent</SelectItem>
                        <SelectItem value="payment">Payment Received</SelectItem>
                        <SelectItem value="note">Note/Update</SelectItem>
                        <SelectItem value="update">Status Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief description of activity"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed notes about this activity"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="team_member">Team Member</Label>
                    <Input
                      id="team_member"
                      value={newActivity.team_member}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, team_member: e.target.value }))}
                      placeholder="Who handled this activity"
                    />
                  </div>

                  <div>
                    <Label htmlFor="value_amount">Value Amount ($)</Label>
                    <Input
                      id="value_amount"
                      type="number"
                      step="0.01"
                      value={newActivity.value_amount}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, value_amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="follow_up_date">Follow-up Date</Label>
                    <Input
                      id="follow_up_date"
                      type="date"
                      value={newActivity.follow_up_date}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, follow_up_date: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAddActivity(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddActivity} disabled={createActivity.isPending}>
                      {createActivity.isPending ? 'Adding...' : 'Add Activity'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Activity log is not available yet</p>
            <p className="text-sm mt-2">You can start tracking activities by adding your first entry</p>
            <Button className="mt-4" variant="outline" onClick={() => setShowAddActivity(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Client Activity Log
          </CardTitle>
          <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Client Activity</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="activity_type">Activity Type</Label>
                  <Select 
                    value={newActivity.activity_type} 
                    onValueChange={(value) => setNewActivity(prev => ({ ...prev, activity_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="quote">Quote Sent</SelectItem>
                      <SelectItem value="payment">Payment Received</SelectItem>
                      <SelectItem value="note">Note/Update</SelectItem>
                      <SelectItem value="update">Status Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of activity"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed notes about this activity"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="team_member">Team Member</Label>
                  <Input
                    id="team_member"
                    value={newActivity.team_member}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, team_member: e.target.value }))}
                    placeholder="Who handled this activity"
                  />
                </div>

                <div>
                  <Label htmlFor="value_amount">Value Amount ($)</Label>
                  <Input
                    id="value_amount"
                    type="number"
                    step="0.01"
                    value={newActivity.value_amount}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, value_amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="follow_up_date">Follow-up Date</Label>
                  <Input
                    id="follow_up_date"
                    type="date"
                    value={newActivity.follow_up_date}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, follow_up_date: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAddActivity(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddActivity} disabled={createActivity.isPending}>
                    {createActivity.isPending ? 'Adding...' : 'Add Activity'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!activities || activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No activities recorded yet</p>
            <Button className="mt-2" variant="outline" onClick={() => setShowAddActivity(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Activity
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: ClientActivity) => (
              <div key={activity.id} className="flex gap-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-background border-2 flex items-center justify-center">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                </div>
                <div className="flex-grow space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{activity.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getActivityColor(activity.activity_type)} border text-xs`} variant="secondary">
                          {activity.activity_type}
                        </Badge>
                        {activity.team_member && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            {activity.team_member}
                          </div>
                        )}
                        {activity.value_amount && (
                          <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            <DollarSign className="h-3 w-3" />
                            ${activity.value_amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  )}
                  
                  {activity.follow_up_date && (
                    <div className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
                      <Calendar className="h-3 w-3" />
                      Follow-up: {new Date(activity.follow_up_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
