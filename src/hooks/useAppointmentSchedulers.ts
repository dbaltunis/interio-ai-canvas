
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppointmentScheduler {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  slug: string;
  duration: number;
  buffer_time: number;
  max_advance_booking: number;
  min_advance_notice: number;
  image_url?: string;
  google_meet_link?: string;
  user_email?: string;
  active: boolean;
  availability: any;
  locations: any;
  created_at: string;
  updated_at: string;
}

export const useAppointmentSchedulers = () => {
  return useQuery({
    queryKey: ["appointment-schedulers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_schedulers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AppointmentScheduler[];
    },
  });
};

export interface PublicScheduler {
  id: string;
  slug: string;
  name: string;
  description?: string;
  duration: number;
  buffer_time: number;
  max_advance_booking: number;
  min_advance_notice: number;
  image_url?: string;
  availability: any;
  locations: any;
}

export const usePublicScheduler = (slug: string) => {
  return useQuery({
    queryKey: ["public-scheduler", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_public_scheduler", { slug_param: slug });

      if (error) throw error;
      const scheduler = Array.isArray(data) ? data[0] : data;
      return (scheduler || null) as PublicScheduler | null;
    },
    enabled: !!slug,
  });
};

export const useCreateScheduler = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (scheduler: Omit<AppointmentScheduler, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("appointment_schedulers")
        .insert([{ ...scheduler, user_id: (await supabase.auth.getUser()).data.user?.id }])
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
      console.error("Error creating scheduler:", error);
      toast({
        title: "Error",
        description: "Failed to create scheduler",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateScheduler = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...scheduler }: Partial<AppointmentScheduler> & { id: string }) => {
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
      console.error("Error updating scheduler:", error);
      toast({
        title: "Error",
        description: "Failed to update scheduler",
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
      console.error("Error deleting scheduler:", error);
      toast({
        title: "Error",
        description: "Failed to delete scheduler",
        variant: "destructive",
      });
    },
  });
};

export const useUploadSchedulerImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `scheduler-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
    onError: (error) => {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    },
  });
};

// Export aliases for backward compatibility
export const useCreateAppointmentScheduler = useCreateScheduler;
export const useUpdateAppointmentScheduler = useUpdateScheduler;
export const useDeleteAppointmentScheduler = useDeleteScheduler;
