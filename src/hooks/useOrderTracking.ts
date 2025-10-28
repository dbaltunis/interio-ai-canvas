import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderTrackingHistoryItem {
  id: string;
  batch_order_id: string;
  status: string;
  notes?: string;
  location?: string;
  updated_by?: string;
  created_at: string;
}

export interface SupplierLeadTime {
  id: string;
  user_id: string;
  supplier_id: string;
  material_type: string;
  order_date: string;
  delivery_date: string;
  lead_time_days: number;
  order_complexity?: 'simple' | 'medium' | 'complex';
  batch_order_id?: string;
  created_at: string;
}

export const useOrderTrackingHistory = (batchId: string) => {
  return useQuery({
    queryKey: ['order-tracking-history', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_tracking_history')
        .select('*')
        .eq('batch_order_id', batchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as OrderTrackingHistoryItem[];
    },
    enabled: !!batchId,
  });
};

export const useAddTrackingUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: Partial<OrderTrackingHistoryItem>) => {
      const { data, error } = await supabase
        .from('order_tracking_history')
        .insert([update] as any)
        .select()
        .single();

      if (error) throw error;

      // Update batch order status
      if (update.status && update.batch_order_id) {
        await supabase
          .from('batch_orders')
          .update({ status: update.status })
          .eq('id', update.batch_order_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-tracking-history'] });
      queryClient.invalidateQueries({ queryKey: ['batch-orders'] });
      toast.success('Tracking update added');
    },
    onError: (error: any) => {
      toast.error('Failed to add update: ' + error.message);
    },
  });
};

export const useSupplierLeadTimes = (supplierId?: string, materialType?: string) => {
  return useQuery({
    queryKey: ['supplier-lead-times', supplierId, materialType],
    queryFn: async () => {
      let query = supabase
        .from('supplier_lead_times')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }
      if (materialType) {
        query = query.eq('material_type', materialType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SupplierLeadTime[];
    },
  });
};

export interface LeadTimePrediction {
  estimatedDays: number;
  confidence: 'low' | 'medium' | 'high';
  range: [number, number];
  historicalAverage?: number;
  sampleSize: number;
  note?: string;
}

export const usePredictLeadTime = (supplierId?: string, materialType?: string) => {
  const { data: historicalData } = useSupplierLeadTimes(supplierId, materialType);

  const prediction: LeadTimePrediction | null = React.useMemo(() => {
    if (!historicalData || historicalData.length < 3) {
      return {
        estimatedDays: 7,
        confidence: 'low',
        range: [5, 10],
        sampleSize: historicalData?.length || 0,
        note: 'Not enough historical data for accurate prediction',
      };
    }

    // Calculate average
    const totalDays = historicalData.reduce((sum, order) => sum + order.lead_time_days, 0);
    const avgDays = Math.round(totalDays / historicalData.length);

    // Calculate standard deviation
    const variance =
      historicalData.reduce((sum, order) => sum + Math.pow(order.lead_time_days - avgDays, 2), 0) /
      historicalData.length;
    const stdDev = Math.sqrt(variance);

    // Determine confidence
    let confidence: 'low' | 'medium' | 'high';
    if (historicalData.length >= 10 && stdDev < 2) {
      confidence = 'high';
    } else if (historicalData.length >= 5) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    return {
      estimatedDays: avgDays,
      confidence,
      range: [Math.max(1, avgDays - Math.ceil(stdDev)), avgDays + Math.ceil(stdDev)] as [number, number],
      historicalAverage: avgDays,
      sampleSize: historicalData.length,
    };
  }, [historicalData]);

  return prediction;
};

// Import React for useMemo
import React from "react";
