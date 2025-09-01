import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CrmAccountV2 {
  row_id: string;
  legacy_account_id?: string;
  name: string;
  status: 'lead' | 'trial' | 'active' | 'churn_risk' | 'churned';
  owner?: string;
  plugin_payments_eur: number;
  invoice_payments_eur: number;
  stripe_subs_eur: number;
  mrr_eur: number;
  next_action?: string;
  next_action_date?: string;
  notes?: string;
  updated_source: 'app' | 'sheet';
  updated_at: string;
}

export const useCrmV2Accounts = () => {
  return useQuery({
    queryKey: ["crmV2Accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("crm-v2-api");
      
      if (error) throw error;
      return data as CrmAccountV2[];
    },
  });
};

export const useCreateCrmV2Account = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (accountData: Partial<CrmAccountV2>) => {
      const { data, error } = await supabase.functions.invoke("crm-v2-api", {
        body: accountData
      });
      
      if (error) throw error;
      return data as CrmAccountV2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crmV2Accounts"] });
    },
  });
};

export const useUpdateCrmV2Account = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ rowId, accountData }: { rowId: string; accountData: Partial<CrmAccountV2> }) => {
      // For PATCH operations, we need to use fetch directly with the full URL
      const response = await fetch(`https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/crm-v2-api/${rowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(accountData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json() as Promise<CrmAccountV2>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crmV2Accounts"] });
    },
  });
};