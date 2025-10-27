import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Users, DollarSign, CalendarCheck, UserPlus, FileText, Mail, Printer, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useUpdateQuote } from "@/hooks/useQuotes";
import { useUpdateProject } from "@/hooks/useProjects";
import { useNavigate } from "react-router-dom";
import { useProjectStatusChange } from "@/hooks/useProjectStatusChange";
import { LeftoverCaptureDialog } from "../projects/LeftoverCaptureDialog";
import { InventoryDeductionDialog } from "../projects/InventoryDeductionDialog";

interface ProjectHeaderProps {
  projectName: string;
  projectNumber?: string;
  projectValue?: number;
  currentStatus?: string;
  projectId?: string | any;
  quoteId?: string;
  onBack: () => void;
  onStatusChange?: (status: string) => void;
  onProjectUpdate?: (updates: any) => void;
  onTabChange?: (tab: string) => void;
  hasExistingQuote?: boolean;
}

export const ProjectHeader = ({ 
  projectName, 
  projectNumber,
  projectValue,
  currentStatus = "draft",
  projectId,
  quoteId,
  onBack,
  onStatusChange,
  onProjectUpdate,
  onTabChange,
  hasExistingQuote = false
}: ProjectHeaderProps) => {
  const { data: jobStatuses } = useJobStatuses();
  const { data: teamMembers } = useTeamMembers();
  const { toast } = useToast();
  const updateQuote = useUpdateQuote();
  const updateProject = useUpdateProject();
  const navigate = useNavigate();
  
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [hasActiveEvent, setHasActiveEvent] = useState(false);
  const [displayStatus, setDisplayStatus] = useState(currentStatus);
  const [showStatusActionDialog, setShowStatusActionDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  
  const actualProjectId = (typeof projectId === 'object' && projectId && 'project_id' in projectId) 
    ? projectId.project_id 
    : projectId;
  
  const { showLeftoverDialog, setShowLeftoverDialog, leftovers } = useProjectStatusChange({
    projectId: actualProjectId,
    currentStatus: displayStatus,
  });

  // Update display status when currentStatus prop changes
  useEffect(() => {
    setDisplayStatus(currentStatus);
  }, [currentStatus]);

  const currentStatusInfo = jobStatuses?.find(s => s.name.toLowerCase() === displayStatus.toLowerCase());

  const getStatusColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'gray': 'bg-gray-100 text-gray-800 border-gray-200',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200',
      'green': 'bg-green-100 text-green-800 border-green-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200',
      'red': 'bg-red-100 text-red-800 border-red-200',
      'primary': 'bg-primary/10 text-primary border-primary/20',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleStatusChange = async (newStatus: string) => {
    console.log('Status change requested:', { from: displayStatus, to: newStatus, projectId, quoteId });
    
    const statusInfo = jobStatuses?.find(s => s.name.toLowerCase() === newStatus.toLowerCase());
    
    try {
      // Update both project and quote status if available
      const updatePromises = [];
      
      // For projects that come from quotes, use the actual project_id from the project object
      const actualProjectId = (typeof projectId === 'object' && projectId && 'project_id' in projectId) 
        ? projectId.project_id 
        : projectId;
      
      if (actualProjectId) {
        console.log('Updating project status:', { projectId: actualProjectId, status: newStatus });
        updatePromises.push(
          updateProject.mutateAsync({
            id: actualProjectId,
            status: newStatus
          })
        );
      }

      if (quoteId) {
        console.log('Updating quote status:', { quoteId, status: newStatus });
        updatePromises.push(
          updateQuote.mutateAsync({
            id: quoteId,
            status: newStatus
          })
        );
      }

      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      // Update display status
      setDisplayStatus(newStatus);
      console.log('Status updated successfully to:', newStatus);
      
      // Notify parent components
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
      
      if (onProjectUpdate) {
        onProjectUpdate({ status: newStatus });
      }

      // Handle status-specific actions
      if (newStatus.toLowerCase() === 'quote') {
        setPendingStatus(newStatus);
        setShowStatusActionDialog(true);
      }
      
      toast({
        title: "Status Updated",
        description: `Status changed to ${statusInfo?.name || newStatus}`,
      });
      
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
      // Revert display status on error
      setDisplayStatus(currentStatus);
    }
  };

  const handleQuoteAction = (action: string) => {
    setShowStatusActionDialog(false);
    
    if (pendingStatus) {
      setDisplayStatus(pendingStatus);
      setPendingStatus(null);
    }
    
    switch (action) {
      case 'view_quote':
        // Redirect to quote tab in the current project
        if (onTabChange) {
          onTabChange('quote');
        }
        toast({
          title: "Navigating to Quote",
          description: hasExistingQuote ? "Opening existing quote for editing" : "Creating new quote with current project data",
        });
        break;
      case 'email_quote':
        // First go to quote tab, then show email composer
        if (onTabChange) {
          onTabChange('quote');
          setTimeout(() => {
            // This would trigger email composer in the quote tab
            toast({
              title: "Email Quote",
              description: "Quote tab opened. Use the email button to send to client.",
            });
          }, 500);
        }
        break;
      case 'print_quote':
        // First go to quote tab, then trigger print
        if (onTabChange) {
          onTabChange('quote');
          setTimeout(() => {
            window.print();
          }, 500);
        }
        toast({
          title: "Print Quote",
          description: "Opening quote for printing",
        });
        break;
      default:
        break;
    }
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

    console.log('Creating event:', eventDetails);
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

    console.log('Inviting team member:', inviteEmail);
    toast({
      title: "Invitation Sent",
      description: `Team member invitation sent to ${inviteEmail}`,
    });

    setInviteEmail("");
    setShowTeamDialog(false);
  };

  console.log('ProjectHeader render - displayStatus:', displayStatus, 'currentStatusInfo:', currentStatusInfo);

  return (
    <header className="company-gradient-soft glass-morphism rounded-xl border border-border/60 shadow-sm px-4 md:px-6 py-4">
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
          <div className="h-6 w-px bg-border" />
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
            <Select value={displayStatus} onValueChange={handleStatusChange}>
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

      {/* Enhanced Status Action Dialog */}
      <Dialog open={showStatusActionDialog} onOpenChange={setShowStatusActionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {hasExistingQuote ? "Quote Status - Next Actions" : "Quote Status - Create Quote"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {hasExistingQuote 
                ? "You have an existing quote. What would you like to do next?"
                : "You've changed the status to 'Quote'. Let's help you create and send your quote."
              }
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => handleQuoteAction('view_quote')} 
                className="w-full justify-start"
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                {hasExistingQuote ? "View & Edit Existing Quote" : "Create & View Quote"}
              </Button>
              {hasExistingQuote && (
                <Button 
                  onClick={() => handleQuoteAction('email_quote')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Quote to Client
                </Button>
              )}
              {hasExistingQuote && (
                <Button 
                  onClick={() => handleQuoteAction('print_quote')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Quote
                </Button>
              )}
            </div>
            {!hasExistingQuote && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-blue-800">💡 Next Steps:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1 text-blue-700">
                  <li>Review and complete your quote details</li>
                  <li>Add line items from your project data</li>
                  <li>Email or print the quote for your client</li>
                </ol>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setShowStatusActionDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leftover Capture Dialog */}
      <LeftoverCaptureDialog
        open={showLeftoverDialog}
        onOpenChange={setShowLeftoverDialog}
        leftovers={leftovers}
        projectId={actualProjectId || ''}
        projectName={projectName}
      />
    </header>
  );
};
