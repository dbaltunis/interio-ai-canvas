import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAutomationWorkflows = () => {
  return useQuery({
    queryKey: ["automation-workflows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_workflows")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useFollowUpReminders = () => {
  return useQuery({
    queryKey: ["follow-up-reminders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders" as any)
        .select(`
          *,
          clients:client_id (
            id,
            name,
            company_name,
            client_type,
            email
          )
        `)
        .eq("status", "pending")
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useScheduledTasks = () => {
  return useQuery({
    queryKey: ["scheduled-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_tasks")
        .select(`
          *,
          clients:client_id (
            id,
            name,
            company_name,
            client_type
          )
        `)
        .eq("status", "pending")
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useEmailSequences = () => {
  return useQuery({
    queryKey: ["email-sequences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_sequences")
        .select(`
          *,
          email_sequence_steps (
            id,
            step_number,
            delay_days,
            delay_hours,
            subject,
            content,
            is_active
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateAutomationWorkflow = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workflow: {
      name: string;
      description?: string;
      trigger_event: string;
      trigger_conditions?: any;
      actions: any[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("automation_workflows")
        .insert({
          ...workflow,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-workflows"] });
      toast({
        title: "Success",
        description: "Automation workflow created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create automation workflow",
        variant: "destructive"
      });
    },
  });
};

export const useCreateEmailSequence = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sequence: {
      name: string;
      description?: string;
      trigger_type: string;
      trigger_conditions?: any;
      steps: Array<{
        step_number: number;
        delay_days: number;
        delay_hours?: number;
        subject: string;
        content: string;
      }>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create sequence
      const { data: sequenceData, error: sequenceError } = await supabase
        .from("email_sequences")
        .insert({
          user_id: user.id,
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.trigger_type,
          trigger_conditions: sequence.trigger_conditions
        })
        .select()
        .single();

      if (sequenceError) throw sequenceError;

      // Create steps
      const steps = sequence.steps.map(step => ({
        ...step,
        sequence_id: sequenceData.id
      }));

      const { error: stepsError } = await supabase
        .from("email_sequence_steps")
        .insert(steps);

      if (stepsError) throw stepsError;

      return sequenceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-sequences"] });
      toast({
        title: "Success",
        description: "Email sequence created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create email sequence",
        variant: "destructive"
      });
    },
  });
};

export const useMarkReminderCompleted = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      const { data, error } = await supabase
        .from("reminders" as any)
        .update({ status: "completed" })
        .eq("id", reminderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-reminders"] });
      queryClient.invalidateQueries({ queryKey: ["completed-reminders"] });
      toast({
        title: "Task completed",
        description: "Follow-up reminder marked as done",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSnoozeReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reminderId, days }: { reminderId: string; days: number }) => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + days);

      const { error } = await supabase
        .from("reminders" as any)
        .update({ scheduled_for: newDate.toISOString() })
        .eq("id", reminderId);

      if (error) throw error;
      return days;
    },
    onSuccess: (days) => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-reminders"] });
      toast({
        title: "Reminder snoozed",
        description: `Rescheduled for ${days} day${days > 1 ? 's' : ''} from now`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from("reminders" as any)
        .delete()
        .eq("id", reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-reminders"] });
      toast({
        title: "Reminder deleted",
        description: "Follow-up reminder has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCompletedReminders = () => {
  return useQuery({
    queryKey: ['completed-reminders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders' as any)
        .select(`
          *,
          clients:client_id (
            id,
            name,
            company_name,
            client_type,
            email
          ),
          deals:deal_id (
            id,
            title
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useScheduleTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (task: {
      client_id?: string;
      deal_id?: string;
      task_type: string;
      task_data?: any;
      scheduled_for: string;
      priority?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("scheduled_tasks")
        .insert({
          ...task,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      toast({
        title: "Success",
        description: "Task scheduled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule task",
        variant: "destructive"
      });
    },
  });
};