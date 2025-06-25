
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateClient, useClients, useUpdateClient } from "@/hooks/useClients";
import { ArrowLeft } from "lucide-react";

interface ClientCreateFormProps {
  onBack: () => void;
  onClientCreated?: (clientId: string) => void;
  clientId?: string; // Optional prop for editing existing clients
}

export const ClientCreateForm = ({ onBack, onClientCreated, clientId }: ClientCreateFormProps) => {
  const [clientType, setClientType] = useState<"B2B" | "B2C">("B2C");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    company_name: "",
    contact_person: "",
    notes: ""
  });

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const { data: clients } = useClients();
  
  const isEditing = Boolean(clientId);
  const existingClient = clients?.find(c => c.id === clientId);

  // Load existing client data when editing
  useEffect(() => {
    if (isEditing && existingClient) {
      setClientType(existingClient.client_type as "B2B" | "B2C" || "B2C");
      setFormData({
        name: existingClient.name || "",
        email: existingClient.email || "",
        phone: existingClient.phone || "",
        address: existingClient.address || "",
        city: existingClient.city || "",
        state: existingClient.state || "",
        zip_code: existingClient.zip_code || "",
        company_name: existingClient.company_name || "",
        contact_person: existingClient.contact_person || "",
        notes: existingClient.notes || ""
      });
    }
  }, [isEditing, existingClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const clientData = {
        ...formData,
        client_type: clientType,
        // For B2C, use name as company_name if not provided
        company_name: clientType === "B2C" ? (formData.company_name || formData.name) : formData.company_name,
        contact_person: clientType === "B2C" ? (formData.contact_person || formData.name) : formData.contact_person
      };

      if (isEditing && clientId) {
        await updateClient.mutateAsync({ id: clientId, ...clientData });
        onBack();
      } else {
        const newClient = await createClient.mutateAsync(clientData);
        
        if (onClientCreated) {
          onClientCreated(newClient.id);
        } else {
          onBack();
        }
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} client:`, error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Client' : 'Create New Client'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Type Selection */}
            <div className="space-y-2">
              <Label>Client Type</Label>
              <Select value={clientType} onValueChange={(value: "B2B" | "B2C") => setClientType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2C">B2C - Individual Consumer</SelectItem>
                  <SelectItem value="B2B">B2B - Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields Based on Client Type */}
            {clientType === "B2B" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Contact Person *</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => handleInputChange("contact_person", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
            )}

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange("zip_code", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={createClient.isPending || updateClient.isPending}>
                {createClient.isPending || updateClient.isPending ? 
                  (isEditing ? "Updating..." : "Creating...") : 
                  (isEditing ? "Update Client" : "Create Client")
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
