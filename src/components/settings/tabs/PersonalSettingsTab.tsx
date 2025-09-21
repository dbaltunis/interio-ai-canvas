import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCurrentUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/useUserPreferences";
import { useUserSecuritySettings, useUpdateUserSecuritySettings } from "@/hooks/useUserSecuritySettings";
import { useUserNotificationSettings, useCreateOrUpdateNotificationSettings } from "@/hooks/useUserNotificationSettings";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, User, Bell, Globe, Shield, Lock, Eye, EyeOff } from "lucide-react";
import { LoadingFallback } from "@/components/ui/loading-fallback";
import { FormSection } from "@/components/ui/form-section";
import { FormFieldGroup } from "@/components/ui/form-field-group";
import { compressImage, needsCompression, formatFileSize } from "@/utils/imageUtils";

export const PersonalSettingsTab = () => {
  const { data: userProfile, isLoading } = useCurrentUserProfile();
  const { data: userPreferences } = useUserPreferences();
  const { data: securitySettings } = useUserSecuritySettings();
  const { data: notificationSettings } = useUserNotificationSettings();
  const updateProfile = useUpdateUserProfile();
  const updatePreferences = useUpdateUserPreferences();
  const updateSecuritySettings = useUpdateUserSecuritySettings();
  const updateNotificationSettings = useCreateOrUpdateNotificationSettings();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    display_name: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    status: "available",
    avatar_url: "",
  });
  
  const [notificationData, setNotificationData] = useState({
    email_notifications_enabled: true,
    sms_notifications_enabled: false,
  });
  
  const [preferencesData, setPreferencesData] = useState({
    timezone: "UTC",
    language: "en",
    date_format: "MM/dd/yyyy",
    time_format: "12h",
  });
  
  const [securityData, setSecurityData] = useState({
    two_factor_enabled: false,
    login_notifications: true,
    security_alerts: true,
  });
  
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Email change state
  const [emailData, setEmailData] = useState({
    current_email: "",
    new_email: "",
  });
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [isEmailSaving, setIsEmailSaving] = useState(false);
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordSavedSuccessfully, setPasswordSavedSuccessfully] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        display_name: userProfile.display_name || "",
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        phone_number: userProfile.phone_number || "",
        status: userProfile.status || "available",
        avatar_url: userProfile.avatar_url || "",
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (notificationSettings) {
      setNotificationData({
        email_notifications_enabled: notificationSettings.email_notifications_enabled ?? true,
        sms_notifications_enabled: notificationSettings.sms_notifications_enabled ?? false,
      });
    }
  }, [notificationSettings]);

  useEffect(() => {
    if (user?.email) {
      setEmailData(prev => ({
        ...prev,
        current_email: user.email
      }));
    }
  }, [user?.email]);

  useEffect(() => {
    if (userPreferences) {
      setPreferencesData({
        timezone: userPreferences.timezone || "UTC",
        language: userPreferences.language || "en",
        date_format: userPreferences.date_format || "MM/dd/yyyy",
        time_format: userPreferences.time_format || "12h",
      });
    }
  }, [userPreferences]);

  useEffect(() => {
    if (securitySettings) {
      setSecurityData({
        two_factor_enabled: securitySettings.two_factor_enabled || false,
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
        avatar_url: userProfile.avatar_url || "",
      });
    }
    if (notificationSettings) {
      setNotificationData({
        email_notifications_enabled: notificationSettings.email_notifications_enabled ?? true,
        sms_notifications_enabled: notificationSettings.sms_notifications_enabled ?? false,
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

  const handleSaveNotificationSettings = async () => {
    try {
      await updateNotificationSettings.mutateAsync(notificationData);
    } catch (error) {
      console.error("Error saving notification settings:", error);
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

    console.log('Starting file upload process...', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    });

    try {
      let fileToUpload = file;
      
      // Check if image needs compression
      if (needsCompression(file)) {
        console.log('Image needs compression, starting compression...');
        toast({
          title: "Optimizing image...",
          description: `Compressing large image (${formatFileSize(file.size)}) for better performance`,
        });
        
        try {
          // Compress the image
          fileToUpload = await compressImage(file, {
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.85,
            format: 'jpeg'
          });
          
          console.log('Image compression successful', { 
            originalSize: file.size, 
            compressedSize: fileToUpload.size 
          });
          
          toast({
            title: "Image optimized",
            description: `Size reduced from ${formatFileSize(file.size)} to ${formatFileSize(fileToUpload.size)}`,
          });
        } catch (compressionError) {
          console.error('Image compression failed:', compressionError);
          // Fall back to original file if compression fails
          fileToUpload = file;
          toast({
            title: "Using original image",
            description: "Compression failed, uploading original image",
          });
        }
      }

      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      
      console.log('Uploading to storage...', { fileName, fileSize: fileToUpload.size });
      
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, fileToUpload);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('Storage upload successful, getting public URL...');
      
      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      console.log('Public URL obtained:', data.publicUrl);
      
      handleInputChange("avatar_url", data.publicUrl);
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error) {
      console.error("Complete error in handleFileUpload:", error);
      toast({
        title: "Error",
        description: `Failed to upload profile picture: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleTestEmail = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          to_email: user?.email,
          subject: 'Test Email from Personal Settings',
          message: 'This is a test email to verify your email notification settings are working correctly.'
        }
      });

      if (error) throw error;

      toast({
        title: "Test email sent",
        description: `A test email has been sent to ${user?.email}`,
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email. Please check your email settings.",
        variant: "destructive",
      });
    }
  };

  const handleTestSMS = async () => {
    try {
      if (!profileData.phone_number) {
        toast({
          title: "Phone number required",
          description: "Please add a phone number to test SMS notifications.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-test-sms', {
        body: {
          phoneNumber: profileData.phone_number
        }
      });

      if (error) throw error;

      toast({
        title: "Test SMS sent",
        description: `A test SMS has been sent to ${profileData.phone_number}`,
      });
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast({
        title: "Error",
        description: "Failed to send test SMS. Please check your phone number and SMS settings.",
        variant: "destructive",
      });
    }
  };

  const handleEmailChange = async () => {
    if (!emailData.new_email || emailData.new_email === emailData.current_email) {
      toast({
        title: "Error",
        description: "Please enter a new email address.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.new_email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsEmailSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: emailData.new_email
      });

      if (error) throw error;

      setEmailChangeRequested(true);
      setIsEmailEditing(false);
      
      toast({
        title: "Email Change Requested",
        description: "A verification email has been sent to your new email address. Please check your inbox and click the confirmation link.",
      });
    } catch (error) {
      console.error("Error updating email:", error);
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEmailSaving(false);
    }
  };

  const handleEmailEdit = () => {
    setIsEmailEditing(true);
    setEmailChangeRequested(false);
  };

  const handleEmailCancel = () => {
    setIsEmailEditing(false);
    setEmailData(prev => ({
      ...prev,
      new_email: ""
    }));
  };

  const handlePasswordChange = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });

      if (error) throw error;

      setPasswordSavedSuccessfully(true);
      setIsPasswordEditing(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setTimeout(() => setPasswordSavedSuccessfully(false), 3000);
      
      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handlePasswordEdit = () => {
    setIsPasswordEditing(true);
    setPasswordSavedSuccessfully(false);
  };

  const handlePasswordCancel = () => {
    setIsPasswordEditing(false);
    setPasswordData({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return <LoadingFallback title="Loading personal settings..." rows={6} />;
  }

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      {/* Enhanced Profile Information */}
      <FormSection
        title="Profile Information"
        description="Update your personal information and profile picture"
        icon={<User className="h-5 w-5" />}
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={updateProfile.isPending}
        savedSuccessfully={savedSuccessfully}
      >
        {/* Enhanced Avatar Section */}
        <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg group-hover:scale-105 transition-transform duration-200">
              <AvatarImage src={profileData.avatar_url} alt="Profile" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {getInitials(profileData.display_name || user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <h4 className="font-semibold text-base text-foreground">Profile Picture</h4>
              <p className="text-sm text-muted-foreground">
                JPG, PNG or GIF. Large images will be automatically optimized for better performance.
              </p>
            </div>
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
              className="hover-lift interactive-bounce"
            >
              <Upload className="h-4 w-4 mr-2" />
              {profileData.avatar_url ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label="First Name">
            <Input
              value={profileData.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              placeholder="Your first name"
              disabled={!isEditing}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="Last Name">
            <Input
              value={profileData.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              placeholder="Your last name"
              disabled={!isEditing}
            />
          </FormFieldGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label="Display Name">
            <Input
              value={profileData.display_name}
              onChange={(e) => handleInputChange("display_name", e.target.value)}
              placeholder="Your display name"
              disabled={!isEditing}
            />
          </FormFieldGroup>
          
          <FormFieldGroup label="Phone Number">
            <Input
              value={profileData.phone_number}
              onChange={(e) => handleInputChange("phone_number", e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={!isEditing}
            />
          </FormFieldGroup>
        </div>


        <FormFieldGroup 
          label="Email Address" 
          description={emailChangeRequested ? "Email change pending - check your inbox for verification" : "Your account email address"}
        >
          {!isEmailEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={user?.email || ""}
                disabled
                className="bg-muted flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmailEdit}
                className="hover:bg-primary hover:text-primary-foreground"
              >
                Change Email
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                value={emailData.current_email}
                disabled
                className="bg-muted"
                placeholder="Current email"
              />
              <Input
                value={emailData.new_email}
                onChange={(e) => setEmailData(prev => ({ ...prev, new_email: e.target.value }))}
                placeholder="Enter new email address"
                type="email"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailCancel}
                  disabled={isEmailSaving}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleEmailChange}
                  disabled={isEmailSaving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isEmailSaving ? "Sending..." : "Send Verification"}
                </Button>
              </div>
            </div>
          )}
        </FormFieldGroup>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Account Role</p>
              <p className="text-xs text-muted-foreground">Your current role in the system</p>
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {userProfile?.role || 'Staff'}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <Separator />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Notification Preferences</h3>
          </div>
          
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium text-sm">Email Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive email notifications for appointments and updates
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={notificationData.email_notifications_enabled}
                  onCheckedChange={async (checked) => {
                    setNotificationData(prev => ({ ...prev, email_notifications_enabled: checked }));
                    await handleSaveNotificationSettings();
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestEmail}
                  disabled={!notificationData.email_notifications_enabled}
                  className="ml-2"
                >
                  Test Email
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium text-sm">SMS Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive SMS notifications for urgent updates
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={notificationData.sms_notifications_enabled}
                  onCheckedChange={async (checked) => {
                    setNotificationData(prev => ({ ...prev, sms_notifications_enabled: checked }));
                    await handleSaveNotificationSettings();
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestSMS}
                  disabled={!notificationData.sms_notifications_enabled || !profileData.phone_number}
                  className="ml-2"
                >
                  Test SMS
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Password & Security */}
      <FormSection
        title="Password & Security"
        description="Update your password and security settings"
        icon={<Lock className="h-5 w-5" />}
        isEditing={isPasswordEditing}
        onEdit={handlePasswordEdit}
        onSave={handlePasswordChange}
        onCancel={handlePasswordCancel}
        isSaving={isPasswordSaving}
        savedSuccessfully={passwordSavedSuccessfully}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <FormFieldGroup label="Current Password" description="Enter your current password to confirm identity">
              <div className="relative">
                <Input
                  type={showPassword.current ? "text" : "password"}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  placeholder="Enter current password"
                  disabled={!isPasswordEditing}
                />
                {isPasswordEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPassword.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </FormFieldGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormFieldGroup label="New Password" description="Must be at least 6 characters">
              <div className="relative">
                <Input
                  type={showPassword.new ? "text" : "password"}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  placeholder="Enter new password"
                  disabled={!isPasswordEditing}
                />
                {isPasswordEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPassword.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </FormFieldGroup>

            <FormFieldGroup label="Confirm New Password" description="Re-enter your new password">
              <div className="relative">
                <Input
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  placeholder="Confirm new password"
                  disabled={!isPasswordEditing}
                />
                {isPasswordEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </FormFieldGroup>
          </div>

          {/* Password Requirements */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Password Requirements</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className={`flex items-center gap-2 ${passwordData.new_password.length >= 6 ? 'text-green-600' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${passwordData.new_password.length >= 6 ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                At least 6 characters long
              </li>
              <li className={`flex items-center gap-2 ${passwordData.new_password === passwordData.confirm_password && passwordData.new_password ? 'text-green-600' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${passwordData.new_password === passwordData.confirm_password && passwordData.new_password ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                Passwords match
              </li>
            </ul>
          </div>
        </div>
      </FormSection>

      {/* Localization & Preferences */}
      <FormSection
        title="Localization & Preferences"
        description="Configure your timezone, language, and regional settings"
        icon={<Globe className="h-5 w-5" />}
        isEditing={false}
        onEdit={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
        isSaving={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label="Timezone">
            <Select 
              value={preferencesData.timezone} 
              onValueChange={async (value) => {
                setPreferencesData({...preferencesData, timezone: value});
                await updatePreferences.mutateAsync({...preferencesData, timezone: value});
              }}
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
          </FormFieldGroup>

          <FormFieldGroup label="Language">
            <Select 
              value={preferencesData.language} 
              onValueChange={async (value) => {
                setPreferencesData({...preferencesData, language: value});
                await updatePreferences.mutateAsync({...preferencesData, language: value});
              }}
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
                <SelectItem value="pt">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label="Date Format">
            <Select 
              value={preferencesData.date_format} 
              onValueChange={async (value) => {
                setPreferencesData({...preferencesData, date_format: value});
                await updatePreferences.mutateAsync({...preferencesData, date_format: value});
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                <SelectItem value="dd-MMM-yyyy">DD-MMM-YYYY</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldGroup>

          <FormFieldGroup label="Time Format">
            <Select 
              value={preferencesData.time_format} 
              onValueChange={async (value) => {
                setPreferencesData({...preferencesData, time_format: value});
                await updatePreferences.mutateAsync({...preferencesData, time_format: value});
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                <SelectItem value="24h">24 Hour</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldGroup>
        </div>
      </FormSection>

      {/* Security Settings */}
      <FormSection
        title="Security & Privacy"
        description="Manage your account security and privacy settings"
        icon={<Shield className="h-5 w-5" />}
        isEditing={false}
        onEdit={() => {}}
        onSave={handleSaveSecuritySettings}
        onCancel={() => {}}
        isSaving={updateSecuritySettings.isPending}
      >
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={securityData.two_factor_enabled}
              onCheckedChange={(checked) => setSecurityData({...securityData, two_factor_enabled: checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium text-sm">Login Notifications</p>
              <p className="text-xs text-muted-foreground">
                Get notified when someone logs into your account
              </p>
            </div>
            <Switch
              checked={securityData.login_notifications}
              onCheckedChange={(checked) => setSecurityData({...securityData, login_notifications: checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium text-sm">Security Alerts</p>
              <p className="text-xs text-muted-foreground">
                Receive alerts about important security events
              </p>
            </div>
            <Switch
              checked={securityData.security_alerts}
              onCheckedChange={(checked) => setSecurityData({...securityData, security_alerts: checked})}
            />
          </div>

        </div>
      </FormSection>
    </div>
  );
};