
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessSettings, useCreateBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Phone, MapPin, Globe } from "lucide-react";
import { LoadingFallback } from "@/components/ui/loading-fallback";
import { FormSection } from "@/components/ui/form-section";
import { FormFieldGroup } from "@/components/ui/form-field-group";

export const BusinessSettingsTab = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  const createBusinessSettings = useCreateBusinessSettings();
  const updateBusinessSettings = useUpdateBusinessSettings();
  const { toast } = useToast();
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    abn: "",
    business_email: "",
    business_phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "Australia",
    website: "",
    company_logo_url: ""
  });

  useEffect(() => {
    if (businessSettings) {
      setFormData({
        company_name: businessSettings.company_name || "",
        abn: businessSettings.abn || "",
        business_email: businessSettings.business_email || "",
        business_phone: businessSettings.business_phone || "",
        address: businessSettings.address || "",
        city: businessSettings.city || "",
        state: businessSettings.state || "",
        zip_code: businessSettings.zip_code || "",
        country: businessSettings.country || "Australia",
        website: businessSettings.website || "",
        company_logo_url: businessSettings.company_logo_url || ""
      });
    }
  }, [businessSettings]);

  const handleInputChange = (field: string, value: string) => {
    setSavedSuccessfully(false);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (businessSettings?.id) {
        await updateBusinessSettings.mutateAsync({
          id: businessSettings.id,
          ...formData
        });
      } else {
        await createBusinessSettings.mutateAsync(formData);
      }
      
      setSavedSuccessfully(true);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Business settings saved successfully",
      });
      
      setTimeout(() => setSavedSuccessfully(false), 3000);
    } catch (error) {
      setSavedSuccessfully(false);
      toast({
        title: "Error",
        description: "Failed to save business settings",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSavedSuccessfully(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (businessSettings) {
      setFormData({
        company_name: businessSettings.company_name || "",
        abn: businessSettings.abn || "",
        business_email: businessSettings.business_email || "",
        business_phone: businessSettings.business_phone || "",
        address: businessSettings.address || "",
        city: businessSettings.city || "",
        state: businessSettings.state || "",
        zip_code: businessSettings.zip_code || "",
        country: businessSettings.country || "Australia",
        website: businessSettings.website || "",
        company_logo_url: businessSettings.company_logo_url || ""
      });
    }
  };

  if (isLoading) {
    return <LoadingFallback title="Loading business settings..." rows={4} />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Company Information */}
      <FormSection
        title="Company Information"
        description="Manage your business details and company profile"
        icon={<Building2 className="h-5 w-5" />}
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={createBusinessSettings.isPending || updateBusinessSettings.isPending}
        savedSuccessfully={savedSuccessfully}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label="Company Name" required>
            <Input
              value={formData.company_name}
              onChange={(e) => handleInputChange("company_name", e.target.value)}
              placeholder="Enter company name"
              disabled={!isEditing}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="ABN / Tax ID">
            <Input
              value={formData.abn}
              onChange={(e) => handleInputChange("abn", e.target.value)}
              placeholder="Enter ABN or Tax ID"
              disabled={!isEditing}
            />
          </FormFieldGroup>
        </div>

        <FormFieldGroup 
          label="Website" 
          description="Your company website URL"
        >
          <Input
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://www.example.com"
            disabled={!isEditing}
          />
        </FormFieldGroup>

        <FormFieldGroup 
          label="Company Logo URL" 
          description="URL to your company logo image"
        >
          <Input
            value={formData.company_logo_url}
            onChange={(e) => handleInputChange("company_logo_url", e.target.value)}
            placeholder="https://example.com/logo.png"
            disabled={!isEditing}
          />
        </FormFieldGroup>
      </FormSection>

      {/* Contact Information */}
      <FormSection
        title="Contact Information"
        description="Business contact details for customer communication"
        icon={<Mail className="h-5 w-5" />}
        isEditing={isEditing}
        onEdit={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label="Business Email">
            <Input
              type="email"
              value={formData.business_email}
              onChange={(e) => handleInputChange("business_email", e.target.value)}
              placeholder="business@example.com"
              disabled={!isEditing}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="Business Phone">
            <Input
              value={formData.business_phone}
              onChange={(e) => handleInputChange("business_phone", e.target.value)}
              placeholder="+61 2 1234 5678"
              disabled={!isEditing}
            />
          </FormFieldGroup>
        </div>
      </FormSection>

      {/* Business Address */}
      <FormSection
        title="Business Address"
        description="Your business location and address details"
        icon={<MapPin className="h-5 w-5" />}
        isEditing={isEditing}
        onEdit={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
      >
        <FormFieldGroup label="Street Address">
          <Textarea
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Enter street address"
            rows={2}
            disabled={!isEditing}
          />
        </FormFieldGroup>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormFieldGroup label="City">
            <Input
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Enter city"
              disabled={!isEditing}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="State / Province">
            <Input
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="Enter state"
              disabled={!isEditing}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="Zip / Postal Code">
            <Input
              value={formData.zip_code}
              onChange={(e) => handleInputChange("zip_code", e.target.value)}
              placeholder="Enter zip code"
              disabled={!isEditing}
            />
          </FormFieldGroup>
        </div>

        <FormFieldGroup label="Country">
          <Input
            value={formData.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            placeholder="Enter country"
            disabled={!isEditing}
          />
        </FormFieldGroup>
      </FormSection>
    </div>
  );
};
