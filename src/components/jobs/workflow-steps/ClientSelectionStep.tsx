import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Building
} from "lucide-react";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface ClientSelectionStepProps {
  selectedClient?: any;
  onClientSelect: (client: any) => void;
}

export const ClientSelectionStep = ({ selectedClient, onClientSelect }: ClientSelectionStepProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    client_type: "B2C" as "B2C" | "B2B",
    company_name: "",
    contact_person: ""
  });

  const { data: clients = [], isLoading } = useClients();
  const createClientMutation = useCreateClient();
  const { toast } = useToast();

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const createdClient = await createClientMutation.mutateAsync(newClient);
      onClientSelect(createdClient);
      setShowCreateForm(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        client_type: "B2C",
        company_name: "",
        contact_person: ""
      });
      toast({
        title: "Success",
        description: "Client created and selected successfully"
      });
    } catch (error) {
      console.error("Failed to create client:", error);
    }
  };

  if (showCreateForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={newClient.name}
                onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="client_type">Client Type</Label>
              <select
                id="client_type"
                value={newClient.client_type}
                onChange={(e) => setNewClient(prev => ({ ...prev, client_type: e.target.value as "B2B" | "B2C" }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="B2C">Individual (B2C)</option>
                <option value="B2B">Business (B2B)</option>
              </select>
            </div>
            {newClient.client_type === "B2B" && (
              <>
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={newClient.company_name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={newClient.contact_person}
                    onChange={(e) => setNewClient(prev => ({ ...prev, contact_person: e.target.value }))}
                    placeholder="Contact person name"
                  />
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newClient.address}
                onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Street address"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={newClient.city}
                onChange={(e) => setNewClient(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={newClient.state}
                onChange={(e) => setNewClient(prev => ({ ...prev, state: e.target.value }))}
                placeholder="State"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button 
              onClick={handleCreateClient}
              disabled={createClientMutation.isPending || !newClient.name.trim()}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              {createClientMutation.isPending ? "Creating..." : "Create & Select Client"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {selectedClient && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">{selectedClient.name}</h3>
                  <p className="text-sm text-green-600">
                    {selectedClient.email} • {selectedClient.phone}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Selected</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Client
            </CardTitle>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              New Client
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Clients List */}
          {isLoading ? (
            <div className="text-center py-8">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {searchTerm ? "No clients found matching your search" : "No clients yet"}
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Client
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => onClientSelect(client)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedClient?.id === client.id 
                      ? "border-brand-primary bg-brand-primary/5" 
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{client.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {client.client_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                        {client.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {client.address}
                          </span>
                        )}
                      </div>
                      {client.client_type === "B2B" && client.company_name && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Building className="h-3 w-3" />
                          {client.company_name}
                        </div>
                      )}
                    </div>
                    {selectedClient?.id === client.id && (
                      <Badge className="bg-brand-primary text-white">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};