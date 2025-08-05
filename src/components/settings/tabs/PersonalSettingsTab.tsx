
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCurrentUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Shield, Eye, Check, Upload } from "lucide-react";

export const PersonalSettingsTab = () => {
  const { data: userProfile, isLoading } = useCurrentUserProfile();
  const updateUserProfile = useUpdateUserProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  const [profileData, setProfileData] = useState({
    display_name: "",
    phone_number: "",
    avatar_url: "",
    status_message: "",
    email_notifications: true,
    sms_notifications: false,
    default_notification_minutes: 15
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        display_name: userProfile.display_name || "",
        phone_number: userProfile.phone_number || "",
        avatar_url: userProfile.avatar_url || "",
        status_message: userProfile.status_message || "",
        email_notifications: userProfile.email_notifications ?? true,
        sms_notifications: userProfile.sms_notifications ?? false,
        default_notification_minutes: userProfile.default_notification_minutes ?? 15
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setSavedSuccessfully(false);
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateUserProfile.mutateAsync(profileData);
      setSavedSuccessfully(true);
      
      toast({
        title: "Success",
        description: "Personal settings saved successfully",
      });
      
      setTimeout(() => setSavedSuccessfully(false), 3000);
    } catch (error) {
      setSavedSuccessfully(false);
      toast({
        title: "Error",
        description: "Failed to save personal settings",
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
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileData.avatar_url} alt="Profile" />
              <AvatarFallback className="bg-brand-primary text-white text-lg font-medium">
                {getInitials(profileData.display_name || user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-sm text-muted-foreground">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={profileData.display_name}
                onChange={(e) => handleInputChange("display_name", e.target.value)}
                placeholder="Your display name"
              />
            </div>
            
            <div>
              <Label htmlFor="user-phone">Phone Number</Label>
              <Input
                id="user-phone"
                value={profileData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                placeholder="+61 4XX XXX XXX"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="avatar-url">Profile Picture URL</Label>
            <Input
              id="avatar-url"
              value={profileData.avatar_url}
              onChange={(e) => handleInputChange("avatar_url", e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div>
            <Label htmlFor="status-message">Status Message</Label>
            <Input
              id="status-message"
              value={profileData.status_message}
              onChange={(e) => handleInputChange("status_message", e.target.value)}
              placeholder="Available, In a meeting, etc."
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span><strong>Email:</strong> {user?.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
              <Eye className="h-4 w-4" />
              <span><strong>Role:</strong> {userProfile?.role || 'Staff'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for appointments and updates
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={profileData.email_notifications}
              onCheckedChange={(checked) => handleInputChange("email_notifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive SMS notifications for urgent updates
              </p>
            </div>
            <Switch
              id="sms-notifications"
              checked={profileData.sms_notifications}
              onCheckedChange={(checked) => handleInputChange("sms_notifications", checked)}
            />
          </div>

          <div>
            <Label htmlFor="notification-timing">Default Notification Timing</Label>
            <Input
              id="notification-timing"
              type="number"
              value={profileData.default_notification_minutes}
              onChange={(e) => handleInputChange("default_notification_minutes", parseInt(e.target.value) || 15)}
              min="0"
              max="1440"
              className="w-24"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minutes before appointments to send notifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end items-center space-x-3">
        {savedSuccessfully && (
          <div className="flex items-center text-green-600 text-sm">
            <Check className="h-4 w-4 mr-1" />
            <span>Saved successfully</span>
          </div>
        )}
        <Button 
          onClick={handleSave}
          disabled={updateUserProfile.isPending || savedSuccessfully}
          variant={savedSuccessfully ? "secondary" : "default"}
        >
          {savedSuccessfully ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : updateUserProfile.isPending ? (
            "Saving..."
          ) : (
            "Save Personal Settings"
          )}
        </Button>
      </div>
    </div>
  );
};
