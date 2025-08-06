import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCurrentUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/useUserPreferences";
import { useUserSecuritySettings, useUpdateUserSecuritySettings } from "@/hooks/useUserSecuritySettings";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, User, Bell, Save, Check, Shield, Globe, Clock, Edit, X } from "lucide-react";

export const PersonalSettingsTab = () => {
  const { data: userProfile, isLoading } = useCurrentUserProfile();
  const { data: userPreferences } = useUserPreferences();
  const { data: securitySettings } = useUserSecuritySettings();
  const updateProfile = useUpdateUserProfile();
  const updatePreferences = useUpdateUserPreferences();
  const updateSecuritySettings = useUpdateUserSecuritySettings();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    display_name: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    status: "available",
    status_message: "",
    email_notifications: true,
    sms_notifications: false,
    default_notification_minutes: 15,
    avatar_url: "",
  });
  
  const [preferencesData, setPreferencesData] = useState({
    timezone: "UTC",
    language: "en",
    date_format: "MM/dd/yyyy",
    time_format: "12h",
    currency: "USD",
  });
  
  const [securityData, setSecurityData] = useState({
    two_factor_enabled: false,
    session_timeout_minutes: 480,
    login_notifications: true,
    security_alerts: true,
  });
  
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        display_name: userProfile.display_name || "",
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        phone_number: userProfile.phone_number || "",
        status: userProfile.status || "available",
        status_message: userProfile.status_message || "",
        email_notifications: userProfile.email_notifications ?? true,
        sms_notifications: userProfile.sms_notifications ?? false,
        default_notification_minutes: userProfile.default_notification_minutes ?? 15,
        avatar_url: userProfile.avatar_url || "",
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (userPreferences) {
      setPreferencesData({
        timezone: userPreferences.timezone || "UTC",
        language: userPreferences.language || "en",
        date_format: userPreferences.date_format || "MM/dd/yyyy",
        time_format: userPreferences.time_format || "12h",
        currency: userPreferences.currency || "USD",
      });
    }
  }, [userPreferences]);

  useEffect(() => {
    if (securitySettings) {
      setSecurityData({
        two_factor_enabled: securitySettings.two_factor_enabled || false,
        session_timeout_minutes: securitySettings.session_timeout_minutes || 480,
        login_notifications: securitySettings.login_notifications ?? true,
        security_alerts: securitySettings.security_alerts ?? true,
      });
    }
  }, [securitySettings]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setSavedSuccessfully(false);
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(profileData);
      setSavedSuccessfully(true);
      setIsEditing(false);
      setTimeout(() => setSavedSuccessfully(false), 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSavedSuccessfully(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (userProfile) {
      setProfileData({
        display_name: userProfile.display_name || "",
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        phone_number: userProfile.phone_number || "",
        status: userProfile.status || "available",
        status_message: userProfile.status_message || "",
        email_notifications: userProfile.email_notifications ?? true,
        sms_notifications: userProfile.sms_notifications ?? false,
        default_notification_minutes: userProfile.default_notification_minutes ?? 15,
        avatar_url: userProfile.avatar_url || "",
      });
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updatePreferences.mutateAsync(preferencesData);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const handleSaveSecuritySettings = async () => {
    try {
      await updateSecuritySettings.mutateAsync(securityData);
    } catch (error) {
      console.error("Error saving security settings:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      handleInputChange("avatar_url", data.publicUrl);
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return <div>Loading personal settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={handleEdit} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileData.avatar_url} alt="Profile" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                {getInitials(profileData.display_name || user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="avatar-upload"
              />
              <Button 
                variant="outline" 
                size="sm"
                disabled={!isEditing}
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-sm text-muted-foreground">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                value={profileData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                placeholder="Your first name"
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                value={profileData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                placeholder="Your last name"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={profileData.display_name}
                onChange={(e) => handleInputChange("display_name", e.target.value)}
                placeholder="Your display name"
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-phone">Phone Number</Label>
              <Input
                id="user-phone"
                value={profileData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar-url">Profile Picture URL (Alternative)</Label>
            <Input
              id="avatar-url"
              value={profileData.avatar_url}
              onChange={(e) => handleInputChange("avatar_url", e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-message">Status Message</Label>
            <Input
              id="status-message"
              value={profileData.status_message}
              onChange={(e) => handleInputChange("status_message", e.target.value)}
              placeholder="Available, In a meeting, etc."
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email Address</Label>
            <Input
              id="user-email"
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed here. Contact support if needed.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Role:</strong> {userProfile?.role || 'Staff'}
            </p>
          </div>

          {/* Notification Settings Section */}
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for appointments and updates
                  </p>
                </div>
                <Switch
                  checked={profileData.email_notifications}
                  onCheckedChange={(checked) => handleInputChange("email_notifications", checked)}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive SMS notifications for urgent updates
                  </p>
                </div>
                <Switch
                  checked={profileData.sms_notifications}
                  onCheckedChange={(checked) => handleInputChange("sms_notifications", checked)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-timing">Default Notification Timing (minutes)</Label>
                <Input
                  id="notification-timing"
                  type="number"
                  value={profileData.default_notification_minutes}
                  onChange={(e) => handleInputChange("default_notification_minutes", parseInt(e.target.value) || 15)}
                  min="0"
                  max="1440"
                  className="w-32"
                  disabled={!isEditing}
                />
                <p className="text-sm text-muted-foreground">
                  Minutes before appointments to send notifications
                </p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="pt-4 flex gap-2">
              <Button 
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="flex-1"
              >
                {updateProfile.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancel}
                disabled={updateProfile.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
          
          {savedSuccessfully && !isEditing && (
            <div className="pt-4">
              <div className="flex items-center justify-center text-green-600 text-sm">
                <Check className="h-4 w-4 mr-2" />
                Profile updated successfully
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Localization & Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization & Preferences
          </CardTitle>
          <CardDescription>
            Configure your timezone, language, and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={preferencesData.timezone} 
                onValueChange={(value) => setPreferencesData({...preferencesData, timezone: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                value={preferencesData.language} 
                onValueChange={(value) => setPreferencesData({...preferencesData, language: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select 
                value={preferencesData.date_format} 
                onValueChange={(value) => setPreferencesData({...preferencesData, date_format: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                  <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                  <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select 
                value={preferencesData.time_format} 
                onValueChange={(value) => setPreferencesData({...preferencesData, time_format: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleSavePreferences}
            disabled={updatePreferences.isPending}
            variant="outline"
            className="w-full"
          >
            {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
          <CardDescription>
            Manage your security settings and privacy preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={securityData.two_factor_enabled}
                onCheckedChange={(checked) => 
                  setSecurityData({...securityData, two_factor_enabled: checked})
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Login Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone logs into your account
                </p>
              </div>
              <Switch
                checked={securityData.login_notifications}
                onCheckedChange={(checked) => 
                  setSecurityData({...securityData, login_notifications: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Security Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts about suspicious activity
                </p>
              </div>
              <Switch
                checked={securityData.security_alerts}
                onCheckedChange={(checked) => 
                  setSecurityData({...securityData, security_alerts: checked})
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={securityData.session_timeout_minutes}
                onChange={(e) => 
                  setSecurityData({...securityData, session_timeout_minutes: parseInt(e.target.value) || 480})
                }
                min="30"
                max="1440"
              />
              <p className="text-sm text-muted-foreground">
                How long you stay logged in when inactive (30-1440 minutes)
              </p>
            </div>
          </div>

          <Button 
            onClick={handleSaveSecuritySettings}
            disabled={updateSecuritySettings.isPending}
            variant="outline"
            className="w-full"
          >
            {updateSecuritySettings.isPending ? "Saving..." : "Save Security Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};