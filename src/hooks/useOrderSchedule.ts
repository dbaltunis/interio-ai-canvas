import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderScheduleSettings {
  id: string;
  user_id: string;
  schedule_days: string[];
  auto_create_batches: boolean;
  lead_time_days: number;
  auto_assign_suppliers: boolean;
  notification_preferences: {
    email: boolean;
    in_app: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const useOrderScheduleSettings = () => {
  return useQuery({
    queryKey: ['order-schedule-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_schedule_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as OrderScheduleSettings | null;
    },
  });
};

export const useUpdateScheduleSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<OrderScheduleSettings>) => {
      const { data: existing } = await supabase
        .from('order_schedule_settings')
        .select('id')
        .single();

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('order_schedule_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('order_schedule_settings')
          .insert([settings] as any)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-schedule-settings'] });
      toast.success('Schedule settings updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update settings: ' + error.message);
    },
  });
};

export const useUpcomingOrderDates = (count: number = 5) => {
  const { data: settings } = useOrderScheduleSettings();

  const upcomingDates = React.useMemo(() => {
    if (!settings?.schedule_days || settings.schedule_days.length === 0) {
      return [];
    }

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const scheduleDayIndexes = settings.schedule_days.map(day => 
      dayNames.indexOf(day.toLowerCase())
    ).filter(index => index !== -1);

    if (scheduleDayIndexes.length === 0) {
      return [];
    }

    const dates: Date[] = [];
    const today = new Date();
    let currentDate = new Date(today);

    while (dates.length < count) {
      const dayIndex = currentDate.getDay();
      if (scheduleDayIndexes.includes(dayIndex) && currentDate > today) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, [settings, count]);

  return upcomingDates;
};

// Import React for useMemo
import React from "react";
