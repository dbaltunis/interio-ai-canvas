
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateClient, useClients, useUpdateClient } from "@/hooks/useClients";
import { ArrowLeft, Upload, FileText, Camera, Ruler } from "lucide-react";

interface EnhancedClientFormProps {
  onBack: () => void;
  onClientCreated?: (clientId: string) => void;
  clientId?: string;
}

export const EnhancedClientForm = ({ onBack, onClientCreated, clientId }: EnhancedClientFormProps) => {
  const [clientType, setClientType] = useState<"B2B" | "B2C">("B2C");
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    company_name: "",
    contact_person: "",
    notes: "",
    
    // Industry-specific fields
    preferred_measurement_unit: "inches",
    budget_range: "",
    preferred_style: "",
    project_timeline: "",
    referral_source: "",
    
    // Project preferences
    room_types: [] as string[],
    treatment_preferences: [] as string[],
    fabric_preferences: [] as string[],
    
    // Communication preferences
    preferred_contact_method: "email",
    best_contact_time: "",
    special_instructions: ""
  });

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const { data: clients } = useClients();
  
  const isEditing = Boolean(clientId);
  const existingClient = clients?.find(c => c.id === clientId);

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
        notes: existingClient.notes || "",
        
        // Industry defaults
        preferred_measurement_unit: "inches",
        budget_range: "",
        preferred_style: "",
        project_timeline: "",
        referral_source: "",
        room_types: [],
        treatment_preferences: [],
        fabric_preferences: [],
        preferred_contact_method: "email",
        best_contact_time: "",
        special_instructions: ""
      });
    }
  }, [isEditing, existingClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const clientData = {
        ...formData,
        client_type: clientType,
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

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Client' : 'Create New Client'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="bg-background border-b border-border/50 rounded-none p-0 h-auto flex w-full justify-start gap-0">
            <TabsTrigger value="basic" className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50">Basic Info</TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50">Preferences</TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50">Project Details</TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50">Documents</TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Type */}
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

                {/* Conditional Fields */}
                {clientType === "B2B" ? (
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

                {/* Address */}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Client Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preferred Measurement Unit</Label>
                    <Select value={formData.preferred_measurement_unit} onValueChange={(value) => handleInputChange("preferred_measurement_unit", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inches">Inches</SelectItem>
                        <SelectItem value="feet">Feet</SelectItem>
                        <SelectItem value="metric">Metric (cm/m)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Budget Range</Label>
                    <Select value={formData.budget_range} onValueChange={(value) => handleInputChange("budget_range", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-5k">Under $5,000</SelectItem>
                        <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                        <SelectItem value="15k-30k">$15,000 - $30,000</SelectItem>
                        <SelectItem value="30k-50k">$30,000 - $50,000</SelectItem>
                        <SelectItem value="over-50k">Over $50,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Project Timeline</Label>
                    <Select value={formData.project_timeline} onValueChange={(value) => handleInputChange("project_timeline", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP</SelectItem>
                        <SelectItem value="1-month">Within 1 month</SelectItem>
                        <SelectItem value="3-months">Within 3 months</SelectItem>
                        <SelectItem value="6-months">Within 6 months</SelectItem>
                        <SelectItem value="planning">Just planning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Referral Source</Label>
                    <Input
                      value={formData.referral_source}
                      onChange={(e) => handleInputChange("referral_source", e.target.value)}
                      placeholder="How did they hear about us?"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Ruler className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Measurements</p>
                    <p className="text-xs text-gray-500 mb-3">Upload measurement files</p>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Blueprints</p>
                    <p className="text-xs text-gray-500 mb-3">Project blueprints & plans</p>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Photos</p>
                    <p className="text-xs text-gray-500 mb-3">Room photos & inspiration</p>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication">
            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preferred Contact Method</Label>
                    <Select value={formData.preferred_contact_method} onValueChange={(value) => handleInputChange("preferred_contact_method", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                        <SelectItem value="any">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Best Contact Time</Label>
                    <Input
                      value={formData.best_contact_time}
                      onChange={(e) => handleInputChange("best_contact_time", e.target.value)}
                      placeholder="e.g., Mornings, Weekends"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Textarea
                    value={formData.special_instructions}
                    onChange={(e) => handleInputChange("special_instructions", e.target.value)}
                    rows={3}
                    placeholder="Any special communication needs or instructions..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>General Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                    placeholder="Additional notes about the client..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
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
    </div>
  );
};
