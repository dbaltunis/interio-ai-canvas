import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldGroup } from "@/components/ui/form-field-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ClientFormWithLeadIntelligenceProps {
  onCancel: () => void;
  onSuccess?: () => void;
  editingClient?: any;
}

export const ClientFormWithLeadIntelligence = ({ onCancel, onSuccess, editingClient }: ClientFormWithLeadIntelligenceProps) => {
  const [clientType, setClientType] = useState<"B2B" | "B2C">(editingClient?.client_type || "B2C");
  const [companyName, setCompanyName] = useState(editingClient?.company_name || "");
  const [contactPerson, setContactPerson] = useState(editingClient?.contact_person || "");
  const [name, setName] = useState(editingClient?.name || "");
  const [email, setEmail] = useState(editingClient?.email || "");
  const [phone, setPhone] = useState(editingClient?.phone || "");
  const [address, setAddress] = useState(editingClient?.address || "");
  const [city, setCity] = useState(editingClient?.city || "");
  const [state, setState] = useState(editingClient?.state || "");
  const [zipCode, setZipCode] = useState(editingClient?.zip_code || "");
  const [country, setCountry] = useState(editingClient?.country || "United States");
  const [notes, setNotes] = useState(editingClient?.notes || "");
  const [tags, setTags] = useState<string[]>(editingClient?.tags || []);
  const [currentTag, setCurrentTag] = useState("");
  
  // Lead intelligence fields
  const [leadSource, setLeadSource] = useState(editingClient?.lead_source || "");
  const [referralSource, setReferralSource] = useState(editingClient?.referral_source || "");
  const [dealValue, setDealValue] = useState(editingClient?.deal_value?.toString() || "");
  const [priorityLevel, setPriorityLevel] = useState(editingClient?.priority_level || "medium");
  const [marketingConsent, setMarketingConsent] = useState(editingClient?.marketing_consent || false);
  const [followUpDate, setFollowUpDate] = useState(
    editingClient?.follow_up_date ? new Date(editingClient.follow_up_date).toISOString().split('T')[0] : ""
  );

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const clientData = {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zipCode || null,
        country,
        notes: notes || null,
        client_type: clientType,
        company_name: clientType === "B2B" ? companyName || null : null,
        contact_person: clientType === "B2B" ? contactPerson || null : null,
        tags: tags.length > 0 ? tags : null,
        // Lead intelligence fields
        lead_source: leadSource || null,
        referral_source: referralSource || null,
        deal_value: dealValue ? parseFloat(dealValue) : null,
        priority_level: priorityLevel,
        marketing_consent: marketingConsent,
        follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null,
      };

      if (editingClient) {
        await updateClient.mutateAsync({ id: editingClient.id, ...clientData });
      } else {
        await createClient.mutateAsync(clientData);
      }
      onSuccess?.();
    } catch (error) {
      console.error(`Failed to ${editingClient ? 'update' : 'create'} client:`, error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormFieldGroup label="Client Type" required>
            <Select value={clientType} onValueChange={(value: "B2B" | "B2C") => setClientType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-background border border-border shadow-lg" position="popper" sideOffset={4}>
                <SelectItem value="B2C">Individual (B2C)</SelectItem>
                <SelectItem value="B2B">Business (B2B)</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldGroup>

          {clientType === "B2B" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormFieldGroup label="Company Name" required>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </FormFieldGroup>
              <FormFieldGroup label="Contact Person">
                <Input
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </FormFieldGroup>
            </div>
          ) : (
            <FormFieldGroup label="Full Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormFieldGroup>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormFieldGroup label="Email Address">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormFieldGroup>
            <FormFieldGroup label="Phone Number">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormFieldGroup>
          </div>

          <FormFieldGroup label="Address">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </FormFieldGroup>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormFieldGroup label="City">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </FormFieldGroup>
            <FormFieldGroup label="State">
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </FormFieldGroup>
            <FormFieldGroup label="ZIP Code">
              <Input
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </FormFieldGroup>
          </div>

          <FormFieldGroup label="Country">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-background border border-border shadow-lg" position="popper" sideOffset={4}>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldGroup>

          <FormFieldGroup label="Tags" description="Add tags to categorize this client">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Enter a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </FormFieldGroup>

          <FormFieldGroup label="Notes">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes about this client..."
            />
          </FormFieldGroup>
        </CardContent>
      </Card>

      {/* Lead Intelligence Section */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Intelligence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormFieldGroup label="Lead Source" description="How did they find you?">
              <Select value={leadSource} onValueChange={setLeadSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-background border border-border shadow-lg" position="popper" sideOffset={4}>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="google_ads">Google Ads</SelectItem>
                  <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="trade_show">Trade Show</SelectItem>
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                  <SelectItem value="email_campaign">Email Campaign</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldGroup>

            <FormFieldGroup label="Priority Level">
              <Select value={priorityLevel} onValueChange={setPriorityLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-background border border-border shadow-lg" position="popper" sideOffset={4}>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldGroup>

            <FormFieldGroup label="Referral Source" description="Who referred this client?">
              <Input
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                placeholder="e.g., John Smith, ABC Company"
              />
            </FormFieldGroup>

            <FormFieldGroup label="Estimated Deal Value">
              <Input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </FormFieldGroup>

            <FormFieldGroup label="Follow-up Date">
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </FormFieldGroup>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="marketing-consent"
                checked={marketingConsent}
                onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
              />
              <Label htmlFor="marketing-consent" className="text-sm font-medium">
                Marketing consent given
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createClient.isPending || updateClient.isPending}>
          {(createClient.isPending || updateClient.isPending) 
            ? (editingClient ? "Updating..." : "Creating...") 
            : (editingClient ? "Update Client" : "Create Client")
          }
        </Button>
      </div>
    </form>
  );
};