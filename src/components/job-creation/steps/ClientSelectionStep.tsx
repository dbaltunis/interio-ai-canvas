
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User } from "lucide-react";
import { useClients, useCreateClient } from "@/hooks/useClients";

interface ClientSelectionStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const ClientSelectionStep = ({ formData, updateFormData }: ClientSelectionStepProps) => {
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState<{
    name: string;
    email: string;
    phone: string;
    company_name: string;
    client_type: "B2B" | "B2C";
  }>({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    client_type: "B2C"
  });

  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();

  const handleCreateClient = async () => {
    if (!newClientData.name.trim()) return;
    
    try {
      const client = await createClient.mutateAsync(newClientData);
      updateFormData("client_id", client.id);
      setShowNewClientForm(false);
      setNewClientData({ name: "", email: "", phone: "", company_name: "", client_type: "B2C" });
    } catch (error) {
      console.error("Failed to create client:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-gray-900">
          Client Assignment (Optional)
        </Label>
        <p className="text-sm text-gray-500 mt-1">
          You can assign a client now or add one later. Jobs can exist without clients.
        </p>
      </div>

      {!showNewClientForm ? (
        <div className="space-y-4">
          <Select 
            value={formData.client_id || ""} 
            onValueChange={(value) => updateFormData("client_id", value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an existing client or leave empty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No client assigned</SelectItem>
              {clients?.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{client.name}</span>
                    {client.company_name && (
                      <span className="text-xs text-gray-500">({client.company_name})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            type="button"
            variant="outline" 
            onClick={() => setShowNewClientForm(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Client
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create New Client</CardTitle>
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
                <Label htmlFor="client_email">Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_phone">Phone</Label>
                <Input
                  id="client_phone"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
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
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={newClientData.company_name}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
            )}

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
                onClick={() => setShowNewClientForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.client_id && clients && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Client: {clients.find(c => c.id === formData.client_id)?.name}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
