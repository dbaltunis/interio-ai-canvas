import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Clock, MapPin, Users, UserPlus, Briefcase, Palette } from "lucide-react";
import { format } from "date-fns";
import { useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  appointment_type?: 'consultation' | 'measurement' | 'installation' | 'follow-up' | 'reminder' | 'meeting' | 'call';
  location?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  user_id?: string;
  client_id?: string;
  project_id?: string;
  color?: string;
}

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const EventDetailsModal = ({ isOpen, onClose, appointment }: EventDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAppointment, setEditedAppointment] = useState<Appointment | null>(null);
  const [showInviteTeam, setShowInviteTeam] = useState(false);
  const [showInviteClient, setShowInviteClient] = useState(false);
  const [showApplyToJob, setShowApplyToJob] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [clientEmail, setClientEmail] = useState("");
  const [selectedJobClient, setSelectedJobClient] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { data: teamMembers } = useTeamMembers();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const { toast } = useToast();

  // Get current user
  useState(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  });

  // Event colors - 7 predefined colors
  const eventColors = [
    { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500' },
    { name: 'Green', value: '#10B981', bg: 'bg-green-500' },
    { name: 'Purple', value: '#8B5CF6', bg: 'bg-purple-500' },
    { name: 'Orange', value: '#F59E0B', bg: 'bg-orange-500' },
    { name: 'Red', value: '#EF4444', bg: 'bg-red-500' },
    { name: 'Pink', value: '#EC4899', bg: 'bg-pink-500' },
    { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500' },
  ];

  if (!appointment) return null;

  const handleEdit = () => {
    setEditedAppointment({ ...appointment });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedAppointment) return;

    try {
      await updateAppointment.mutateAsync(editedAppointment);
      setIsEditing(false);
      setEditedAppointment(null);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment.mutateAsync(appointment.id);
      onClose();
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const getEventTypeColor = (appointment: Appointment) => {
    if (appointment.color) {
      const colorObj = eventColors.find(c => c.value === appointment.color);
      return colorObj ? colorObj.bg : 'bg-primary';
    }
    
    switch (appointment.appointment_type) {
      case 'meeting': return 'bg-blue-500';
      case 'consultation': return 'bg-green-500';
      case 'call': return 'bg-purple-500';
      case 'follow-up': return 'bg-orange-500';
      default: return 'bg-primary';
    }
  };

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleInviteTeamMembers = () => {
    if (selectedTeamMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one team member",
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Implement actual team member invitation logic
    toast({
      title: "Success",
      description: `Invited ${selectedTeamMembers.length} team member(s) to the event`,
    });
    setSelectedTeamMembers([]);
    setShowInviteTeam(false);
  };

  const handleInviteClient = () => {
    if (!clientEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a client email",
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Implement actual client invitation logic
    toast({
      title: "Success",
      description: `Invited ${clientEmail} to the event`,
    });
    setClientEmail("");
    setShowInviteClient(false);
  };

  const handleApplyToJobClient = () => {
    if (!selectedJobClient) {
      toast({
        title: "Error",
        description: "Please select a job or client",
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Implement actual job/client assignment logic
    toast({
      title: "Success",
      description: "Event applied to selected job/client",
    });
    setSelectedJobClient("");
    setShowApplyToJob(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'rescheduled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {isEditing ? (
              <Input
                value={editedAppointment?.title || ""}
                onChange={(e) => setEditedAppointment(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="text-lg font-semibold"
              />
            ) : (
              <>
                <div className={`w-3 h-3 rounded-full ${getEventTypeColor(appointment)}`} />
                {appointment.title}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                {appointment.status}
              </Badge>
              <Badge variant="outline">
                {appointment.appointment_type}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(appointment.start_time), 'PPP')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(appointment.start_time), 'HH:mm')} - {format(new Date(appointment.end_time), 'HH:mm')}
                </span>
              </div>
            </div>

            {appointment.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={editedAppointment?.location || ""}
                    onChange={(e) => setEditedAppointment(prev => prev ? { ...prev, location: e.target.value } : null)}
                    placeholder="Location"
                    className="flex-1"
                  />
                ) : (
                  <span className="text-sm">{appointment.location}</span>
                )}
              </div>
            )}

            {(appointment.description || isEditing) && (
              <div>
                <Label className="text-sm font-medium">Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editedAppointment?.description || ""}
                    onChange={(e) => setEditedAppointment(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Description"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{appointment.description}</p>
                )}
              </div>
            )}

            {/* Event Color Selection */}
            {isEditing && (
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Event Color
                </Label>
                <div className="flex gap-2 mt-2">
                  {eventColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        editedAppointment?.color === color.value 
                          ? 'border-foreground scale-110' 
                          : 'border-muted hover:border-muted-foreground'
                      } ${color.bg}`}
                      onClick={() => setEditedAppointment(prev => prev ? { ...prev, color: color.value } : null)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Attendees Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Attendees
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>
                  {currentUser?.email?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                {currentUser?.email || 'Current User'} (Organizer)
              </span>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setShowInviteTeam(!showInviteTeam)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Invite Team Member
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowInviteClient(!showInviteClient)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Invite Client
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowApplyToJob(!showApplyToJob)}
                className="flex items-center gap-2 col-span-2"
              >
                <Briefcase className="h-4 w-4" />
                Apply to Existing Job/Client
              </Button>
            </div>

            {/* Expandable sections */}
            {showInviteTeam && (
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-sm font-medium">Select Team Members</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {teamMembers?.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                         onClick={() => handleTeamMemberToggle(member.id)}>
                      <Checkbox 
                        checked={selectedTeamMembers.includes(member.id)}
                        onChange={() => handleTeamMemberToggle(member.id)}
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{member.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm flex-1">{member.name}</span>
                      <span className="text-xs text-muted-foreground">{member.role}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="w-full" onClick={handleInviteTeamMembers}>
                  Send Invites ({selectedTeamMembers.length} selected)
                </Button>
              </div>
            )}

            {showInviteClient && (
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-sm font-medium">Client Email</Label>
                <Input 
                  placeholder="client@example.com" 
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
                <Button size="sm" className="w-full" onClick={handleInviteClient}>
                  Send Invite
                </Button>
              </div>
            )}

            {showApplyToJob && (
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-sm font-medium">Select Job/Client</Label>
                <Select value={selectedJobClient} onValueChange={setSelectedJobClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose from existing jobs/clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <optgroup label="Projects">
                      {projects?.map(project => (
                        <SelectItem key={`project-${project.id}`} value={`project-${project.id}`}>
                          {project.name} - {project.status}
                        </SelectItem>
                      ))}
                    </optgroup>
                    <optgroup label="Clients">
                      {clients?.map(client => (
                        <SelectItem key={`client-${client.id}`} value={`client-${client.id}`}>
                          {client.name} - {client.email}
                        </SelectItem>
                      ))}
                    </optgroup>
                  </SelectContent>
                </Select>
                <Button size="sm" className="w-full" onClick={handleApplyToJobClient}>
                  Apply to Selected
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Edit/Save/Delete Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={updateAppointment.isPending}>
                    {updateAppointment.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setEditedAppointment(null);
                  }}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>Edit Event</Button>
              )}
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAppointment.isPending}
            >
              {deleteAppointment.isPending ? "Deleting..." : "Delete Event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};