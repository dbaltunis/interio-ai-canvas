
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useBusinessSettings, useCreateBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Phone, MapPin, Globe, Upload, Image, Edit3, Shield } from "lucide-react";
import { LoadingFallback } from "@/components/ui/loading-fallback";
import { FormSection } from "@/components/ui/form-section";
import { FormFieldGroup } from "@/components/ui/form-field-group";
import { SimpleLogoUpload } from "./SimpleLogoUpload";
import { useUploadFile, useGetFileUrl } from "@/hooks/useFileStorage";
import { useHasPermission } from "@/hooks/usePermissions";

export const BusinessSettingsTab = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  const createBusinessSettings = useCreateBusinessSettings();
  const updateBusinessSettings = useUpdateBusinessSettings();
  const { toast } = useToast();
  
  // Separate editing states for each section
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingAdvanced, setIsEditingAdvanced] = useState(false);
  
  // Track which section is currently saving
  const [savingSection, setSavingSection] = useState<'company' | 'contact' | 'address' | 'advanced' | null>(null);
  
  // Separate saved successfully states for each section
  const [companySavedSuccessfully, setCompanySavedSuccessfully] = useState(false);
  const [contactSavedSuccessfully, setContactSavedSuccessfully] = useState(false);
  const [addressSavedSuccessfully, setAddressSavedSuccessfully] = useState(false);
  const [advancedSavedSuccessfully, setAdvancedSavedSuccessfully] = useState(false);
  
  const [showSimpleLogoUpload, setShowSimpleLogoUpload] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const uploadFile = useUploadFile();
  const getFileUrl = useGetFileUrl();

  const isAdmin = useHasPermission('manage_settings');

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
    company_logo_url: "",
    allow_in_app_template_editing: false
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
        company_logo_url: businessSettings.company_logo_url || "",
        allow_in_app_template_editing: businessSettings.allow_in_app_template_editing || false
      });
    }
  }, [businessSettings]);

  const handleInputChange = (field: string, value: string | boolean) => {
    // Reset all saved states when making changes
    setCompanySavedSuccessfully(false);
    setContactSavedSuccessfully(false);
    setAddressSavedSuccessfully(false);
    setAdvancedSavedSuccessfully(false);
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setLogoFile(file);
      
      console.log('Starting logo upload...', file.name);
      
      // Upload the logo file
      const uploadResult = await uploadFile.mutateAsync({
        file: file,
        projectId: 'business-logos',
        bucketName: 'business-assets'
      });
      
      console.log('Upload result:', uploadResult);
      
      // Get the file URL
      const fileUrlResult = await getFileUrl.mutateAsync({
        bucketName: 'business-assets',
        filePath: uploadResult.fileName
      });
      
      console.log('Generated URL:', fileUrlResult);
      
      // Update the form data with the new logo URL
      setFormData(prev => ({
        ...prev,
        company_logo_url: fileUrlResult
      }));
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error('Logo upload failed:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    }
  };

  const handleSaveSection = async (sectionName: 'company' | 'contact' | 'address' | 'advanced') => {
    setSavingSection(sectionName);
    try {
      let savedData;
      if (businessSettings?.id) {
        savedData = await updateBusinessSettings.mutateAsync({
          id: businessSettings.id,
          ...formData
        });
      } else {
        savedData = await createBusinessSettings.mutateAsync(formData);
      }
      
      // Update form data with the saved data to ensure all fields show the correct values
      if (savedData) {
        setFormData({
          company_name: savedData.company_name || "",
          abn: savedData.abn || "",
          business_email: savedData.business_email || "",
          business_phone: savedData.business_phone || "",
          address: savedData.address || "",
          city: savedData.city || "",
          state: savedData.state || "",
          zip_code: savedData.zip_code || "",
          country: savedData.country || "Australia",
          website: savedData.website || "",
          company_logo_url: savedData.company_logo_url || "",
          allow_in_app_template_editing: savedData.allow_in_app_template_editing || false
        });
      }
      
      // Set the appropriate saved state and editing state
      switch (sectionName) {
        case 'company':
          setCompanySavedSuccessfully(true);
          setIsEditingCompany(false);
          setTimeout(() => setCompanySavedSuccessfully(false), 3000);
          break;
        case 'contact':
          setContactSavedSuccessfully(true);
          setIsEditingContact(false);
          setTimeout(() => setContactSavedSuccessfully(false), 3000);
          break;
        case 'address':
          setAddressSavedSuccessfully(true);
          setIsEditingAddress(false);
          setTimeout(() => setAddressSavedSuccessfully(false), 3000);
          break;
        case 'advanced':
          setAdvancedSavedSuccessfully(true);
          setIsEditingAdvanced(false);
          setTimeout(() => setAdvancedSavedSuccessfully(false), 3000);
          break;
      }
      
      toast({
        title: "Success",
        description: "Business settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save business settings",
        variant: "destructive",
      });
    } finally {
      setSavingSection(null);
    }
  };

  const handleEditSection = (sectionName: 'company' | 'contact' | 'address' | 'advanced') => {
    switch (sectionName) {
      case 'company':
        setIsEditingCompany(true);
        setCompanySavedSuccessfully(false);
        break;
      case 'contact':
        setIsEditingContact(true);
        setContactSavedSuccessfully(false);
        break;
      case 'address':
        setIsEditingAddress(true);
        setAddressSavedSuccessfully(false);
        break;
      case 'advanced':
        setIsEditingAdvanced(true);
        setAdvancedSavedSuccessfully(false);
        break;
    }
  };

  const handleCancelSection = (sectionName: 'company' | 'contact' | 'address' | 'advanced') => {
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
        company_logo_url: businessSettings.company_logo_url || "",
        allow_in_app_template_editing: businessSettings.allow_in_app_template_editing || false
      });
    }
    
    // Set the appropriate editing state to false
    switch (sectionName) {
      case 'company':
        setIsEditingCompany(false);
        break;
      case 'contact':
        setIsEditingContact(false);
        break;
      case 'address':
        setIsEditingAddress(false);
        break;
      case 'advanced':
        setIsEditingAdvanced(false);
        break;
    }
  };

  if (isLoading) {
    return <LoadingFallback title="Loading business settings..." rows={4} />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Company Information */}
      <FormSection
        key="company-section"
        title="Company Information"
        description="Manage your business details and company profile"
        icon={<Building2 className="h-5 w-5" />}
        isEditing={isEditingCompany}
        onEdit={() => handleEditSection('company')}
        onSave={() => handleSaveSection('company')}
        onCancel={() => handleCancelSection('company')}
        isSaving={savingSection === 'company'}
        savedSuccessfully={companySavedSuccessfully}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label="Company Name" required>
            <Input
              value={formData.company_name}
              onChange={(e) => handleInputChange("company_name", e.target.value)}
              placeholder="Enter company name"
              disabled={!isEditingCompany}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="ABN / Tax ID">
            <Input
              value={formData.abn}
              onChange={(e) => handleInputChange("abn", e.target.value)}
              placeholder="Enter ABN or Tax ID"
              disabled={!isEditingCompany}
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
            disabled={!isEditingCompany}
          />
        </FormFieldGroup>

        <FormFieldGroup 
          label="Company Logo" 
          description="Upload your company logo (will be used in documents and quotes)"
        >
          <div className="space-y-3">
            {formData.company_logo_url ? (
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 flex-1">
                  <Image className="h-5 w-5 text-muted-foreground" />
                  <img 
                    src={formData.company_logo_url} 
                    alt="Company Logo Preview" 
                    className="h-12 w-auto max-w-32 object-contain border rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                    onLoad={(e) => {
                      e.currentTarget.nextElementSibling?.classList.add('hidden');
                    }}
                  />
                  <div className="hidden text-sm text-destructive">Failed to load image</div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Logo uploaded</span>
                    <span className="text-xs text-muted-foreground">Ready for use in documents</span>
                  </div>
                </div>
                {isEditingCompany && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange("company_logo_url", "")}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 border border-dashed border-muted-foreground/25 rounded-lg bg-muted/25">
                <Image className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No logo uploaded</span>
              </div>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSimpleLogoUpload(true)}
              disabled={!isEditingCompany || uploadFile.isPending}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadFile.isPending ? 'Uploading...' : (formData.company_logo_url ? 'Change Logo' : 'Upload Logo')}
            </Button>
          </div>
        </FormFieldGroup>
      </FormSection>

      {/* Contact Information */}
      <FormSection
        key="contact-section"
        title="Contact Information"
        description="Business contact details for customer communication"
        icon={<Mail className="h-5 w-5" />}
        isEditing={isEditingContact}
        onEdit={() => handleEditSection('contact')}
        onSave={() => handleSaveSection('contact')}
        onCancel={() => handleCancelSection('contact')}
        isSaving={savingSection === 'contact'}
        savedSuccessfully={contactSavedSuccessfully}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label="Business Email">
            <Input
              type="email"
              value={formData.business_email}
              onChange={(e) => handleInputChange("business_email", e.target.value)}
              placeholder="business@example.com"
              disabled={!isEditingContact}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="Business Phone">
            <Input
              value={formData.business_phone}
              onChange={(e) => handleInputChange("business_phone", e.target.value)}
              placeholder="+61 2 1234 5678"
              disabled={!isEditingContact}
            />
          </FormFieldGroup>
        </div>
      </FormSection>

      {/* Business Address */}
      <FormSection
        key="address-section"
        title="Business Address"
        description="Your business location and address details"
        icon={<MapPin className="h-5 w-5" />}
        isEditing={isEditingAddress}
        onEdit={() => handleEditSection('address')}
        onSave={() => handleSaveSection('address')}
        onCancel={() => handleCancelSection('address')}
        isSaving={savingSection === 'address'}
        savedSuccessfully={addressSavedSuccessfully}
      >
        <FormFieldGroup label="Street Address">
          <Textarea
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Enter street address"
            rows={2}
            disabled={!isEditingAddress}
          />
        </FormFieldGroup>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormFieldGroup label="City">
            <Input
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Enter city"
              disabled={!isEditingAddress}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="State / Province">
            <Input
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="Enter state"
              disabled={!isEditingAddress}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="Zip / Postal Code">
            <Input
              value={formData.zip_code}
              onChange={(e) => handleInputChange("zip_code", e.target.value)}
              placeholder="Enter zip code"
              disabled={!isEditingAddress}
            />
          </FormFieldGroup>
        </div>

        <FormFieldGroup label="Country">
          <Input
            value={formData.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            placeholder="Enter country"
            disabled={!isEditingAddress}
          />
        </FormFieldGroup>
      </FormSection>

      {/* Advanced Settings - Admin Only */}
      {isAdmin && (
        <FormSection
          key="advanced-section"
          title="Advanced Settings"
          description="Admin-only settings for controlling app features"
          icon={<Shield className="h-5 w-5" />}
          isEditing={isEditingAdvanced}
          onEdit={() => handleEditSection('advanced')}
          onSave={() => handleSaveSection('advanced')}
          onCancel={() => handleCancelSection('advanced')}
          isSaving={savingSection === 'advanced'}
          savedSuccessfully={advancedSavedSuccessfully}
        >
          <FormFieldGroup 
            label="Allow In-App Template Editing"
            description="When enabled, staff can edit quotations and documents directly in the app and save them as templates. This feature is only available to admins."
          >
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Edit3 className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    {formData.allow_in_app_template_editing ? "Enabled" : "Disabled"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formData.allow_in_app_template_editing 
                      ? "Admins can edit templates in quote/document views" 
                      : "Template editing restricted to Settings page only"
                    }
                  </span>
                </div>
              </div>
              <Switch
                checked={formData.allow_in_app_template_editing}
                onCheckedChange={(checked) => handleInputChange("allow_in_app_template_editing", checked)}
                disabled={!isEditingAdvanced}
              />
            </div>
          </FormFieldGroup>
        </FormSection>
      )}

      <SimpleLogoUpload
        open={showSimpleLogoUpload}
        onOpenChange={setShowSimpleLogoUpload}
        onUploadComplete={handleLogoUpload}
      />
    </div>
  );
};
