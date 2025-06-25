
import { useState } from "react";
import { useBusinessSettings, useCreateBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Building } from "lucide-react";

export const CompanySetupTab = () => {
  const { data: settings, isLoading } = useBusinessSettings();
  const createSettings = useCreateBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_name: settings?.company_name || "",
    business_email: settings?.business_email || "",
    business_phone: settings?.business_phone || "",
    business_address: settings?.business_address || "",
    abn: settings?.abn || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    console.log("Starting logo upload...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-company-logo.${fileExt}`;

      console.log("Uploading to storage bucket:", fileName);

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      console.log("Public URL:", publicUrl);
      setLogoUrl(publicUrl);

      toast({
        title: "Success",
        description: "Company logo uploaded successfully",
      });

    } catch (error: any) {
      console.error("Logo upload failed:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const settingsData = {
        ...formData,
        // Remove company_logo reference since it's not in the database schema yet
        // company_logo: logoUrl,
      };

      console.log("Saving company settings:", settingsData);

      if (settings?.id) {
        await updateSettings.mutateAsync({ id: settings.id, ...settingsData });
      } else {
        await createSettings.mutateAsync(settingsData);
      }

      toast({
        title: "Success",
        description: "Company settings saved successfully",
      });

    } catch (error: any) {
      console.error("Save failed:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>
            Configure your company details and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Company Logo Upload */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Company Logo" 
                  className="h-16 w-16 object-contain border rounded"
                />
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="mb-2"
                />
                {uploading && (
                  <p className="text-sm text-gray-500">Uploading...</p>
                )}
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange("company_name", e.target.value)}
              placeholder="Your Company Name"
            />
          </div>

          {/* Business Email */}
          <div className="space-y-2">
            <Label htmlFor="business_email">Business Email</Label>
            <Input
              id="business_email"
              type="email"
              value={formData.business_email}
              onChange={(e) => handleInputChange("business_email", e.target.value)}
              placeholder="business@company.com"
            />
          </div>

          {/* Business Phone */}
          <div className="space-y-2">
            <Label htmlFor="business_phone">Business Phone</Label>
            <Input
              id="business_phone"
              value={formData.business_phone}
              onChange={(e) => handleInputChange("business_phone", e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Business Address */}
          <div className="space-y-2">
            <Label htmlFor="business_address">Business Address</Label>
            <Textarea
              id="business_address"
              value={formData.business_address}
              onChange={(e) => handleInputChange("business_address", e.target.value)}
              placeholder="123 Business St, City, State, ZIP"
              rows={3}
            />
          </div>

          {/* ABN */}
          <div className="space-y-2">
            <Label htmlFor="abn">ABN (Australian Business Number)</Label>
            <Input
              id="abn"
              value={formData.abn}
              onChange={(e) => handleInputChange("abn", e.target.value)}
              placeholder="12 345 678 901"
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Company Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
