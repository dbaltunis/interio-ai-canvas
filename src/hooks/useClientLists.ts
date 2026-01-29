import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ClientList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: 'static' | 'smart';
  filters: Record<string, any>;
  color: string;
  icon: string;
  member_count: number;
  last_email_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientListMember {
  id: string;
  list_id: string;
  client_id: string;
  added_at: string;
}

export interface CreateListInput {
  name: string;
  description?: string;
  type?: 'static' | 'smart';
  filters?: Record<string, any>;
  color?: string;
  icon?: string;
}

export interface UpdateListInput {
  id: string;
  name?: string;
  description?: string;
  filters?: Record<string, any>;
  color?: string;
  icon?: string;
}

// Fetch all client lists for the current user
export const useClientLists = () => {
  return useQuery({
    queryKey: ['client-lists'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('client_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClientList[];
    },
  });
};

// Fetch members of a specific list
export const useClientListMembers = (listId: string | null) => {
  return useQuery({
    queryKey: ['client-list-members', listId],
    queryFn: async () => {
      if (!listId) return [];

      const { data, error } = await supabase
        .from('client_list_members')
        .select(`
          *,
          clients:client_id (
            id,
            name,
            email,
            phone,
            company_name,
            funnel_stage
          )
        `)
        .eq('list_id', listId);

      if (error) throw error;
      return data;
    },
    enabled: !!listId,
  });
};

// Create a new client list
export const useCreateClientList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateListInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('client_lists')
        .insert([{
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          type: input.type || 'static',
          filters: input.filters || {},
          color: input.color || '#6366f1',
          icon: input.icon || 'users',
        }])
        .select()
        .single();

      if (error) throw error;
      return data as ClientList;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-lists'] });
      toast({
        title: "List Created",
        description: `"${data.name}" has been created successfully.`,
      });
    },
    onError: (error) => {
      console.error('Failed to create list:', error);
      toast({
        title: "Error",
        description: "Failed to create list. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Update a client list
export const useUpdateClientList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: UpdateListInput) => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('client_lists')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ClientList;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-lists'] });
      toast({
        title: "List Updated",
        description: `"${data.name}" has been updated.`,
      });
    },
    onError: (error) => {
      console.error('Failed to update list:', error);
      toast({
        title: "Error",
        description: "Failed to update list. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Delete a client list
export const useDeleteClientList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from('client_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;
      return listId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-lists'] });
      toast({
        title: "List Deleted",
        description: "The list has been deleted.",
      });
    },
    onError: (error) => {
      console.error('Failed to delete list:', error);
      toast({
        title: "Error",
        description: "Failed to delete list. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Add clients to a list
export const useAddClientsToList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ listId, clientIds }: { listId: string; clientIds: string[] }) => {
      const members = clientIds.map(clientId => ({
        list_id: listId,
        client_id: clientId,
      }));

      const { data, error } = await supabase
        .from('client_list_members')
        .upsert(members, { onConflict: 'list_id,client_id' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, { listId }) => {
      queryClient.invalidateQueries({ queryKey: ['client-lists'] });
      queryClient.invalidateQueries({ queryKey: ['client-list-members', listId] });
      toast({
        title: "Clients Added",
        description: `${data.length} client(s) added to the list.`,
      });
    },
    onError: (error) => {
      console.error('Failed to add clients to list:', error);
      toast({
        title: "Error",
        description: "Failed to add clients. Some may already be in the list.",
        variant: "destructive",
      });
    },
  });
};

// Remove clients from a list
export const useRemoveClientsFromList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ listId, clientIds }: { listId: string; clientIds: string[] }) => {
      const { error } = await supabase
        .from('client_list_members')
        .delete()
        .eq('list_id', listId)
        .in('client_id', clientIds);

      if (error) throw error;
      return { listId, count: clientIds.length };
    },
    onSuccess: ({ listId, count }) => {
      queryClient.invalidateQueries({ queryKey: ['client-lists'] });
      queryClient.invalidateQueries({ queryKey: ['client-list-members', listId] });
      toast({
        title: "Clients Removed",
        description: `${count} client(s) removed from the list.`,
      });
    },
    onError: (error) => {
      console.error('Failed to remove clients from list:', error);
      toast({
        title: "Error",
        description: "Failed to remove clients. Please try again.",
        variant: "destructive",
      });
    },
  });
};
