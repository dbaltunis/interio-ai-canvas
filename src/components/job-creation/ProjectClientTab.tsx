
import { useState } from "react";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, User, Building2 } from "lucide-react";

interface ProjectClientTabProps {
  project: any;
  onClientSelect?: (clientId: string) => void;
  onClientRemove?: () => void;
}

export const ProjectClientTab = ({ project, onClientSelect, onClientRemove }: ProjectClientTabProps) => {
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const { data: clients } = useClients();
  const createClient = useCreateClient();
  const { toast } = useToast();
  
  const client = clients?.find(c => c.id === project.client_id);
  const filteredClients = clients?.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleClientSelect = (clientId: string) => {
    onClientSelect?.(clientId);
    setShowClientDialog(false);
    toast({ title: "Client assigned to project" });
  };

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) return;
    
    try {
      const createdClient = await createClient.mutateAsync(newClient);
      handleClientSelect(createdClient.id);
      setNewClient({ name: "", email: "", phone: "", address: "" });
      setIsCreatingNew(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create client", variant: "destructive" });
    }
  };

  if (client) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-900">{client.name}</h3>
                <p className="text-sm text-green-700">{client.email}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowClientDialog(true)}>
                Change Client
              </Button>
              <Button variant="outline" size="sm" onClick={onClientRemove}>
                Remove
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Different Client</DialogTitle>
            </DialogHeader>
            <ClientSelection 
              clients={filteredClients}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClientSelect={handleClientSelect}
              onCreateNew={() => setIsCreatingNew(true)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Client Assigned</h3>
        <p className="text-gray-600 mb-4">Select an existing client or create a new one</p>
        
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogTrigger asChild>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Select Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Client</DialogTitle>
            </DialogHeader>
            {isCreatingNew ? (
              <CreateClientForm 
                newClient={newClient}
                onChange={setNewClient}
                onSubmit={handleCreateClient}
                onBack={() => setIsCreatingNew(false)}
              />
            ) : (
              <ClientSelection 
                clients={filteredClients}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onClientSelect={handleClientSelect}
                onCreateNew={() => setIsCreatingNew(true)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const ClientSelection = ({ clients, searchTerm, onSearchChange, onClientSelect, onCreateNew }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Search Clients</Label>
      <Input
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    
    <div className="max-h-60 overflow-y-auto space-y-2">
      {clients.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No clients found</p>
      ) : (
        clients.map((client) => (
          <Card key={client.id} className="p-3 cursor-pointer hover:bg-gray-50" onClick={() => onClientSelect(client.id)}>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
    
    <Button onClick={onCreateNew} className="w-full">
      <Plus className="h-4 w-4 mr-2" />
      Create New Client
    </Button>
  </div>
);

const CreateClientForm = ({ newClient, onChange, onSubmit, onBack }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Name *</Label>
      <Input
        value={newClient.name}
        onChange={(e) => onChange({...newClient, name: e.target.value})}
        placeholder="Client name"
      />
    </div>
    <div className="space-y-2">
      <Label>Email</Label>
      <Input
        type="email"
        value={newClient.email}
        onChange={(e) => onChange({...newClient, email: e.target.value})}
        placeholder="email@example.com"
      />
    </div>
    <div className="space-y-2">
      <Label>Phone</Label>
      <Input
        value={newClient.phone}
        onChange={(e) => onChange({...newClient, phone: e.target.value})}
        placeholder="(555) 123-4567"
      />
    </div>
    <div className="flex space-x-2">
      <Button variant="outline" onClick={onBack} className="flex-1">
        Back
      </Button>
      <Button onClick={onSubmit} disabled={!newClient.name.trim()} className="flex-1">
        Create Client
      </Button>
    </div>
  </div>
);
