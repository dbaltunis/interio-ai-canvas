import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type AppointmentScheduler = Tables<"appointment_schedulers">;
type AppointmentSchedulerInsert = TablesInsert<"appointment_schedulers">;
type AppointmentSchedulerUpdate = TablesUpdate<"appointment_schedulers">;

export const useAppointmentSchedulers = () => {
  return useQuery({
    queryKey: ["appointment-schedulers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_schedulers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const usePublicScheduler = (slug: string) => {
  return useQuery({
    queryKey: ["public-scheduler", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_schedulers")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const useCreateScheduler = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (scheduler: Omit<AppointmentSchedulerInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("appointment_schedulers")
        .insert({ ...scheduler, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-schedulers"] });
      toast({
        title: "Success",
        description: "Scheduler created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateScheduler = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...scheduler }: { id: string } & Partial<AppointmentSchedulerUpdate>) => {
      const { data, error } = await supabase
        .from("appointment_schedulers")
        .update(scheduler)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-schedulers"] });
      toast({
        title: "Success",
        description: "Scheduler updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteScheduler = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointment_schedulers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-schedulers"] });
      toast({
        title: "Success",
        description: "Scheduler deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUploadSchedulerImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/scheduler-images/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = await supabase.storage
        .from('project-images')
        .getPublicUrl(uploadData.path);

      return data.publicUrl;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
