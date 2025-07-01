
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { CheckCircle, User, Search, Plus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectClientTabProps {
  project: any;
  onClientSelect?: (clientId: string) => void;
}

export const ProjectClientTab = ({ project, onClientSelect }: ProjectClientTabProps) => {
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

  if (!client) {
    return (
      <div className="space-y-6">
        {/* Client Status Header */}
        <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div>
              <h3 className="font-medium text-orange-800">No Client Selected</h3>
              <p className="text-sm text-orange-600">Please select or create a client for this project</p>
            </div>
          </div>
          <Button onClick={() => setShowClientSearch(true)} className="bg-orange-600 hover:bg-orange-700">
            <Search className="h-4 w-4 mr-2" />
            Select Client
          </Button>
        </div>

        <div className="text-center py-12">
          <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-4">No Client Selected</h3>
          <p className="text-muted-foreground mb-6">Select an existing client or create a new one for this project</p>
          <div className="flex justify-center space-x-3">
            <Button onClick={() => setShowClientSearch(true)} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search Clients
            </Button>
            <Button onClick={() => setShowCreateClient(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Client
            </Button>
          </div>
        </div>

        {/* Client Search Dialog */}
        <Dialog open={showClientSearch} onOpenChange={setShowClientSearch}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Client</DialogTitle>
              <DialogDescription>
                Search and select a client from your database
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Command className="border rounded-lg">
                <CommandInput
                  placeholder="Search clients..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList className="max-h-[200px]">
                  <CommandEmpty>No clients found.</CommandEmpty>
                  <CommandGroup>
                    {filteredClients.map((client) => (
                      <CommandItem
                        key={client.id}
                        onSelect={() => handleClientSelect(client.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{client.name}</span>
                          {client.email && (
                            <span className="text-sm text-muted-foreground">{client.email}</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              <Button onClick={() => setShowCreateClient(true)} className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create New Client
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Client Dialog */}
        <Dialog open={showCreateClient} onOpenChange={setShowCreateClient}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
              <DialogDescription>
                Add a new client to your database
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="Client name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newClient.city}
                    onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={newClient.state}
                    onChange={(e) => setNewClient({...newClient, state: e.target.value})}
                    placeholder="State"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={newClient.zip_code}
                  onChange={(e) => setNewClient({...newClient, zip_code: e.target.value})}
                  placeholder="ZIP Code"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  placeholder="Additional notes about the client"
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateClient} className="w-full" disabled={!newClient.name}>
                Create Client
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Status Header - Green when selected */}
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-medium text-green-800">Client Selected</h3>
            <p className="text-sm text-green-600">
              <span className="font-medium">{client.name}</span>
              {client.client_type === 'B2B' && client.company_name && (
                <span> - {client.company_name}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowEditClient(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
          <Button variant="outline" onClick={() => setShowClientSearch(true)}>
            <Search className="h-4 w-4 mr-2" />
            Change Client
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Client Information</h3>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{client.name}</span>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active Client
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Phone</h4>
              <p>{client.phone || 'Not provided'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Email</h4>
              <p>{client.email || 'Not provided'}</p>
            </div>
          </div>
          
          {client.address && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Address</h4>
              <p>{client.address}</p>
              {(client.city || client.state || client.zip_code) && (
                <p>{client.city}{client.state && `, ${client.state}`} {client.zip_code}</p>
              )}
            </div>
          )}
          
          {client.notes && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Notes</h4>
              <p>{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Search Dialog */}
      <Dialog open={showClientSearch} onOpenChange={setShowClientSearch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Client</DialogTitle>
            <DialogDescription>
              Search and select a different client for this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Command className="border rounded-lg">
              <CommandInput
                placeholder="Search clients..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList className="max-h-[200px]">
                <CommandEmpty>No clients found.</CommandEmpty>
                <CommandGroup>
                  {filteredClients.map((client) => (
                    <CommandItem
                      key={client.id}
                      onSelect={() => handleClientSelect(client.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{client.name}</span>
                        {client.email && (
                          <span className="text-sm text-muted-foreground">{client.email}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <Button onClick={() => setShowCreateClient(true)} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create New Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Client Dialog */}
      <Dialog open={showCreateClient} onOpenChange={setShowCreateClient}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
            <DialogDescription>
              Add a new client to your database
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                placeholder="Client name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newClient.city}
                  onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newClient.state}
                  onChange={(e) => setNewClient({...newClient, state: e.target.value})}
                  placeholder="State"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={newClient.zip_code}
                onChange={(e) => setNewClient({...newClient, zip_code: e.target.value})}
                placeholder="ZIP Code"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newClient.notes}
                onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                placeholder="Additional notes about the client"
                rows={3}
              />
            </div>
            <Button onClick={handleCreateClient} className="w-full" disabled={!newClient.name}>
              Create Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={showEditClient} onOpenChange={setShowEditClient}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Client editing functionality will be implemented here. For now, you can change to a different client or create a new one.
            </p>
            <div className="flex space-x-2">
              <Button onClick={() => {
                setShowEditClient(false);
                setShowClientSearch(true);
              }} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Change Client
              </Button>
              <Button onClick={() => {
                setShowEditClient(false);
                setShowCreateClient(true);
              }} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
