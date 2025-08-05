
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessSettings, useCreateBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { useCurrentUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Phone, MapPin, Check, User } from "lucide-react";

export const BusinessConfigTab = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  const createBusinessSettings = useCreateBusinessSettings();
  const updateBusinessSettings = useUpdateBusinessSettings();
  const { data: userProfile, isLoading: profileLoading } = useCurrentUserProfile();
  const updateUserProfile = useUpdateUserProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

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

  const [profileData, setProfileData] = useState({
    display_name: "",
    phone_number: "",
    avatar_url: "",
    status_message: ""
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

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        display_name: userProfile.display_name || "",
        phone_number: userProfile.phone_number || "",
        avatar_url: userProfile.avatar_url || "",
        status_message: userProfile.status_message || ""
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setSavedSuccessfully(false);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileChange = (field: string, value: string) => {
    setSavedSuccessfully(false);
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Save business settings
      if (businessSettings?.id) {
        await updateBusinessSettings.mutateAsync({
          id: businessSettings.id,
          ...formData
        });
      } else {
        await createBusinessSettings.mutateAsync(formData);
      }

      // Save user profile
      await updateUserProfile.mutateAsync(profileData);
      
      setSavedSuccessfully(true);
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
      
      // Reset saved state after 3 seconds
      setTimeout(() => {
        setSavedSuccessfully(false);
      }, 3000);
    } catch (error) {
      setSavedSuccessfully(false);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  if (isLoading || profileLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={profileData.display_name}
                onChange={(e) => handleProfileChange("display_name", e.target.value)}
                placeholder="Your display name"
              />
            </div>
            
            <div>
              <Label htmlFor="user-phone">Phone Number</Label>
              <Input
                id="user-phone"
                value={profileData.phone_number}
                onChange={(e) => handleProfileChange("phone_number", e.target.value)}
                placeholder="+61 4XX XXX XXX"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="avatar-url">Avatar URL</Label>
            <Input
              id="avatar-url"
              value={profileData.avatar_url}
              onChange={(e) => handleProfileChange("avatar_url", e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div>
            <Label htmlFor="status-message">Status Message</Label>
            <Input
              id="status-message"
              value={profileData.status_message}
              onChange={(e) => handleProfileChange("status_message", e.target.value)}
              placeholder="Available"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {userProfile?.role || 'Staff'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Company Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={formData.company_name}
                onChange={(e) => handleInputChange("company_name", e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <Label htmlFor="abn">ABN</Label>
              <Input
                id="abn"
                value={formData.abn}
                onChange={(e) => handleInputChange("abn", e.target.value)}
                placeholder="Enter ABN"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://www.example.com"
            />
          </div>

          <div>
            <Label htmlFor="logo-url">Company Logo URL</Label>
            <Input
              id="logo-url"
              value={formData.company_logo_url}
              onChange={(e) => handleInputChange("company_logo_url", e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business-email">Business Email</Label>
              <Input
                id="business-email"
                type="email"
                value={formData.business_email}
                onChange={(e) => handleInputChange("business_email", e.target.value)}
                placeholder="business@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="business-phone">Business Phone</Label>
              <Input
                id="business-phone"
                value={formData.business_phone}
                onChange={(e) => handleInputChange("business_phone", e.target.value)}
                placeholder="+61 2 1234 5678"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Business Address</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Street Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter street address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Enter city"
              />
            </div>
            
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Enter state"
              />
            </div>
            
            <div>
              <Label htmlFor="zip-code">Zip Code</Label>
              <Input
                id="zip-code"
                value={formData.zip_code}
                onChange={(e) => handleInputChange("zip_code", e.target.value)}
                placeholder="Enter zip code"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              placeholder="Enter country"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end items-center space-x-3">
        {savedSuccessfully && (
          <div className="flex items-center text-green-600 text-sm">
            <Check className="h-4 w-4 mr-1" />
            <span>Saved successfully</span>
          </div>
        )}
        <Button 
          onClick={handleSave}
          disabled={createBusinessSettings.isPending || updateBusinessSettings.isPending || updateUserProfile.isPending || savedSuccessfully}
          variant={savedSuccessfully ? "secondary" : "default"}
        >
          {savedSuccessfully ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (createBusinessSettings.isPending || updateBusinessSettings.isPending || updateUserProfile.isPending) ? (
            "Saving..."
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
};
