
import { useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useSendEmail } from "@/hooks/useSendEmail";
import { useCreateNotification } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";

export const ReminderScheduler = () => {
  const { data: notifications } = useNotifications();
  const sendEmail = useSendEmail();
  const createNotification = useCreateNotification();

  useEffect(() => {
    // Check for due reminders every minute
    const checkReminders = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get reminders from localStorage (in a real app, this would be from the database)
      const savedReminders = localStorage.getItem(`reminders_${user.id}`);
      if (!savedReminders) return;

      const reminders = JSON.parse(savedReminders);
      const now = new Date();

      reminders.forEach(async (reminder: any) => {
        const dueDate = new Date(reminder.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        
        // If reminder is due (within 5 minutes) and not already notified
        if (timeDiff <= 5 * 60 * 1000 && timeDiff > -5 * 60 * 1000 && !reminder.notified) {
          // Create app notification
          await createNotification.mutateAsync({
            title: `Reminder Due: ${reminder.title}`,
            message: `${reminder.description} - Client: ${reminder.clientName}`,
            type: 'warning',
            read: false
          });

          // Send email if enabled
          if (user.email && reminder.emailNotification) {
            await sendEmail.mutateAsync({
              to: user.email,
              subject: `Reminder Due: ${reminder.title}`,
              content: `
                <h2>Follow-up Reminder</h2>
                <p><strong>Client:</strong> ${reminder.clientName}</p>
                <p><strong>Task:</strong> ${reminder.title}</p>
                <p><strong>Description:</strong> ${reminder.description}</p>
                <p><strong>Due:</strong> ${dueDate.toLocaleString()}</p>
                <p>This reminder is now due. Please take appropriate action.</p>
              `
            });
          }

          // Mark as notified
          reminder.notified = true;
          localStorage.setItem(`reminders_${user.id}`, JSON.stringify(reminders));
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(checkReminders);
  }, [createNotification, sendEmail]);

  return null; // This is a background service component
};
