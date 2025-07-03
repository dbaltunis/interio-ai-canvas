import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Building, Mail, Phone, MapPin, Clock, Percent, Upload, X } from "lucide-react";
import { useBusinessSettings, useCreateBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUploadFile } from "@/hooks/useFileStorage";

export const BusinessConfigTab = () => {
  const { data: settings, isLoading } = useBusinessSettings();
  const createSettings = useCreateBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
  const uploadFile = useUploadFile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    abn: "",
    business_email: "",
    business_phone: "",
    business_address: "",
    company_logo_url: "",
    default_tax_rate: 10.00,
    default_markup: 40.00,
    labor_rate: 85.00,
    quote_validity_days: 30,
    installation_lead_days: 14,
    opening_time: "09:00",
    closing_time: "17:00",
    auto_generate_work_orders: true,
    auto_calculate_fabric: true,
    email_quote_notifications: false,
    low_stock_alerts: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || "",
        abn: settings.abn || "",
        business_email: settings.business_email || "",
        business_phone: settings.business_phone || "",
        business_address: settings.business_address || "",
        company_logo_url: settings.company_logo_url || "",
        default_tax_rate: Number(settings.default_tax_rate) || 10.00,
        default_markup: Number(settings.default_markup) || 40.00,
        labor_rate: Number(settings.labor_rate) || 85.00,
        quote_validity_days: settings.quote_validity_days || 30,
        installation_lead_days: settings.installation_lead_days || 14,
        opening_time: settings.opening_time || "09:00",
        closing_time: settings.closing_time || "17:00",
        auto_generate_work_orders: settings.auto_generate_work_orders ?? true,
        auto_calculate_fabric: settings.auto_calculate_fabric ?? true,
        email_quote_notifications: settings.email_quote_notifications ?? false,
        low_stock_alerts: settings.low_stock_alerts ?? true,
      });
    }
  }, [settings]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const uploadedFile = await uploadFile.mutateAsync({
        file,
        projectId: 'company-assets', // Use a fixed project ID for company assets
        bucketName: 'project-images'
      });

      // Get the public URL for the uploaded file
      const logoUrl = `https://ldgrcofffsalkevafbkb.supabase.co/storage/v1/object/public/project-images/${uploadedFile.file_path}`;
      
      setFormData(prev => ({ ...prev, company_logo_url: logoUrl }));
      
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

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, company_logo_url: "" }));
  };

  const handleSaveCompanyDetails = async () => {
    try {
      const companyData = {
        company_name: formData.company_name,
        abn: formData.abn,
        business_email: formData.business_email,
        business_phone: formData.business_phone,
        business_address: formData.business_address,
        company_logo_url: formData.company_logo_url,
      };

      if (settings?.id) {
        await updateSettings.mutateAsync({ id: settings.id, ...companyData });
      } else {
        await createSettings.mutateAsync(companyData);
      }

      toast({
        title: "Success",
        description: "Company details saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save company details",
        variant: "destructive",
      });
    }
  };

  const handleSaveDefaultSettings = async () => {
    try {
      const defaultData = {
        default_tax_rate: formData.default_tax_rate,
        default_markup: formData.default_markup,
        labor_rate: formData.labor_rate,
        quote_validity_days: formData.quote_validity_days,
        installation_lead_days: formData.installation_lead_days,
        opening_time: formData.opening_time,
        closing_time: formData.closing_time,
      };

      if (settings?.id) {
        await updateSettings.mutateAsync({ id: settings.id, ...defaultData });
      } else {
        await createSettings.mutateAsync(defaultData);
      }

      toast({
        title: "Success",
        description: "Default settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save default settings",
        variant: "destructive",
      });
    }
  };

  const handleSaveAutomationSettings = async () => {
    try {
      const automationData = {
        auto_generate_work_orders: formData.auto_generate_work_orders,
        auto_calculate_fabric: formData.auto_calculate_fabric,
        email_quote_notifications: formData.email_quote_notifications,
        low_stock_alerts: formData.low_stock_alerts,
      };

      if (settings?.id) {
        await updateSettings.mutateAsync({ id: settings.id, ...automationData });
      } else {
        await createSettings.mutateAsync(automationData);
      }

      toast({
        title: "Success",
        description: "Automation settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save automation settings",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-brand-primary" />
            Company Information
          </CardTitle>
          <CardDescription>Basic business details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Your Company Ltd" 
              />
            </div>
            <div>
              <Label htmlFor="abn">ABN/Tax Number</Label>
              <Input 
                id="abn" 
                value={formData.abn}
                onChange={(e) => setFormData({ ...formData, abn: e.target.value })}
                placeholder="12 345 678 901" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Business Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.business_email}
                onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                placeholder="info@company.com" 
              />
            </div>
            <div>
              <Label htmlFor="phone">Business Phone</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={formData.business_phone}
                onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
                placeholder="+61 2 1234 5678" 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Business Address</Label>
            <Textarea 
              id="address" 
              value={formData.business_address}
              onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
              placeholder="123 Business St, City, State, Postcode" 
            />
          </div>

          {/* Company Logo Upload Section */}
          <div className="space-y-4">
            <Label>Company Logo</Label>
            <div className="flex items-start space-x-4">
              {formData.company_logo_url ? (
                <div className="relative">
                  <img 
                    src={formData.company_logo_url} 
                    alt="Company Logo" 
                    className="h-20 w-auto max-w-48 object-contain border border-gray-200 rounded-lg p-2 bg-white"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <span className="text-gray-400 text-sm">No logo</span>
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadFile.isPending}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>{uploadFile.isPending ? 'Uploading...' : 'Upload Logo'}</span>
                </Button>
                <p className="text-xs text-gray-500">
                  Upload your company logo for use in quotes and documents.<br />
                  Recommended size: 200x60px, Max: 2MB (PNG, JPG, SVG)
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSaveCompanyDetails}
            disabled={createSettings.isPending || updateSettings.isPending}
            className="bg-brand-primary hover:bg-brand-accent"
          >
            Save Company Details
          </Button>
        </CardContent>
      </Card>

      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-brand-primary" />
            Default Business Rules
          </CardTitle>
          <CardDescription>Set default values for calculations and quotes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="defaultTax">Default Tax Rate (%)</Label>
              <Input 
                id="defaultTax" 
                type="number" 
                step="0.01" 
                value={formData.default_tax_rate}
                onChange={(e) => setFormData({ ...formData, default_tax_rate: parseFloat(e.target.value) || 0 })}
                placeholder="10.00" 
              />
            </div>
            <div>
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input 
                id="defaultMarkup" 
                type="number" 
                step="0.01" 
                value={formData.default_markup}
                onChange={(e) => setFormData({ ...formData, default_markup: parseFloat(e.target.value) || 0 })}
                placeholder="40.00" 
              />
            </div>
            <div>
              <Label htmlFor="laborRate">Labor Rate ($/hour)</Label>
              <Input 
                id="laborRate" 
                type="number" 
                step="0.01" 
                value={formData.labor_rate}
                onChange={(e) => setFormData({ ...formData, labor_rate: parseFloat(e.target.value) || 0 })}
                placeholder="85.00" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quoteValidity">Quote Validity (days)</Label>
              <Input 
                id="quoteValidity" 
                type="number" 
                value={formData.quote_validity_days}
                onChange={(e) => setFormData({ ...formData, quote_validity_days: parseInt(e.target.value) || 0 })}
                placeholder="30" 
              />
            </div>
            <div>
              <Label htmlFor="installationLead">Installation Lead Time (days)</Label>
              <Input 
                id="installationLead" 
                type="number" 
                value={formData.installation_lead_days}
                onChange={(e) => setFormData({ ...formData, installation_lead_days: parseInt(e.target.value) || 0 })}
                placeholder="14" 
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium text-brand-primary">Business Hours</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openTime">Opening Time</Label>
                <Input 
                  id="openTime" 
                  type="time" 
                  value={formData.opening_time}
                  onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input 
                  id="closeTime" 
                  type="time" 
                  value={formData.closing_time}
                  onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSaveDefaultSettings}
            disabled={createSettings.isPending || updateSettings.isPending}
            className="bg-brand-primary hover:bg-brand-accent"
          >
            Save Default Settings
          </Button>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-primary" />
            Automation Settings
          </CardTitle>
          <CardDescription>Configure automatic processes and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-generate Work Orders</h4>
              <p className="text-sm text-brand-neutral">Automatically create work orders when quotes are accepted</p>
            </div>
            <Switch 
              checked={formData.auto_generate_work_orders}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_generate_work_orders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-calculate Fabric Requirements</h4>
              <p className="text-sm text-brand-neutral">Automatically calculate fabric quantities based on measurements</p>
            </div>
            <Switch 
              checked={formData.auto_calculate_fabric}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_calculate_fabric: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Quote Notifications</h4>
              <p className="text-sm text-brand-neutral">Send automatic emails when quotes are generated</p>
            </div>
            <Switch 
              checked={formData.email_quote_notifications}
              onCheckedChange={(checked) => setFormData({ ...formData, email_quote_notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Low Stock Alerts</h4>
              <p className="text-sm text-brand-neutral">Notify when inventory levels are low</p>
            </div>
            <Switch 
              checked={formData.low_stock_alerts}
              onCheckedChange={(checked) => setFormData({ ...formData, low_stock_alerts: checked })}
            />
          </div>

          <Button 
            onClick={handleSaveAutomationSettings}
            disabled={createSettings.isPending || updateSettings.isPending}
            className="bg-brand-primary hover:bg-brand-accent"
          >
            Save Automation Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
