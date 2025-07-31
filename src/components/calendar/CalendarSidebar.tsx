
import { CalendarDays, Link2, Settings, ChevronLeft, ChevronRight, Clock, MapPin, Calendar as CalendarIcon, Users, BarChart3, User, Trash2, Bell, Video, Palette, Edit3, UserPlus, Send } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AppointmentEditSidebar } from './AppointmentEditSidebar';
import { UnifiedAppointmentDialog } from './UnifiedAppointmentDialog';
import { useAppointmentEdit } from '@/hooks/useAppointmentEdit';
import { SchedulerManagement } from "./SchedulerManagement";
import { BookingManagement } from "./BookingManagement";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { format, isToday, addDays } from "date-fns";
import { useAppointments, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { useAppointmentSchedulers } from "@/hooks/useAppointmentSchedulers";
import { useClients } from "@/hooks/useClients";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CalendarSidebarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onBookingLinks: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const CalendarSidebar = ({ currentDate, onDateChange, onBookingLinks, isCollapsed = false, onToggleCollapse }: CalendarSidebarProps) => {
  const [showSchedulerManagement, setShowSchedulerManagement] = useState(false);
  const [showBookingManagement, setShowBookingManagement] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [sidebarDate, setSidebarDate] = useState<Date | undefined>(currentDate);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const appointmentEdit = useAppointmentEdit();
  const { data: appointments } = useAppointments();
  const { data: schedulers } = useAppointmentSchedulers();
  const { data: clients } = useClients();
  const { data: currentUserProfile } = useCurrentUserProfile();
  const { toast } = useToast();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  // Get upcoming events (next 7 days)
  const upcomingEvents = appointments?.filter(appointment => {
    const eventDate = new Date(appointment.start_time);
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return eventDate >= today && eventDate <= nextWeek;
  }).slice(0, 5) || [];

  // Helper function to get client name
  const getClientName = (clientId?: string) => {
    if (!clientId || !clients) return null;
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;
    return client.client_type === 'B2B' ? client.company_name : client.name;
  };

  // Helper function to get attendee info with avatar data
  const getAttendeeInfo = (event: any) => {
    const attendees = [];
    
    // Add organizer (current user)
    if (currentUserProfile) {
      attendees.push({
        id: currentUserProfile.user_id,
        name: currentUserProfile.display_name || 'You',
        avatar: currentUserProfile.avatar_url,
        isOwner: true
      });
    }
    
    // Add client if exists (clients don't have avatars in user_profiles)
    const clientName = getClientName(event.client_id);
    if (clientName) {
      attendees.push({
        id: event.client_id,
        name: clientName,
        avatar: null,
        isClient: true
      });
    }
    
    // Add invited emails (these are external, no avatars)
    if (event.invited_client_emails?.length > 0) {
      event.invited_client_emails.forEach((email: string, index: number) => {
        attendees.push({
          id: `email-${index}`,
          name: email,
          avatar: null,
          isInvited: true
        });
      });
    }
    
    return attendees;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSidebarDate(date);
      onDateChange(date);
    }
  };

  // Handler functions for event actions - Updated for hybrid approach
  const handleEditEvent = () => {
    if (selectedEvent) {
      appointmentEdit.openQuickEdit(selectedEvent);
      setSelectedEvent(null); // Close details dialog
    }
  };

  const handleAdvancedOptions = () => {
    appointmentEdit.openAdvancedEdit();
  };

  const handleManageAttendees = () => {
    toast({
      title: "Manage Attendees",
      description: "Attendee management functionality will open here.",
    });
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteAppointment.mutate(selectedEvent.id, {
        onSuccess: () => {
          setSelectedEvent(null);
          setShowDeleteDialog(false);
          toast({
            title: "Event Deleted",
            description: "The event has been successfully deleted.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete the event. Please try again.",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleSendReminder = () => {
    toast({
      title: "Reminder Sent",
      description: "Notification reminder has been sent to all attendees.",
    });
  };

  if (isCollapsed) {
    return (
      <div className="w-16 min-w-16 border-r bg-background flex flex-col h-full flex-shrink-0">
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full h-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 min-w-80 max-w-80 border-r bg-background flex flex-col h-full flex-shrink-0">
      <ScrollArea className="flex-1">
        <div className="flex flex-col space-y-4 p-4">
          {/* Collapse Button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          {/* Mini Calendar */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={sidebarDate}
                onSelect={handleDateSelect}
                className="rounded-md border-0 p-0"
                classNames={{
                  months: "flex flex-col space-y-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                  day: "h-8 w-8 p-0 font-normal hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_hidden: "invisible",
                }}
              />
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="flex-1 min-h-0">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-sm">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => {
                    const attendees = getAttendeeInfo(event);
                    const eventColor = event.color || '#3b82f6'; // Default blue
                    
                    return (
                      <div 
                        key={event.id} 
                        className="relative p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors flex-shrink-0 cursor-pointer group"
                        onClick={() => setSelectedEvent(event)}
                      >
                        {/* Enhanced color indicator */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-2 rounded-l-lg opacity-80 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: eventColor }}
                        />
                        
                        <div className="ml-3">
                          <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {event.title}
                          </div>
                          
                          {/* Time */}
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            {format(new Date(event.start_time), 'MMM d, HH:mm')}
                          </div>
                          
                          {/* Location */}
                          {event.location && (
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          
                          {/* Attendees with Avatars */}
                          {attendees.length > 0 && (
                            <div className="flex items-center mt-2 gap-1">
                              <div className="flex -space-x-1">
                                {attendees.slice(0, 3).map((attendee) => (
                                  <Avatar key={attendee.id} className="w-5 h-5 border border-background">
                                    <AvatarImage src={attendee.avatar || undefined} />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                      {attendee.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {attendees.length > 3 && (
                                  <div className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">+{attendees.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Color dot indicator in top right */}
                        <div 
                          className="absolute top-2 right-2 w-3 h-3 rounded-full border border-white/50 shadow-sm"
                          style={{ backgroundColor: eventColor }}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No upcoming events
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Action */}
              <Button 
                onClick={onBookingLinks}
                className="w-full"
                size="sm"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
              
              {/* Management Actions */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground px-1">
                  Manage
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    onClick={() => setShowSchedulerManagement(true)}
                    className="w-full justify-start"
                    variant="ghost"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Schedules
                  </Button>
                  
                  <Button 
                    onClick={() => setShowBookingManagement(true)}
                    className="w-full justify-start"
                    variant="ghost"
                    size="sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Bookings
                  </Button>
                </div>
              </div>
              
              {/* Analytics Action */}
              <div className="pt-2 border-t">
                <Button 
                  onClick={() => setShowAnalytics(true)}
                  className="w-full justify-start"
                  variant="ghost"
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Dialogs */}
      <Dialog open={showSchedulerManagement} onOpenChange={setShowSchedulerManagement}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Appointment Schedulers</DialogTitle>
          </DialogHeader>
          <SchedulerManagement />
        </DialogContent>
      </Dialog>

      <Dialog open={showBookingManagement} onOpenChange={setShowBookingManagement}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Management</DialogTitle>
          </DialogHeader>
          <BookingManagement />
        </DialogContent>
      </Dialog>

      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analytics Dashboard</DialogTitle>
          </DialogHeader>
          <AnalyticsDashboard />
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Event Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Header */}
              <div className="flex items-start gap-3">
                <div 
                  className="w-4 h-4 rounded-full mt-1 flex-shrink-0 ring-2 ring-background"
                  style={{ backgroundColor: selectedEvent.color || '#3b82f6' }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                  {selectedEvent.description && (
                    <p className="text-muted-foreground text-sm mt-1">{selectedEvent.description}</p>
                  )}
                </div>
              </div>
              
              {/* Event Details */}
              <div className="grid grid-cols-1 gap-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(selectedEvent.start_time), 'PPP p')} - {format(new Date(selectedEvent.end_time), 'p')}
                  </span>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedEvent.location}</span>
                  </div>
                )}
                
                {selectedEvent.appointment_type && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{selectedEvent.appointment_type}</span>
                  </div>
                )}
              </div>
              
              {/* Attendees */}
              {getAttendeeInfo(selectedEvent).length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm mb-3">Attendees</h4>
                  <div className="space-y-2">
                    {getAttendeeInfo(selectedEvent).map((attendee) => (
                      <div key={attendee.id} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={attendee.avatar || undefined} />
                          <AvatarFallback className="text-sm bg-primary/10 text-primary">
                            {attendee.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{attendee.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {attendee.isOwner ? 'Organizer' : attendee.isClient ? 'Client' : 'Invited'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications & Settings */}
              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-3">Notifications & Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Notification Status</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Enabled</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Reminder Time</div>
                    <span className="text-sm">15 minutes before</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Event Status</div>
                    <span className="text-sm capitalize">{selectedEvent.status || 'confirmed'}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Visibility</div>
                    <span className="text-sm">Private</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEditEvent}>
                    <Settings className="h-4 w-4 mr-1" />
                    Edit Event
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleManageAttendees}>
                    <User className="h-4 w-4 mr-1" />
                    Manage Attendees
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button size="sm" onClick={handleSendReminder}>
                    <Bell className="h-4 w-4 mr-1" />
                    Send Reminder
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Edit Sidebar */}
      {appointmentEdit.isQuickEditOpen && (
        <div className="fixed inset-y-0 right-0 w-96 z-50">
          <AppointmentEditSidebar
            appointment={appointmentEdit.selectedAppointment}
            onSave={appointmentEdit.saveAppointment}
            onCancel={appointmentEdit.closeEdit}
            onAdvancedOptions={handleAdvancedOptions}
          />
        </div>
      )}

      {/* Advanced Edit Dialog */}
      <UnifiedAppointmentDialog
        open={appointmentEdit.isAdvancedEditOpen}
        onOpenChange={appointmentEdit.closeEdit}
        appointment={appointmentEdit.selectedAppointment}
      />
    </div>
  );
};
