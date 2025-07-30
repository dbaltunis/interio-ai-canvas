import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SMSContact {
  id: string;
  user_id: string;
  phone_number: string;
  name?: string;
  opted_in: boolean;
  opted_in_at?: string;
  opted_out_at?: string;
  client_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export const useSMSContacts = () => {
  return useQuery({
    queryKey: ["sms-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SMSContact[];
    },
  });
};

export const useCreateSMSContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: Omit<SMSContact, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("sms_contacts")
        .insert([{ ...contact, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-contacts"] });
      toast.success("SMS contact added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add SMS contact: ${error.message}`);
    },
  });
};

export const useUpdateSMSContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SMSContact> }) => {
      const { data, error } = await supabase
        .from("sms_contacts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-contacts"] });
      toast.success("SMS contact updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update SMS contact: ${error.message}`);
    },
  });
};

// Hook to sync clients to SMS contacts
export const useSyncClientsToSMSContacts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get all clients with phone numbers
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, name, phone")
        .eq("user_id", user.id)
        .not("phone", "is", null);

      if (clientsError) throw clientsError;

      // Get existing SMS contacts
      const { data: existingContacts, error: contactsError } = await supabase
        .from("sms_contacts")
        .select("phone_number, client_id")
        .eq("user_id", user.id);

      if (contactsError) throw contactsError;

      const existingPhones = new Set(existingContacts?.map(c => c.phone_number) || []);
      const newContacts = [];

      for (const client of clients || []) {
        if (client.phone && !existingPhones.has(client.phone)) {
          newContacts.push({
            user_id: user.id,
            phone_number: client.phone,
            name: client.name,
            client_id: client.id,
            opted_in: true,
          });
        }
      }

      if (newContacts.length > 0) {
        const { error: insertError } = await supabase
          .from("sms_contacts")
          .insert(newContacts);

        if (insertError) throw insertError;
      }

      return { synced: newContacts.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sms-contacts"] });
      toast.success(`Synced ${data.synced} new contacts from clients`);
    },
    onError: (error: any) => {
      toast.error(`Failed to sync clients: ${error.message}`);
    },
  });
};