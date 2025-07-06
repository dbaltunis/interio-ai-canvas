
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useMarkAsRead } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

interface CreateAppointmentFromNotificationRequest {
  notificationId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  appointmentType?: string;
  location?: string;
  clientId?: string;
  projectId?: string;
}

// Valid appointment types based on database constraints
const VALID_APPOINTMENT_TYPES = [
  'consultation',
  'measurement', 
  'installation',
  'follow-up',
  'reminder',
  'meeting',
  'call'
];

export const useCreateAppointmentFromNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createAppointment = useCreateAppointment();
  const markAsRead = useMarkAsRead();

  return useMutation({
    mutationFn: async (data: CreateAppointmentFromNotificationRequest) => {
      // Ensure we use a valid appointment type
      const appointmentType = data.appointmentType && VALID_APPOINTMENT_TYPES.includes(data.appointmentType) 
        ? data.appointmentType 
        : 'reminder';

      // Create the appointment
      const appointment = await createAppointment.mutateAsync({
        title: data.title,
        description: data.description,
        appointment_type: appointmentType,
        start_time: data.startTime.toISOString(),
        end_time: data.endTime.toISOString(),
        location: data.location || null,
        client_id: data.clientId || null,
        project_id: data.projectId || null,
      });

      // Mark the notification as read
      await markAsRead.mutateAsync(data.notificationId);

      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      toast({
        title: "Calendar Event Created",
        description: "Appointment created successfully from notification",
      });
    },
    onError: (error) => {
      console.error('Failed to create appointment from notification:', error);
      toast({
        title: "Failed to Create Event",
        description: "There was an error creating the calendar event. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useScheduleNotificationReminder = () => {
  const { toast } = useToast();
  const createAppointmentFromNotification = useCreateAppointmentFromNotification();

  return useMutation({
    mutationFn: async (params: {
      notificationId: string;
      title: string;
      message: string;
      scheduleDate: Date;
      duration?: number; // in minutes, default 30
    }) => {
      const startTime = new Date(params.scheduleDate);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (params.duration || 30));

      return await createAppointmentFromNotification.mutateAsync({
        notificationId: params.notificationId,
        title: params.title,
        description: params.message,
        startTime,
        endTime,
        appointmentType: 'reminder'
      });
    },
    onSuccess: () => {
      toast({
        title: "Reminder Scheduled",
        description: "Calendar reminder created successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to schedule reminder:', error);
      toast({
        title: "Failed to Schedule Reminder",
        description: "There was an error scheduling your reminder. Please try again.",
        variant: "destructive",
      });
    },
  });
};
