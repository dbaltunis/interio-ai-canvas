
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

export const useCreateAppointmentFromNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createAppointment = useCreateAppointment();
  const markAsRead = useMarkAsRead();

  return useMutation({
    mutationFn: async (data: CreateAppointmentFromNotificationRequest) => {
      // Create the appointment
      const appointment = await createAppointment.mutateAsync({
        title: data.title,
        description: data.description,
        appointment_type: data.appointmentType || 'reminder',
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
      toast({
        title: "Failed to Create Event",
        description: error.message,
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
  });
};
