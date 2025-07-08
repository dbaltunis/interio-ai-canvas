
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Users, DollarSign, CalendarCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/useTeamMembers";

interface ProjectHeaderProps {
  projectName: string;
  projectNumber?: string;
  projectValue?: number;
  currentStatus?: string;
  onBack: () => void;
  onStatusChange?: (status: string) => void;
  onProjectUpdate?: (updates: any) => void;
}

export const ProjectHeader = ({ 
  projectName, 
  projectNumber,
  projectValue,
  currentStatus = "draft",
  onBack,
  onStatusChange,
  onProjectUpdate 
}: ProjectHeaderProps) => {
  const { data: jobStatuses } = useJobStatuses();
  const { data: teamMembers } = useTeamMembers();
  const { toast } = useToast();
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [hasActiveEvent, setHasActiveEvent] = useState(false); // This would come from props/state in real implementation

  const currentStatusInfo = jobStatuses?.find(s => s.name.toLowerCase() === currentStatus.toLowerCase());

  const getStatusColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'gray': 'bg-gray-100 text-gray-800 border-gray-200',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200',
      'green': 'bg-green-100 text-green-800 border-green-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200',
      'red': 'bg-red-100 text-red-800 border-red-200',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleStatusChange = (newStatus: string) => {
    const statusInfo = jobStatuses?.find(s => s.name.toLowerCase() === newStatus.toLowerCase());
    
    if (statusInfo?.action === 'requires_reason' && currentStatus !== 'lost order') {
      const reason = prompt("Please provide a reason for the lost order:");
      if (!reason) return;
      
      toast({
        title: "Status Updated",
        description: `Job status changed to ${statusInfo.name}. Reason: ${reason}`,
      });
    } else if (statusInfo?.action === 'locked') {
      toast({
        title: "Job Locked",
        description: `Job is now locked in ${statusInfo.name} status. Change status to edit.`,
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Job status changed to ${statusInfo?.name || newStatus}`,
      });
    }
    
    onStatusChange?.(newStatus);
    onProjectUpdate?.({ status: newStatus });
  };

  const handleCreateEvent = () => {
    if (!eventTitle || !eventDate || !eventTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all event details",
        variant: "destructive"
      });
      return;
    }

    const eventDetails = {
      title: eventTitle,
      description: `${eventDescription}\n\nProject: ${projectName}\nJob Number: ${projectNumber}\nValue: $${projectValue?.toLocaleString()}`,
      date: eventDate,
      time: eventTime,
      projectLink: window.location.href,
      invitedMembers: selectedTeamMembers
    };

    // Set active event indicator
    setHasActiveEvent(true);

    toast({
      title: "Event Created",
      description: `Calendar event "${eventTitle}" has been created for this project with ${selectedTeamMembers.length} team members invited`,
    });

    setShowEventDialog(false);
    setEventTitle("");
    setEventDescription("");
    setEventDate("");
    setEventTime("");
    setSelectedTeamMembers([]);
  };

  const handleInviteTeamMember = () => {
    if (!inviteEmail) {
      toast({
        title: "Missing Email",
        description: "Please enter an email address to invite",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Invitation Sent",
      description: `Team member invitation sent to ${inviteEmail}`,
    });

    setInviteEmail("");
    setShowTeamDialog(false);
  };

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Jobs</span>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">{projectName}</h1>
            <div className="flex items-center space-x-4 mt-1">
              {projectNumber && (
                <span className="text-sm text-muted-foreground">#{projectNumber}</span>
              )}
              {projectValue && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    ${projectValue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Status Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {currentStatusInfo && (
              <Badge className={`${getStatusColorClass(currentStatusInfo.color)} text-xs`}>
                {currentStatusInfo.name.toUpperCase()}
                {currentStatusInfo.action === 'locked' && ' 🔒'}
                {currentStatusInfo.action === 'requires_reason' && ' ⚠️'}
              </Badge>
            )}
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {jobStatuses?.map((status) => (
                  <SelectItem key={status.id} value={status.name.toLowerCase()}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full bg-${status.color}-500`} />
                      <span>{status.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Type Selector */}
          <Select defaultValue="payment">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
            </SelectContent>
          </Select>

          {/* Calendar Event Creator */}
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="relative">
                {hasActiveEvent ? <CalendarCheck className="h-4 w-4 text-green-600" /> : <Calendar className="h-4 w-4" />}
                {hasActiveEvent && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Calendar Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input 
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Meeting with client..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input 
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input 
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Meeting notes, agenda items..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Invite Team Members</Label>
                  <Select onValueChange={(value) => {
                    if (!selectedTeamMembers.includes(value)) {
                      setSelectedTeamMembers([...selectedTeamMembers, value]);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team members..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers?.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTeamMembers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTeamMembers.map((memberId) => {
                        const member = teamMembers?.find(m => m.id === memberId);
                        return member ? (
                          <Badge key={memberId} variant="secondary" className="text-xs">
                            {member.name}
                            <button
                              onClick={() => setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== memberId))}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="font-medium">This event will include:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Project: {projectName}</li>
                    <li>Job Number: {projectNumber}</li>
                    <li>Project Value: ${projectValue?.toLocaleString()}</li>
                    <li>Link to this project</li>
                    <li>Invited members: {selectedTeamMembers.length}</li>
                  </ul>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateEvent}>
                    Create Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Team Collaboration */}
          <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" title="Invite Team Members">
                <Users className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address..."
                  />
                </div>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="font-medium">The invitation will include:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Access to project: {projectName}</li>
                    <li>Job Number: {projectNumber}</li>
                    <li>Collaboration permissions</li>
                    <li>Direct link to this project</li>
                  </ul>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowTeamDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteTeamMember}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
