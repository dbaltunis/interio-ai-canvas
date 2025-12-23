import { useState, useCallback, useMemo } from 'react';

export interface SelectedClient {
  id: string;
  name: string;
  email?: string;
  company_name?: string;
  funnel_stage?: string;
}

export const useClientSelection = () => {
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());
  const [selectedClientsData, setSelectedClientsData] = useState<Map<string, SelectedClient>>(new Map());

  const toggleClient = useCallback((client: SelectedClient) => {
    setSelectedClientIds(prev => {
      const next = new Set(prev);
      if (next.has(client.id)) {
        next.delete(client.id);
      } else {
        next.add(client.id);
      }
      return next;
    });
    
    setSelectedClientsData(prev => {
      const next = new Map(prev);
      if (next.has(client.id)) {
        next.delete(client.id);
      } else {
        next.set(client.id, client);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((clients: SelectedClient[]) => {
    const ids = new Set(clients.map(c => c.id));
    setSelectedClientIds(ids);
    
    const dataMap = new Map(clients.map(c => [c.id, c]));
    setSelectedClientsData(dataMap);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedClientIds(new Set());
    setSelectedClientsData(new Map());
  }, []);

  const isSelected = useCallback((clientId: string) => {
    return selectedClientIds.has(clientId);
  }, [selectedClientIds]);

  const selectedClients = useMemo(() => {
    return Array.from(selectedClientsData.values());
  }, [selectedClientsData]);

  const selectedCount = useMemo(() => {
    return selectedClientIds.size;
  }, [selectedClientIds]);

  const selectedWithEmails = useMemo(() => {
    return selectedClients.filter(c => c.email);
  }, [selectedClients]);

  return {
    selectedClientIds,
    selectedClients,
    selectedCount,
    selectedWithEmails,
    toggleClient,
    selectAll,
    clearSelection,
    isSelected,
  };
};
