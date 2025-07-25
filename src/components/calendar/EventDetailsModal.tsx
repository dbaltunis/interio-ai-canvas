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
import { CalendarIcon, Clock, MapPin, Users, UserPlus, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useToast } from "@/hooks/use-toast";

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

  const { data: teamMembers } = useTeamMembers();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const { toast } = useToast();

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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'consultation': return 'bg-green-500';
      case 'call': return 'bg-purple-500';
      case 'follow-up': return 'bg-orange-500';
      default: return 'bg-primary';
    }
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
                <div className={`w-3 h-3 rounded-full ${getEventTypeColor(appointment.appointment_type)}`} />
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

            {appointment.description && (
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
                  {teamMembers?.find(m => m.id === appointment.user_id)?.name?.slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                {teamMembers?.find(m => m.id === appointment.user_id)?.name || 'Unknown User'} (Organizer)
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
                    <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{member.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{member.role}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="w-full">Send Invites</Button>
              </div>
            )}

            {showInviteClient && (
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-sm font-medium">Client Email</Label>
                <Input placeholder="client@example.com" />
                <Button size="sm" className="w-full">Send Invite</Button>
              </div>
            )}

            {showApplyToJob && (
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-sm font-medium">Select Job/Client</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose from existing jobs/clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job1">Kitchen Renovation - Smith Family</SelectItem>
                    <SelectItem value="job2">Bathroom Remodel - Johnson Home</SelectItem>
                    <SelectItem value="client1">ABC Corporation</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="w-full">Apply to Selected</Button>
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