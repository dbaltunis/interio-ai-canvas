
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Building, Mail, Phone, MapPin, Globe, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CompanySetupTab = () => {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    toast({
      title: "Company Information Saved",
      description: "Your company details have been updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Company Setup</h3>
          <p className="text-sm text-brand-neutral">Configure your business information and branding</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          Step 1 of 6
        </Badge>
      </div>

      {/* Company Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-brand-primary" />
            Company Logo
          </CardTitle>
          <CardDescription>
            Upload your company logo to appear on quotes, invoices, and documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center">
                  <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No logo uploaded</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUpload" className="cursor-pointer">
                <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  <span>Upload Logo</span>
                </div>
                <input
                  id="logoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </Label>
              <p className="text-xs text-gray-500">
                Recommended: PNG or JPG, max 2MB, square format works best
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-brand-primary" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input id="companyName" placeholder="Your Window Covering Co." />
            </div>
            <div>
              <Label htmlFor="abn">ABN / Tax ID</Label>
              <Input id="abn" placeholder="12 345 678 901" />
            </div>
          </div>

          <div>
            <Label htmlFor="businessAddress">Business Address</Label>
            <Textarea 
              id="businessAddress" 
              placeholder="123 Main Street&#10;Suite 100&#10;City, State 12345"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessPhone">Phone Number</Label>
              <Input id="businessPhone" placeholder="(555) 123-4567" />
            </div>
            <div>
              <Label htmlFor="businessEmail">Email Address</Label>
              <Input id="businessEmail" type="email" placeholder="info@yourcompany.com" />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website (Optional)</Label>
            <Input id="website" placeholder="https://www.yourcompany.com" />
          </div>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Business Configuration</CardTitle>
          <CardDescription>
            Set up your default business rules and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input id="defaultMarkup" type="number" placeholder="40" />
            </div>
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input id="taxRate" type="number" step="0.1" placeholder="10.0" />
            </div>
            <div>
              <Label htmlFor="laborRate">Labor Rate ($/hour)</Label>
              <Input id="laborRate" type="number" placeholder="85" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quoteValidity">Quote Validity (days)</Label>
              <Input id="quoteValidity" type="number" placeholder="30" />
            </div>
            <div>
              <Label htmlFor="leadTime">Installation Lead Time (days)</Label>
              <Input id="leadTime" type="number" placeholder="14" />
            </div>
            <div>
              <Label htmlFor="businessHours">Business Hours</Label>
              <Input id="businessHours" placeholder="9:00 AM - 5:00 PM" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline">
          Save as Draft
        </Button>
        <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-accent">
          Save & Continue to Team Setup
        </Button>
      </div>
    </div>
  );
};
