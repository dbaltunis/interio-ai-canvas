
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessSettings, useCreateBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Phone, MapPin, Globe, Upload, Image } from "lucide-react";
import { LoadingFallback } from "@/components/ui/loading-fallback";
import { FormSection } from "@/components/ui/form-section";
import { FormFieldGroup } from "@/components/ui/form-field-group";
import { SimpleLogoUpload } from "./SimpleLogoUpload";
import { useUploadFile, useGetFileUrl } from "@/hooks/useFileStorage";

export const BusinessSettingsTab = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  const createBusinessSettings = useCreateBusinessSettings();
  const updateBusinessSettings = useUpdateBusinessSettings();
  const { toast } = useToast();
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSimpleLogoUpload, setShowSimpleLogoUpload] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const uploadFile = useUploadFile();
  const getFileUrl = useGetFileUrl();

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

  const handleLogoUpload = async (file: File) => {
    try {
      setLogoFile(file);
      
      // Upload the logo file
      const uploadResult = await uploadFile.mutateAsync({
        file: file,
        projectId: 'business-logos',
        bucketName: 'business-assets'
      });
      
      // Get the file URL
      const fileUrlResult = await getFileUrl.mutateAsync({
        bucketName: 'business-assets',
        filePath: uploadResult.fileName
      });
      
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
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
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
          company_logo_url: savedData.company_logo_url || ""
        });
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
          label="Company Logo" 
          description="Upload your company logo (will be cropped to fit standards)"
        >
          <div className="space-y-3">
            {formData.company_logo_url && (
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50">
                <Image className="h-5 w-5 text-muted-foreground" />
                <img 
                  src={formData.company_logo_url} 
                  alt="Company Logo Preview" 
                  className="h-8 w-auto object-contain"
                />
                <span className="text-sm text-muted-foreground">Current logo</span>
              </div>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSimpleLogoUpload(true)}
              disabled={!isEditing}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {formData.company_logo_url ? 'Change Logo' : 'Upload Logo'}
            </Button>
          </div>
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

      <SimpleLogoUpload
        open={showSimpleLogoUpload}
        onOpenChange={setShowSimpleLogoUpload}
        onUploadComplete={handleLogoUpload}
      />
    </div>
  );
};
