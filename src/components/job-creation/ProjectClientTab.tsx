
import { useState } from "react";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { ClientStatusHeader } from "./client-tab/ClientStatusHeader";
import { ClientSelectionPrompt } from "./client-tab/ClientSelectionPrompt";
import { ClientInformation } from "./client-tab/ClientInformation";
import { ClientSearchDialog } from "./client-tab/ClientSearchDialog";
import { ClientCreateDialog } from "./client-tab/ClientCreateDialog";
import { ClientEditDialog } from "./client-tab/ClientEditDialog";

interface ProjectClientTabProps {
  project: any;
  onClientSelect?: (clientId: string) => void;
  onClientRemove?: () => void;
}

export const ProjectClientTab = ({ project, onClientSelect, onClientRemove }: ProjectClientTabProps) => {
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    notes: ""
  });

  const { data: clients } = useClients();
  const createClient = useCreateClient();
  const { toast } = useToast();
  
  const client = clients?.find(c => c.id === project.client_id);

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  ) || [];

  const handleClientSelect = (clientId: string) => {
    onClientSelect?.(clientId);
    setShowClientSearch(false);
    toast({
      title: "Client Selected",
      description: "Client has been assigned to this project",
    });
  };

  const handleClientRemove = () => {
    onClientRemove?.();
    toast({
      title: "Client Removed",
      description: "Client has been removed from this project",
    });
  };

  const handleCreateClient = async () => {
    try {
      const createdClient = await createClient.mutateAsync(newClient);
      handleClientSelect(createdClient.id);
      setShowCreateClient(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        notes: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    }
  };

  const handleEditDialogActions = {
    onChangeClient: () => {
      setShowEditClient(false);
      setShowClientSearch(true);
    },
    onCreateNew: () => {
      setShowEditClient(false);
      setShowCreateClient(true);
    }
  };

  if (!client) {
    return (
      <div className="space-y-6">
        <ClientStatusHeader
          hasClient={false}
          onEditClient={() => setShowEditClient(true)}
          onChangeClient={() => setShowClientSearch(true)}
          onRemoveClient={handleClientRemove}
        />

        <ClientSelectionPrompt
          onSearchClients={() => setShowClientSearch(true)}
          onCreateClient={() => setShowCreateClient(true)}
        />

        <ClientSearchDialog
          open={showClientSearch}
          onOpenChange={setShowClientSearch}
          clients={filteredClients}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onClientSelect={handleClientSelect}
          onCreateNew={() => setShowCreateClient(true)}
        />

        <ClientCreateDialog
          open={showCreateClient}
          onOpenChange={setShowCreateClient}
          newClient={newClient}
          onClientChange={setNewClient}
          onCreateClient={handleCreateClient}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientStatusHeader
        hasClient={true}
        clientName={client.name}
        companyName={client.client_type === 'B2B' ? client.company_name : undefined}
        onEditClient={() => setShowEditClient(true)}
        onChangeClient={() => setShowClientSearch(true)}
        onRemoveClient={handleClientRemove}
      />

      <ClientInformation client={client} />

      <ClientSearchDialog
        open={showClientSearch}
        onOpenChange={setShowClientSearch}
        clients={filteredClients}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onClientSelect={handleClientSelect}
        onCreateNew={() => setShowCreateClient(true)}
      />

      <ClientCreateDialog
        open={showCreateClient}
        onOpenChange={setShowCreateClient}
        newClient={newClient}
        onClientChange={setNewClient}
        onCreateClient={handleCreateClient}
      />

      <ClientEditDialog
        open={showEditClient}
        onOpenChange={setShowEditClient}
        onChangeClient={handleEditDialogActions.onChangeClient}
        onCreateNew={handleEditDialogActions.onCreateNew}
      />
    </div>
  );
};
