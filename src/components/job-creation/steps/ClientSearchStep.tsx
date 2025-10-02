
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, User, Building, Edit } from "lucide-react";
import { useClients, useCreateClient, useUpdateClient } from "@/hooks/useClients";

interface ClientSearchStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const ClientSearchStep = ({ formData, updateFormData }: ClientSearchStepProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isChangingClient, setIsChangingClient] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    client_type: "B2C" as "B2B" | "B2C",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    abn: "",
    business_email: "",
    business_phone: ""
  });
  const [editClientData, setEditClientData] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    client_type: "B2C" as "B2B" | "B2C",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    abn: "",
    business_email: "",
    business_phone: ""
  });

  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedClient = clients?.find(c => c.id === formData.client_id);

  const handleCreateClient = async () => {
    if (!newClientData.name.trim()) return;
    
    try {
      const client = await createClient.mutateAsync(newClientData);
      updateFormData("client_id", client.id);
      setShowCreateForm(false);
      setIsChangingClient(false);
      setNewClientData({ 
        name: "", email: "", phone: "", company_name: "", 
        client_type: "B2C", address: "", city: "", state: "", zip_code: "",
        abn: "", business_email: "", business_phone: ""
      });
      setSearchTerm("");
    } catch (error) {
      console.error("Failed to create client:", error);
    }
  };

  const handleEditClient = async () => {
    if (!editClientData.name.trim() || !selectedClient) return;
    
    try {
      await updateClient.mutateAsync({
        id: selectedClient.id,
        ...editClientData
      });
      setShowEditDialog(false);
    } catch (error) {
      console.error("Failed to update client:", error);
    }
  };

  const openEditDialog = () => {
    if (selectedClient) {
      setEditClientData({
        name: selectedClient.name || "",
        email: selectedClient.email || "",
        phone: selectedClient.phone || "",
        company_name: selectedClient.company_name || "",
        client_type: (selectedClient.client_type as "B2B" | "B2C") || "B2C",
        address: selectedClient.address || "",
        city: selectedClient.city || "",
        state: selectedClient.state || "",
        zip_code: selectedClient.zip_code || "",
        abn: selectedClient.abn || "",
        business_email: selectedClient.business_email || "",
        business_phone: selectedClient.business_phone || ""
      });
      setShowEditDialog(true);
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_name">Client Name *</Label>
              <Input
                id="client_name"
                value={newClientData.name}
                onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="client_type">Client Type</Label>
              <Select 
                value={newClientData.client_type} 
                onValueChange={(value: "B2B" | "B2C") => setNewClientData(prev => ({ ...prev, client_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2C">Individual (B2C)</SelectItem>
                  <SelectItem value="B2B">Business (B2B)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {newClientData.client_type === "B2B" && (
            <>
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={newClientData.company_name}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Company name"
                />
              </div>

              <div>
                <Label htmlFor="abn">ABN / Registration Number</Label>
                <Input
                  id="abn"
                  value={newClientData.abn}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, abn: e.target.value }))}
                  placeholder="Business registration number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_email">Business Email</Label>
                  <Input
                    id="business_email"
                    type="email"
                    value={newClientData.business_email}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, business_email: e.target.value }))}
                    placeholder="business@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="business_phone">Business Phone</Label>
                  <Input
                    id="business_phone"
                    value={newClientData.business_phone}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, business_phone: e.target.value }))}
                    placeholder="Business phone number"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_email">{newClientData.client_type === "B2B" ? "Contact Email" : "Email"}</Label>
              <Input
                id="client_email"
                type="email"
                value={newClientData.email}
                onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="client_phone">{newClientData.client_type === "B2B" ? "Contact Phone" : "Phone"}</Label>
              <Input
                id="client_phone"
                value={newClientData.phone}
                onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={newClientData.address}
              onChange={(e) => setNewClientData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={newClientData.city}
                onChange={(e) => setNewClientData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={newClientData.state}
                onChange={(e) => setNewClientData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="State"
              />
            </div>
            <div>
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                value={newClientData.zip_code}
                onChange={(e) => setNewClientData(prev => ({ ...prev, zip_code: e.target.value }))}
                placeholder="ZIP"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleCreateClient}
              disabled={!newClientData.name.trim() || createClient.isPending}
              className="bg-brand-primary hover:bg-brand-accent text-white"
            >
              {createClient.isPending ? "Creating..." : "Create Client"}
            </Button>
            <Button 
              type="button"
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
      <div>
        <Label className="text-sm font-medium text-gray-900">
          Search or Create Client
        </Label>
        <p className="text-sm text-gray-500 mt-1">
          Search for existing clients or create a new one
        </p>
      </div>

      {selectedClient && !isChangingClient ? (
        <Card className="bg-green-50 border-green-200 relative z-0">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedClient.client_type === "B2B" ? (
                  <Building className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <User className="h-5 w-5 text-green-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-green-800">{selectedClient.name}</p>
                  {selectedClient.company_name && (
                    <p className="text-sm text-green-600 font-medium">{selectedClient.company_name}</p>
                  )}
                  {selectedClient.client_type === "B2B" && selectedClient.abn && (
                    <p className="text-sm text-green-600">ABN: {selectedClient.abn}</p>
                  )}
                  <div className="mt-1 space-y-0.5">
                    {selectedClient.client_type === "B2B" && selectedClient.business_email && (
                      <p className="text-sm text-green-600">Business: {selectedClient.business_email}</p>
                    )}
                    {selectedClient.client_type === "B2B" && selectedClient.business_phone && (
                      <p className="text-sm text-green-600">Business Phone: {selectedClient.business_phone}</p>
                    )}
                    {selectedClient.email && (
                      <p className="text-sm text-green-600">{selectedClient.client_type === "B2B" ? "Contact: " : ""}{selectedClient.email}</p>
                    )}
                    {selectedClient.phone && (
                      <p className="text-sm text-green-600">{selectedClient.client_type === "B2B" ? "Contact Phone: " : "Phone: "}{selectedClient.phone}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={openEditDialog}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsChangingClient(true);
                    setSearchTerm("");
                  }}
                >
                  Change Client
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchTerm && (
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-center py-4 text-gray-500">Searching...</p>
              ) : filteredClients.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredClients.map(client => (
                    <Card 
                      key={client.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        updateFormData("client_id", client.id);
                        setIsChangingClient(false);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          {client.client_type === "B2B" ? (
                            <Building className="h-4 w-4 text-gray-400" />
                          ) : (
                            <User className="h-4 w-4 text-gray-400" />
                          )}
                          <div>
                            <p className="font-medium">{client.name}</p>
                            {client.company_name && (
                              <p className="text-sm text-gray-500">{client.company_name}</p>
                            )}
                            {client.email && (
                              <p className="text-sm text-gray-500">{client.email}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 mb-3">No clients found matching "{searchTerm}"</p>
                    <Button 
                      onClick={() => {
                        setNewClientData(prev => ({ ...prev, name: searchTerm }));
                        setShowCreateForm(true);
                      }}
                      className="bg-brand-primary hover:bg-brand-accent text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create "{searchTerm}" as new client
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!searchTerm && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-3">Start typing to search for clients</p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Client
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Edit Client Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Client Name *</Label>
              <Input
                id="edit_name"
                value={editClientData.name}
                onChange={(e) => setEditClientData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_client_type">Client Type</Label>
              <Select 
                value={editClientData.client_type} 
                onValueChange={(value: "B2B" | "B2C") => setEditClientData(prev => ({ ...prev, client_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2C">Individual (B2C)</SelectItem>
                  <SelectItem value="B2B">Business (B2B)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editClientData.client_type === "B2B" && (
              <>
                <div>
                  <Label htmlFor="edit_company">Company Name</Label>
                  <Input
                    id="edit_company"
                    value={editClientData.company_name}
                    onChange={(e) => setEditClientData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <Label htmlFor="edit_abn">ABN / Registration Number</Label>
                  <Input
                    id="edit_abn"
                    value={editClientData.abn}
                    onChange={(e) => setEditClientData(prev => ({ ...prev, abn: e.target.value }))}
                    placeholder="Business registration number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_business_email">Business Email</Label>
                    <Input
                      id="edit_business_email"
                      type="email"
                      value={editClientData.business_email}
                      onChange={(e) => setEditClientData(prev => ({ ...prev, business_email: e.target.value }))}
                      placeholder="business@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_business_phone">Business Phone</Label>
                    <Input
                      id="edit_business_phone"
                      value={editClientData.business_phone}
                      onChange={(e) => setEditClientData(prev => ({ ...prev, business_phone: e.target.value }))}
                      placeholder="Business phone number"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_email">{editClientData.client_type === "B2B" ? "Contact Email" : "Email"}</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editClientData.email}
                  onChange={(e) => setEditClientData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">{editClientData.client_type === "B2B" ? "Contact Phone" : "Phone"}</Label>
                <Input
                  id="edit_phone"
                  value={editClientData.phone}
                  onChange={(e) => setEditClientData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_address">Address</Label>
              <Input
                id="edit_address"
                value={editClientData.address}
                onChange={(e) => setEditClientData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_city">City</Label>
                <Input
                  id="edit_city"
                  value={editClientData.city}
                  onChange={(e) => setEditClientData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="edit_state">State</Label>
                <Input
                  id="edit_state"
                  value={editClientData.state}
                  onChange={(e) => setEditClientData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="edit_zip">ZIP Code</Label>
                <Input
                  id="edit_zip"
                  value={editClientData.zip_code}
                  onChange={(e) => setEditClientData(prev => ({ ...prev, zip_code: e.target.value }))}
                  placeholder="ZIP"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditClient}
                disabled={!editClientData.name.trim()}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
