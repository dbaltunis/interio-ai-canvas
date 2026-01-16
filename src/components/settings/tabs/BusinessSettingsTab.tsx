import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useBusinessSettings, useCreateBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Phone, MapPin, Globe, Upload, Image, Edit3, Shield, FileText, CreditCard, Landmark, Info, AlertCircle } from "lucide-react";
import { LoadingFallback } from "@/components/ui/loading-fallback";
import { FormSection } from "@/components/ui/form-section";
import { FormFieldGroup } from "@/components/ui/form-field-group";
import { SimpleLogoUpload } from "./SimpleLogoUpload";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";
import { useUploadFile, useGetFileUrl } from "@/hooks/useFileStorage";
import { useHasPermission } from "@/hooks/usePermissions";
import { getRegistrationLabels, ORGANIZATION_TYPES, PAYMENT_TERMS_OPTIONS, COUNTRIES } from "@/utils/businessRegistrationLabels";

export const BusinessSettingsTab = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  const createBusinessSettings = useCreateBusinessSettings();
  const updateBusinessSettings = useUpdateBusinessSettings();
  const { toast } = useToast();
  
  // Separate editing states for each section
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingRegistration, setIsEditingRegistration] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingFinancial, setIsEditingFinancial] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [isEditingAdvanced, setIsEditingAdvanced] = useState(false);
  
  // Track which section is currently saving
  const [savingSection, setSavingSection] = useState<'company' | 'registration' | 'contact' | 'address' | 'financial' | 'payment' | 'invoice' | 'advanced' | null>(null);
  
  // Separate saved successfully states for each section
  const [companySavedSuccessfully, setCompanySavedSuccessfully] = useState(false);
  const [registrationSavedSuccessfully, setRegistrationSavedSuccessfully] = useState(false);
  const [contactSavedSuccessfully, setContactSavedSuccessfully] = useState(false);
  const [addressSavedSuccessfully, setAddressSavedSuccessfully] = useState(false);
  const [financialSavedSuccessfully, setFinancialSavedSuccessfully] = useState(false);
  const [paymentSavedSuccessfully, setPaymentSavedSuccessfully] = useState(false);
  const [invoiceSavedSuccessfully, setInvoiceSavedSuccessfully] = useState(false);
  const [advancedSavedSuccessfully, setAdvancedSavedSuccessfully] = useState(false);
  
  const [showSimpleLogoUpload, setShowSimpleLogoUpload] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const uploadFile = useUploadFile();
  const getFileUrl = useGetFileUrl();

  const isAdmin = useHasPermission('manage_settings');

  const [formData, setFormData] = useState({
    company_name: "",
    legal_name: "",
    trading_name: "",
    organization_type: "",
    abn: "",
    registration_number: "",
    tax_number: "",
    business_email: "",
    business_phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "Australia",
    website: "",
    company_logo_url: "",
    default_payment_terms_days: 14,
    financial_year_end_month: 6,
    financial_year_end_day: 30,
    // Bank details
    bank_name: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_bsb: "",
    bank_sort_code: "",
    bank_routing_number: "",
    bank_iban: "",
    bank_swift_bic: "",
    // Invoice settings
    payment_reference_prefix: "INV",
    late_payment_interest_rate: 0,
    late_payment_fee_amount: 0,
    late_payment_terms: "",
    allow_in_app_template_editing: false
  });

  // Get dynamic labels based on selected country
  const registrationLabels = useMemo(() => 
    getRegistrationLabels(formData.country), 
    [formData.country]
  );

  useEffect(() => {
    if (businessSettings) {
      setFormData({
        company_name: businessSettings.company_name || "",
        legal_name: businessSettings.legal_name || "",
        trading_name: businessSettings.trading_name || "",
        organization_type: businessSettings.organization_type || "",
        abn: businessSettings.abn || "",
        registration_number: businessSettings.registration_number || "",
        tax_number: businessSettings.tax_number || "",
        business_email: businessSettings.business_email || "",
        business_phone: businessSettings.business_phone || "",
        address: businessSettings.address || "",
        city: businessSettings.city || "",
        state: businessSettings.state || "",
        zip_code: businessSettings.zip_code || "",
        country: businessSettings.country || "Australia",
        website: businessSettings.website || "",
        company_logo_url: businessSettings.company_logo_url || "",
        default_payment_terms_days: businessSettings.default_payment_terms_days ?? 14,
        financial_year_end_month: businessSettings.financial_year_end_month ?? 6,
        financial_year_end_day: businessSettings.financial_year_end_day ?? 30,
        bank_name: businessSettings.bank_name || "",
        bank_account_name: businessSettings.bank_account_name || "",
        bank_account_number: businessSettings.bank_account_number || "",
        bank_bsb: businessSettings.bank_bsb || "",
        bank_sort_code: businessSettings.bank_sort_code || "",
        bank_routing_number: businessSettings.bank_routing_number || "",
        bank_iban: businessSettings.bank_iban || "",
        bank_swift_bic: businessSettings.bank_swift_bic || "",
        payment_reference_prefix: (businessSettings as any).payment_reference_prefix || "INV",
        late_payment_interest_rate: (businessSettings as any).late_payment_interest_rate ?? 0,
        late_payment_fee_amount: (businessSettings as any).late_payment_fee_amount ?? 0,
        late_payment_terms: (businessSettings as any).late_payment_terms || "",
        allow_in_app_template_editing: businessSettings.allow_in_app_template_editing || false
      });
    }
  }, [businessSettings]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    // Reset all saved states when making changes
    setCompanySavedSuccessfully(false);
    setRegistrationSavedSuccessfully(false);
    setContactSavedSuccessfully(false);
    setAddressSavedSuccessfully(false);
    setFinancialSavedSuccessfully(false);
    setPaymentSavedSuccessfully(false);
    setInvoiceSavedSuccessfully(false);
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

  const handleSaveSection = async (sectionName: 'company' | 'registration' | 'contact' | 'address' | 'financial' | 'payment' | 'invoice' | 'advanced') => {
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
          legal_name: savedData.legal_name || "",
          trading_name: savedData.trading_name || "",
          organization_type: savedData.organization_type || "",
          abn: savedData.abn || "",
          registration_number: savedData.registration_number || "",
          tax_number: savedData.tax_number || "",
          business_email: savedData.business_email || "",
          business_phone: savedData.business_phone || "",
          address: savedData.address || "",
          city: savedData.city || "",
          state: savedData.state || "",
          zip_code: savedData.zip_code || "",
          country: savedData.country || "Australia",
          website: savedData.website || "",
          company_logo_url: savedData.company_logo_url || "",
          default_payment_terms_days: savedData.default_payment_terms_days ?? 14,
          financial_year_end_month: savedData.financial_year_end_month ?? 6,
          financial_year_end_day: savedData.financial_year_end_day ?? 30,
          bank_name: savedData.bank_name || "",
          bank_account_name: savedData.bank_account_name || "",
          bank_account_number: savedData.bank_account_number || "",
          bank_bsb: savedData.bank_bsb || "",
          bank_sort_code: savedData.bank_sort_code || "",
          bank_routing_number: savedData.bank_routing_number || "",
          bank_iban: savedData.bank_iban || "",
          bank_swift_bic: savedData.bank_swift_bic || "",
          payment_reference_prefix: (savedData as any).payment_reference_prefix || "INV",
          late_payment_interest_rate: (savedData as any).late_payment_interest_rate ?? 0,
          late_payment_fee_amount: (savedData as any).late_payment_fee_amount ?? 0,
          late_payment_terms: (savedData as any).late_payment_terms || "",
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
        case 'registration':
          setRegistrationSavedSuccessfully(true);
          setIsEditingRegistration(false);
          setTimeout(() => setRegistrationSavedSuccessfully(false), 3000);
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
        case 'financial':
          setFinancialSavedSuccessfully(true);
          setIsEditingFinancial(false);
          setTimeout(() => setFinancialSavedSuccessfully(false), 3000);
          break;
        case 'payment':
          setPaymentSavedSuccessfully(true);
          setIsEditingPayment(false);
          setTimeout(() => setPaymentSavedSuccessfully(false), 3000);
          break;
        case 'invoice':
          setInvoiceSavedSuccessfully(true);
          setIsEditingInvoice(false);
          setTimeout(() => setInvoiceSavedSuccessfully(false), 3000);
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

  const handleEditSection = (sectionName: 'company' | 'registration' | 'contact' | 'address' | 'financial' | 'payment' | 'invoice' | 'advanced') => {
    console.log('🔥 handleEditSection called with:', sectionName);
    console.log('🔥 Current editing states BEFORE:', {
      isEditingCompany,
      isEditingRegistration,
      isEditingContact,
      isEditingAddress,
      isEditingFinancial,
      isEditingPayment,
      isEditingAdvanced
    });
    
    switch (sectionName) {
      case 'company':
        setIsEditingCompany(true);
        setCompanySavedSuccessfully(false);
        break;
      case 'registration':
        setIsEditingRegistration(true);
        setRegistrationSavedSuccessfully(false);
        break;
      case 'contact':
        setIsEditingContact(true);
        setContactSavedSuccessfully(false);
        break;
      case 'address':
        setIsEditingAddress(true);
        setAddressSavedSuccessfully(false);
        break;
      case 'financial':
        setIsEditingFinancial(true);
        setFinancialSavedSuccessfully(false);
        break;
      case 'payment':
        setIsEditingPayment(true);
        setPaymentSavedSuccessfully(false);
        break;
      case 'invoice':
        setIsEditingInvoice(true);
        setInvoiceSavedSuccessfully(false);
        break;
      case 'advanced':
        setIsEditingAdvanced(true);
        setAdvancedSavedSuccessfully(false);
        break;
    }
    
    console.log('🔥 handleEditSection completed for:', sectionName);
  };

  const handleCancelSection = (sectionName: 'company' | 'registration' | 'contact' | 'address' | 'financial' | 'payment' | 'invoice' | 'advanced') => {
    // Reset form data to original values
    if (businessSettings) {
      setFormData({
        company_name: businessSettings.company_name || "",
        legal_name: businessSettings.legal_name || "",
        trading_name: businessSettings.trading_name || "",
        organization_type: businessSettings.organization_type || "",
        abn: businessSettings.abn || "",
        registration_number: businessSettings.registration_number || "",
        tax_number: businessSettings.tax_number || "",
        business_email: businessSettings.business_email || "",
        business_phone: businessSettings.business_phone || "",
        address: businessSettings.address || "",
        city: businessSettings.city || "",
        state: businessSettings.state || "",
        zip_code: businessSettings.zip_code || "",
        country: businessSettings.country || "Australia",
        website: businessSettings.website || "",
        company_logo_url: businessSettings.company_logo_url || "",
        default_payment_terms_days: businessSettings.default_payment_terms_days ?? 14,
        financial_year_end_month: businessSettings.financial_year_end_month ?? 6,
        financial_year_end_day: businessSettings.financial_year_end_day ?? 30,
        bank_name: businessSettings.bank_name || "",
        bank_account_name: businessSettings.bank_account_name || "",
        bank_account_number: businessSettings.bank_account_number || "",
        bank_bsb: businessSettings.bank_bsb || "",
        bank_sort_code: businessSettings.bank_sort_code || "",
        bank_routing_number: businessSettings.bank_routing_number || "",
        bank_iban: businessSettings.bank_iban || "",
        bank_swift_bic: businessSettings.bank_swift_bic || "",
        payment_reference_prefix: (businessSettings as any).payment_reference_prefix || "INV",
        late_payment_interest_rate: (businessSettings as any).late_payment_interest_rate ?? 0,
        late_payment_fee_amount: (businessSettings as any).late_payment_fee_amount ?? 0,
        late_payment_terms: (businessSettings as any).late_payment_terms || "",
        allow_in_app_template_editing: businessSettings.allow_in_app_template_editing || false
      });
    }
    
    // Set the appropriate editing state to false
    switch (sectionName) {
      case 'company':
        setIsEditingCompany(false);
        break;
      case 'registration':
        setIsEditingRegistration(false);
        break;
      case 'contact':
        setIsEditingContact(false);
        break;
      case 'address':
        setIsEditingAddress(false);
        break;
      case 'financial':
        setIsEditingFinancial(false);
        break;
      case 'payment':
        setIsEditingPayment(false);
        break;
      case 'invoice':
        setIsEditingInvoice(false);
        break;
      case 'advanced':
        setIsEditingAdvanced(false);
        break;
    }
  };

  if (isLoading) {
    return <LoadingFallback title="Loading business settings..." rows={4} />;
  }

  console.log('🔥 Rendering BusinessSettingsTab with editing states:', {
    isEditingCompany,
    isEditingRegistration,
    isEditingContact,
    isEditingAddress,
    isEditingFinancial,
    isEditingAdvanced
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header with Help */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Business Settings</h3>
          <p className="text-sm text-muted-foreground">Configure your company details and branding</p>
        </div>
        <SectionHelpButton sectionId="business" />
      </div>

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
          <FormFieldGroup label="Company Name (Trading Name)" required>
            <Input
              value={formData.company_name}
              onChange={(e) => handleInputChange("company_name", e.target.value)}
              placeholder="Enter trading/display name"
              disabled={!isEditingCompany}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="Legal Name" description="Official registered entity name (if different)">
            <Input
              value={formData.legal_name}
              onChange={(e) => handleInputChange("legal_name", e.target.value)}
              placeholder="Enter legal entity name"
              disabled={!isEditingCompany}
            />
          </FormFieldGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label="Organization Type">
            <Select
              value={formData.organization_type}
              onValueChange={(value) => handleInputChange("organization_type", value)}
              disabled={!isEditingCompany}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                {ORGANIZATION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldGroup>
          
          <FormFieldGroup label="Website">
            <Input
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://www.example.com"
              disabled={!isEditingCompany}
            />
          </FormFieldGroup>
        </div>

        <FormFieldGroup label="Company Logo">
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

      {/* Registration Numbers - Dynamic based on country */}
      <FormSection
        key="registration-section"
        title="Registration Numbers"
        description="Business registration and tax identification numbers for invoices"
        icon={<FileText className="h-5 w-5" />}
        isEditing={isEditingRegistration}
        onEdit={() => handleEditSection('registration')}
        onSave={() => handleSaveSection('registration')}
        onCancel={() => handleCancelSection('registration')}
        isSaving={savingSection === 'registration'}
        savedSuccessfully={registrationSavedSuccessfully}
      >
        {/* Legal Requirements Alert */}
        {registrationLabels.legalRequirements.length > 0 && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm">
                <strong>Invoice Requirements:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {registrationLabels.legalRequirements.map((req, idx) => (
                    <li key={idx} className="text-muted-foreground">{req}</li>
                  ))}
                </ul>
                {registrationLabels.countrySpecificNotes && registrationLabels.countrySpecificNotes.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-border/50">
                    <strong className="text-muted-foreground">Notes for {formData.country}:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {registrationLabels.countrySpecificNotes.map((note, idx) => (
                        <li key={idx} className="text-muted-foreground">{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrationLabels.abn && (
              <FormFieldGroup 
                label={
                  <div className="flex items-center gap-1.5">
                    {registrationLabels.abn}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{registrationLabels.abnHelpText}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                }
              >
                <Input
                  value={formData.abn}
                  onChange={(e) => handleInputChange("abn", e.target.value)}
                  placeholder={registrationLabels.abnPlaceholder || ''}
                  disabled={!isEditingRegistration}
                />
              </FormFieldGroup>
            )}
            
            <FormFieldGroup 
              label={
                <div className="flex items-center gap-1.5">
                  {registrationLabels.registration}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{registrationLabels.registrationHelpText}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              }
            >
              <Input
                value={formData.registration_number}
                onChange={(e) => handleInputChange("registration_number", e.target.value)}
                placeholder={registrationLabels.registrationPlaceholder}
                disabled={!isEditingRegistration}
              />
            </FormFieldGroup>
            
            <FormFieldGroup 
              label={
                <div className="flex items-center gap-1.5">
                  {registrationLabels.taxNumber}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{registrationLabels.taxNumberHelpText}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              }
            >
              <Input
                value={formData.tax_number}
                onChange={(e) => handleInputChange("tax_number", e.target.value)}
                placeholder={registrationLabels.taxNumberPlaceholder}
                disabled={!isEditingRegistration}
              />
            </FormFieldGroup>
          </div>
        </TooltipProvider>
        
        <p className="text-xs text-muted-foreground mt-4">
          These numbers will appear on your invoices and quotes. Labels and requirements update automatically based on your selected country.
        </p>
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
          <Select
            value={formData.country}
            onValueChange={(value) => handleInputChange("country", value)}
            disabled={!isEditingAddress}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldGroup>
      </FormSection>

      {/* Financial Settings */}
      <FormSection
        key="financial-section"
        title="Financial Settings"
        description="Default payment terms and financial year settings"
        icon={<CreditCard className="h-5 w-5" />}
        isEditing={isEditingFinancial}
        onEdit={() => handleEditSection('financial')}
        onSave={() => handleSaveSection('financial')}
        onCancel={() => handleCancelSection('financial')}
        isSaving={savingSection === 'financial'}
        savedSuccessfully={financialSavedSuccessfully}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label="Default Payment Terms">
            <Select
              value={String(formData.default_payment_terms_days)}
              onValueChange={(value) => handleInputChange("default_payment_terms_days", parseInt(value))}
              disabled={!isEditingFinancial}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldGroup>

          <FormFieldGroup label="Financial Year End">
            <div className="flex gap-2">
              <Select
                value={String(formData.financial_year_end_month)}
                onValueChange={(value) => handleInputChange("financial_year_end_month", parseInt(value))}
                disabled={!isEditingFinancial}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: 1, label: 'January' },
                    { value: 2, label: 'February' },
                    { value: 3, label: 'March' },
                    { value: 4, label: 'April' },
                    { value: 5, label: 'May' },
                    { value: 6, label: 'June' },
                    { value: 7, label: 'July' },
                    { value: 8, label: 'August' },
                    { value: 9, label: 'September' },
                    { value: 10, label: 'October' },
                    { value: 11, label: 'November' },
                    { value: 12, label: 'December' }
                  ].map(month => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                max={31}
                value={formData.financial_year_end_day}
                onChange={(e) => handleInputChange("financial_year_end_day", parseInt(e.target.value) || 30)}
                disabled={!isEditingFinancial}
                className="w-20"
              />
            </div>
          </FormFieldGroup>
        </div>
      </FormSection>

      {/* Payment Details - Bank Account Information */}
      <FormSection
        key="payment-section"
        title="Payment Details"
        description="Bank account details for payment instructions on invoices"
        icon={<Landmark className="h-5 w-5" />}
        isEditing={isEditingPayment}
        onEdit={() => handleEditSection('payment')}
        onSave={() => handleSaveSection('payment')}
        onCancel={() => handleCancelSection('payment')}
        isSaving={savingSection === 'payment'}
        savedSuccessfully={paymentSavedSuccessfully}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label="Bank Name">
            <Input
              value={formData.bank_name}
              onChange={(e) => handleInputChange("bank_name", e.target.value)}
              placeholder="Enter bank name"
              disabled={!isEditingPayment}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="Account Name">
            <Input
              value={formData.bank_account_name}
              onChange={(e) => handleInputChange("bank_account_name", e.target.value)}
              placeholder="Name on bank account"
              disabled={!isEditingPayment}
            />
          </FormFieldGroup>
        </div>

        {/* Country-specific bank fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label={registrationLabels.bankFields.primary}>
            <Input
              value={
                formData.country === 'Australia' ? formData.bank_bsb :
                formData.country === 'United Kingdom' ? formData.bank_sort_code :
                formData.country === 'United States' || formData.country === 'Canada' ? formData.bank_routing_number :
                formData.bank_iban
              }
              onChange={(e) => {
                const field = 
                  formData.country === 'Australia' ? 'bank_bsb' :
                  formData.country === 'United Kingdom' ? 'bank_sort_code' :
                  formData.country === 'United States' || formData.country === 'Canada' ? 'bank_routing_number' :
                  'bank_iban';
                handleInputChange(field, e.target.value);
              }}
              placeholder={registrationLabels.bankFields.primaryPlaceholder}
              disabled={!isEditingPayment}
            />
          </FormFieldGroup>
          
          {registrationLabels.bankFields.secondary && (
            <FormFieldGroup label={registrationLabels.bankFields.secondary}>
              <Input
                value={
                  formData.country === 'Australia' || formData.country === 'United Kingdom' || 
                  formData.country === 'United States' || formData.country === 'Canada' || 
                  formData.country === 'South Africa' || formData.country === 'India' || 
                  formData.country === 'Singapore' || formData.country === 'Hong Kong' || 
                  formData.country === 'New Zealand'
                    ? formData.bank_account_number 
                    : formData.bank_swift_bic
                }
                onChange={(e) => {
                  const field = 
                    formData.country === 'Australia' || formData.country === 'United Kingdom' || 
                    formData.country === 'United States' || formData.country === 'Canada' || 
                    formData.country === 'South Africa' || formData.country === 'India' || 
                    formData.country === 'Singapore' || formData.country === 'Hong Kong' || 
                    formData.country === 'New Zealand'
                      ? 'bank_account_number' 
                      : 'bank_swift_bic';
                  handleInputChange(field, e.target.value);
                }}
                placeholder={registrationLabels.bankFields.secondaryPlaceholder}
                disabled={!isEditingPayment}
              />
            </FormFieldGroup>
          )}
        </div>

        {/* SWIFT/BIC for international transfers (EU countries) */}
        {['Germany', 'France', 'Italy', 'Spain', 'Netherlands'].includes(formData.country) && (
          <p className="text-xs text-muted-foreground mt-2">
            IBAN and BIC/SWIFT codes are used for SEPA and international transfers in the EU.
          </p>
        )}
        
        <p className="text-xs text-muted-foreground mt-4">
          Bank details can be displayed on invoices for direct deposit payments. Fields adapt to your country's banking format.
        </p>
      </FormSection>

      {/* Invoice Settings */}
      <FormSection
        key="invoice-section"
        title="Invoice Settings"
        description="Late payment policies and invoice preferences"
        icon={<FileText className="h-5 w-5" />}
        isEditing={isEditingInvoice}
        onEdit={() => handleEditSection('invoice')}
        onSave={() => handleSaveSection('invoice')}
        onCancel={() => handleCancelSection('invoice')}
        isSaving={savingSection === 'invoice'}
        savedSuccessfully={invoiceSavedSuccessfully}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup 
            label="Payment Reference Prefix" 
            description="Prefix for auto-generated payment references (e.g., INV-001)"
          >
            <Input
              value={formData.payment_reference_prefix}
              onChange={(e) => handleInputChange("payment_reference_prefix", e.target.value)}
              placeholder="INV"
              disabled={!isEditingInvoice}
            />
          </FormFieldGroup>

          <FormFieldGroup 
            label="Late Payment Interest Rate (%)" 
            description="Monthly interest rate charged on overdue invoices"
          >
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.late_payment_interest_rate}
              onChange={(e) => handleInputChange("late_payment_interest_rate", parseFloat(e.target.value) || 0)}
              placeholder="0"
              disabled={!isEditingInvoice}
            />
          </FormFieldGroup>
        </div>

        <FormFieldGroup 
          label="Late Payment Fee" 
          description="Fixed fee charged for late payments (in your local currency)"
        >
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.late_payment_fee_amount}
            onChange={(e) => handleInputChange("late_payment_fee_amount", parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            disabled={!isEditingInvoice}
          />
        </FormFieldGroup>

        <FormFieldGroup 
          label="Late Payment Terms" 
          description="Custom late payment policy text that appears on invoices"
        >
          <Textarea
            value={formData.late_payment_terms}
            onChange={(e) => handleInputChange("late_payment_terms", e.target.value)}
            placeholder="E.g., Payment is due within 30 days. Overdue amounts may incur interest charges."
            rows={3}
            disabled={!isEditingInvoice}
          />
        </FormFieldGroup>

        <p className="text-xs text-muted-foreground mt-2">
          These settings control how late payment policies are displayed on your invoices, helping you maintain consistent billing practices.
        </p>
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
