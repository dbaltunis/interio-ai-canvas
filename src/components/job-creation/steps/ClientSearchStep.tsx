
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Plus, User, Building, Edit, Phone, Mail, MapPin, Tag, CalendarDays, DollarSign, X } from "lucide-react";
import { useClients, useCreateClient, useUpdateClient, useDealerOwnClients } from "@/hooks/useClients";
import { useIsDealer } from "@/hooks/useIsDealer";
import { useClientStages } from "@/hooks/useClientStages";
import { COUNTRIES } from "@/constants/clientConstants";
import { LeadSourceSelect } from "@/components/crm/LeadSourceSelect";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ClientSearchStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  isLocked?: boolean;
}

export const ClientSearchStep = ({ formData, updateFormData, isLocked = false }: ClientSearchStepProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isChangingClient, setIsChangingClient] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [tagInput, setTagInput] = useState("");
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
    country: "",
    abn: "",
    business_email: "",
    business_phone: "",
    notes: "",
    funnel_stage: "",
    lead_source: "",
    referral_source: "",
    deal_value: "",
    priority_level: "",
    marketing_consent: false,
    follow_up_date: null as Date | null,
    tags: [] as string[],
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

  // Get dynamic funnel stages
  const { data: clientStages = [] } = useClientStages();

  // Dealer-specific client filtering
  const { data: isDealer, isLoading: isDealerLoading } = useIsDealer();
  const { data: regularClients, isLoading: regularLoading } = useClients();
  const { data: dealerClients, isLoading: dealerLoading } = useDealerOwnClients();
  
  // Use dealer clients if user is a dealer, otherwise use regular clients
  const clients = isDealer ? dealerClients : regularClients;
  const isLoading = isDealerLoading || (isDealer ? dealerLoading : regularLoading);
  
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  // Improved search with alphabetical sorting and relevance
  const term = searchTerm.toLowerCase().trim();
  
  const filteredClients = term
    ? clients
        ?.filter(client => 
          client.name.toLowerCase().includes(term) ||
          client.company_name?.toLowerCase().includes(term) ||
          client.email?.toLowerCase().includes(term)
        )
        .sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aStarts = aName.startsWith(term);
          const bStarts = bName.startsWith(term);
          
          // Prioritize startsWith matches
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // Then alphabetical
          return aName.localeCompare(bName);
        }) || []
    : [];

  // Default clients when no search - show first 10 alphabetically
  const defaultClients = clients
    ?.slice()
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .slice(0, 10) || [];

  // Clients to display in the list
  const displayClients = term ? filteredClients : defaultClients;

  const selectedClient = clients?.find(c => c.id === formData.client_id);

  // Get stage info for display
  const getStageInfo = (stageName: string) => {
    const stage = clientStages.find(s => s.name === stageName);
    if (stage) {
      return { name: stage.name, color: stage.color || 'gray' };
    }
    return null;
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !newClientData.tags.includes(trimmed)) {
      setNewClientData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmed]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewClientData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleCreateClient = async () => {
    if (!newClientData.name.trim()) return;
    
    try {
      const clientPayload: any = {
        name: newClientData.name,
        email: newClientData.email || undefined,
        phone: newClientData.phone || undefined,
        company_name: newClientData.company_name || undefined,
        client_type: newClientData.client_type,
        address: newClientData.address || undefined,
        city: newClientData.city || undefined,
        state: newClientData.state || undefined,
        zip_code: newClientData.zip_code || undefined,
        country: newClientData.country || undefined,
        abn: newClientData.abn || undefined,
        business_email: newClientData.business_email || undefined,
        business_phone: newClientData.business_phone || undefined,
        notes: newClientData.notes || undefined,
        funnel_stage: newClientData.funnel_stage || undefined,
        lead_source: newClientData.lead_source || undefined,
        referral_source: newClientData.referral_source || undefined,
        deal_value: newClientData.deal_value ? parseFloat(newClientData.deal_value) : undefined,
        priority_level: newClientData.priority_level || undefined,
        marketing_consent: newClientData.marketing_consent,
        follow_up_date: newClientData.follow_up_date ? format(newClientData.follow_up_date, 'yyyy-MM-dd') : undefined,
        tags: newClientData.tags.length > 0 ? newClientData.tags : undefined,
      };

      const client = await createClient.mutateAsync(clientPayload);
      updateFormData("client_id", client.id);
      setShowCreateForm(false);
      setIsChangingClient(false);
      setNewClientData({ 
        name: "", email: "", phone: "", company_name: "", 
        client_type: "B2C", address: "", city: "", state: "", zip_code: "",
        country: "", abn: "", business_email: "", business_phone: "",
        notes: "", funnel_stage: "", lead_source: "", referral_source: "",
        deal_value: "", priority_level: "", marketing_consent: false,
        follow_up_date: null, tags: []
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

  // Format address for display
  const formatAddress = (client: any) => {
    const parts = [client.address, client.city, client.state, client.zip_code].filter(Boolean);
    return parts.join(", ");
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
          {/* Basic Info */}
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

          {/* Funnel Stage & Lead Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Funnel Stage</Label>
              <Select 
                value={newClientData.funnel_stage} 
                onValueChange={(value) => setNewClientData(prev => ({ ...prev, funnel_stage: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {clientStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.name}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lead Source</Label>
              <LeadSourceSelect
                value={newClientData.lead_source}
                onValueChange={(value) => setNewClientData(prev => ({ ...prev, lead_source: value }))}
                placeholder="Select source"
              />
            </div>
          </div>

          {/* Priority & Deal Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority Level</Label>
              <Select 
                value={newClientData.priority_level} 
                onValueChange={(value) => setNewClientData(prev => ({ ...prev, priority_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deal_value">Deal Value</Label>
              <Input
                id="deal_value"
                type="number"
                value={newClientData.deal_value}
                onChange={(e) => setNewClientData(prev => ({ ...prev, deal_value: e.target.value }))}
                placeholder="Estimated value"
              />
            </div>
          </div>

          {/* Referral & Follow-up */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="referral_source">Referral Source</Label>
              <Input
                id="referral_source"
                value={newClientData.referral_source}
                onChange={(e) => setNewClientData(prev => ({ ...prev, referral_source: e.target.value }))}
                placeholder="Who referred this client?"
              />
            </div>
            <div>
              <Label>Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newClientData.follow_up_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {newClientData.follow_up_date 
                      ? format(newClientData.follow_up_date, "PPP") 
                      : "Pick a date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newClientData.follow_up_date || undefined}
                    onSelect={(date) => setNewClientData(prev => ({ ...prev, follow_up_date: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={newClientData.address}
              onChange={(e) => setNewClientData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
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
            <div>
              <Label>Country</Label>
              <Select 
                value={newClientData.country} 
                onValueChange={(value) => setNewClientData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {newClientData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={newClientData.notes}
              onChange={(e) => setNewClientData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this client..."
              rows={3}
            />
          </div>

          {/* Marketing Consent */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="marketing_consent"
              checked={newClientData.marketing_consent}
              onCheckedChange={(checked) => setNewClientData(prev => ({ ...prev, marketing_consent: !!checked }))}
            />
            <Label htmlFor="marketing_consent" className="text-sm font-normal">
              Client has given marketing consent
            </Label>
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {selectedClient.client_type === "B2B" ? (
                  <Building className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <User className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Name & Type Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-green-800 text-lg">{selectedClient.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {selectedClient.client_type === "B2B" ? "Business" : "Individual"}
                    </Badge>
                  </div>

                  {/* Company for B2B */}
                  {selectedClient.client_type === "B2B" && selectedClient.company_name && (
                    <p className="text-sm font-medium text-green-700">{selectedClient.company_name}</p>
                  )}

                  {/* Funnel Stage */}
                  {selectedClient.funnel_stage && (
                    <div className="flex items-center gap-1">
                      {(() => {
                        const stageInfo = getStageInfo(selectedClient.funnel_stage);
                        if (stageInfo) {
                          return (
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ backgroundColor: stageInfo.color ? `${stageInfo.color}20` : undefined }}
                            >
                              {stageInfo.name}
                            </Badge>
                          );
                        }
                        return (
                          <Badge variant="secondary" className="text-xs">
                            {selectedClient.funnel_stage}
                          </Badge>
                        );
                      })()}
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                    {selectedClient.email && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{selectedClient.email}</span>
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{selectedClient.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {formatAddress(selectedClient) && (
                    <div className="flex items-start gap-1 text-sm text-green-600">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>{formatAddress(selectedClient)}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedClient.tags && selectedClient.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Tag className="h-3.5 w-3.5 text-green-500" />
                      {selectedClient.tags.slice(0, 5).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {selectedClient.tags.length > 5 && (
                        <span className="text-xs text-muted-foreground">+{selectedClient.tags.length - 5} more</span>
                      )}
                    </div>
                  )}

                  {/* Deal Value & Priority */}
                  {(selectedClient.deal_value || selectedClient.priority_level) && (
                    <div className="flex items-center gap-3 text-sm">
                      {selectedClient.deal_value > 0 && (
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>${selectedClient.deal_value.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedClient.priority_level && (
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs",
                            selectedClient.priority_level === 'urgent' && "border-red-500 text-red-600",
                            selectedClient.priority_level === 'high' && "border-orange-500 text-orange-600",
                            selectedClient.priority_level === 'medium' && "border-yellow-500 text-yellow-600",
                            selectedClient.priority_level === 'low' && "border-gray-400 text-gray-600",
                          )}
                        >
                          {selectedClient.priority_level} priority
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={openEditDialog}
                  disabled={isLocked}
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
                  disabled={isLocked}
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
              disabled={isLocked}
            />
          </div>

          {/* Show clients list - either filtered or default alphabetical */}
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-center py-4 text-gray-500">Loading clients...</p>
            ) : displayClients.length > 0 ? (
              <>
                {!term && (
                  <p className="text-xs text-muted-foreground px-1">
                    Recent clients (A-Z) • Type to search
                  </p>
                )}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {displayClients.map(client => {
                    const stageInfo = client.funnel_stage ? getStageInfo(client.funnel_stage) : null;
                    return (
                      <Card 
                        key={client.id} 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          if (!isLocked) {
                            updateFormData("client_id", client.id);
                            setIsChangingClient(false);
                          }
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            {client.client_type === "B2B" ? (
                              <Building className="h-4 w-4 text-gray-400 mt-0.5" />
                            ) : (
                              <User className="h-4 w-4 text-gray-400 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">{client.name}</p>
                                <Badge variant="outline" className="text-xs py-0">
                                  {client.client_type === "B2B" ? "B2B" : "B2C"}
                                </Badge>
                                {stageInfo && (
                                  <Badge variant="secondary" className="text-xs py-0">
                                    {stageInfo.name}
                                  </Badge>
                                )}
                              </div>
                              {client.company_name && (
                                <p className="text-sm text-gray-600">{client.company_name}</p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                {client.email && (
                                  <span className="truncate">{client.email}</span>
                                )}
                                {client.phone && (
                                  <span>{client.phone}</span>
                                )}
                              </div>
                              {formatAddress(client) && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                  {formatAddress(client)}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : term ? (
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
                    disabled={isLocked}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create "{searchTerm}" as new client
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-3">No clients found</p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    variant="outline"
                    disabled={isLocked}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Client
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Create New Client button when there are results */}
          {displayClients.length > 0 && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              className="w-full"
              disabled={isLocked}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Client
            </Button>
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
