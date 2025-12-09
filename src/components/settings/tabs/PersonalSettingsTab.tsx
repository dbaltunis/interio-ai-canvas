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
import { Upload, User, Bell, Globe, Shield, Lock, Eye, EyeOff, Calendar, Clock } from "lucide-react";
import { LoadingFallback } from "@/components/ui/loading-fallback";
import { FormSection } from "@/components/ui/form-section";
import { FormFieldGroup } from "@/components/ui/form-field-group";
import { compressImage, needsCompression, formatFileSize } from "@/utils/imageUtils";
import { useFormattedDate, useFormattedTime } from "@/hooks/useFormattedDate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from 'react-i18next';

export const PersonalSettingsTab = () => {
  const {
    data: userProfile,
    isLoading
  } = useCurrentUserProfile();
  const {
    data: userPreferences
  } = useUserPreferences();
  const {
    data: securitySettings
  } = useUserSecuritySettings();
  const {
    data: notificationSettings
  } = useUserNotificationSettings();
  const updateProfile = useUpdateUserProfile();
  const updatePreferences = useUpdateUserPreferences();
  const updateSecuritySettings = useUpdateUserSecuritySettings();
  const updateNotificationSettings = useCreateOrUpdateNotificationSettings();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [profileData, setProfileData] = useState({
    display_name: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    status: "available",
    avatar_url: ""
  });
  const [notificationData, setNotificationData] = useState({
    email_notifications_enabled: true,
    sms_notifications_enabled: false
  });
  const [preferencesData, setPreferencesData] = useState({
    timezone: "UTC",
    language: "en",
    date_format: "MM/dd/yyyy",
    time_format: "12h"
  });
  const [securityData, setSecurityData] = useState({
    two_factor_enabled: false,
    login_notifications: true,
    security_alerts: true
  });
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Email change state
  const [emailData, setEmailData] = useState({
    current_email: "",
    new_email: ""
  });
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [isEmailSaving, setIsEmailSaving] = useState(false);
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordSavedSuccessfully, setPasswordSavedSuccessfully] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Hooks must be called at the top level, before any conditional returns
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        display_name: userProfile.display_name || "",
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        phone_number: userProfile.phone_number || "",
        status: userProfile.status || "available",
        avatar_url: userProfile.avatar_url || ""
      });
    }
  }, [userProfile]);
  useEffect(() => {
    if (notificationSettings) {
      setNotificationData({
        email_notifications_enabled: notificationSettings.email_notifications_enabled ?? true,
        sms_notifications_enabled: notificationSettings.sms_notifications_enabled ?? false
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
        time_format: userPreferences.time_format || "12h"
      });
    }
  }, [userPreferences]);
  useEffect(() => {
    if (securitySettings) {
      setSecurityData({
        two_factor_enabled: securitySettings.two_factor_enabled || false,
        login_notifications: securitySettings.login_notifications ?? true,
        security_alerts: securitySettings.security_alerts ?? true
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
        avatar_url: userProfile.avatar_url || ""
      });
    }
    if (notificationSettings) {
      setNotificationData({
        email_notifications_enabled: notificationSettings.email_notifications_enabled ?? true,
        sms_notifications_enabled: notificationSettings.sms_notifications_enabled ?? false
      });
    }
  };
  const handleSavePreferences = async () => {
    try {
      await updatePreferences.mutateAsync(preferencesData);
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: t('settings.messages.error.update_failed'),
        description: t('settings.messages.error.preferences_update_failed'),
        variant: "destructive"
      });
    }
  };
  const handleSaveNotificationSettings = async () => {
    try {
      await updateNotificationSettings.mutateAsync(notificationData);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: t('settings.messages.error.update_failed'),
        description: t('settings.messages.error.notification_update_failed'),
        variant: "destructive"
      });
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
            title: t('settings.messages.loading.optimizing'),
            description: `${t('settings.messages.loading.optimizing')} (${formatFileSize(file.size)}) ${t('settings.messages.loading.for_better_performance')}`
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
            title: t('settings.messages.loading.optimized'),
            description: `${t('settings.messages.loading.size_reduced_from')} ${formatFileSize(file.size)} ${t('settings.messages.loading.to')} ${formatFileSize(fileToUpload.size)}`
          });
        } catch (compressionError) {
          console.error('Image compression failed:', compressionError);
          // Fall back to original file if compression fails
          fileToUpload = file;
          toast({
            title: t('settings.messages.loading.using_original'),
            description: t('settings.messages.loading.compression_failed')
          });
        }
      }
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      console.log('Uploading to storage...', {
        fileName,
        fileSize: fileToUpload.size
      });
      const {
        error: uploadError
      } = await supabase.storage.from('project-images').upload(fileName, fileToUpload);
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      console.log('Storage upload successful, getting public URL...');
      const {
        data
      } = supabase.storage.from('project-images').getPublicUrl(fileName);
      console.log('Public URL obtained:', data.publicUrl);
      handleInputChange("avatar_url", data.publicUrl);
      toast({
        title: t('settings.messages.success.photo_uploaded')
      });
    } catch (error) {
      console.error("Complete error in handleFileUpload:", error);
      toast({
        title: t('settings.messages.error.photo_upload_failed'),
        description: `${t('settings.messages.error.photo_upload_failed')}: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  const handleTestEmail = async () => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('send-test-email', {
        body: {
          to_email: user?.email,
          subject: 'Test Email from Personal Settings',
          message: 'This is a test email to verify your email notification settings are working correctly.'
        }
      });
      if (error) throw error;
      toast({
        title: t('settings.messages.success.test_email_sent'),
        description: `${t('settings.messages.success.test_email_sent')} ${user?.email}`
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: t('settings.messages.error.update_failed'),
        description: t('settings.messages.error.test_email_failed'),
        variant: "destructive"
      });
    }
  };
  const handleTestSMS = async () => {
    try {
      if (!profileData.phone_number) {
        toast({
          title: t('settings.messages.error.phone_required'),
          description: t('settings.messages.error.phone_required_desc'),
          variant: "destructive"
        });
        return;
      }
      const {
        data,
        error
      } = await supabase.functions.invoke('send-test-sms', {
        body: {
          phoneNumber: profileData.phone_number
        }
      });
      if (error) throw error;
      toast({
        title: t('settings.messages.success.test_sms_sent'),
        description: `${t('settings.messages.success.test_sms_sent')} ${profileData.phone_number}`
      });
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast({
        title: t('settings.messages.error.update_failed'),
        description: t('settings.messages.error.test_sms_failed'),
        variant: "destructive"
      });
    }
  };
  const handleEmailChange = async () => {
    if (!emailData.new_email || emailData.new_email === emailData.current_email) {
      toast({
        title: t('settings.messages.error.email_required'),
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.new_email)) {
      toast({
        title: t('settings.messages.error.invalid_email'),
        variant: "destructive"
      });
      return;
    }
    setIsEmailSaving(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        email: emailData.new_email
      });
      if (error) throw error;
      setEmailChangeRequested(true);
      setIsEmailEditing(false);
      toast({
        title: t('settings.messages.success.email_changed'),
        description: t('settings.messages.success.email_verification_sent')
      });
    } catch (error) {
      console.error("Error updating email:", error);
      toast({
        title: t('settings.messages.error.update_failed'),
        description: t('settings.messages.error.email_update_failed'),
        variant: "destructive"
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
        title: t('settings.messages.error.password_required'),
        variant: "destructive"
      });
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: t('settings.messages.error.password_mismatch'),
        variant: "destructive"
      });
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast({
        title: t('settings.messages.error.password_too_short'),
        variant: "destructive"
      });
      return;
    }
    setIsPasswordSaving(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });
      if (error) throw error;
      setPasswordSavedSuccessfully(true);
      setIsPasswordEditing(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
      setTimeout(() => setPasswordSavedSuccessfully(false), 3000);
      toast({
        title: t('settings.messages.success.password_updated')
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: t('settings.messages.error.update_failed'),
        description: t('settings.messages.error.password_update_failed'),
        variant: "destructive"
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
      confirm_password: ""
    });
  };
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };
  if (isLoading) {
    return <LoadingFallback title={t('settings.profile.loading')} rows={6} />;
  }

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    updatePreferences.mutate({ language });
  };


  return <div className="space-y-8 max-w-4xl animate-fade-in">
      {/* Enhanced Profile Information */}
      <FormSection title={t('settings.profile.title')} description={t('settings.profile.description')} icon={<User className="h-5 w-5" />} isEditing={isEditing} onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel} isSaving={updateProfile.isPending} savedSuccessfully={savedSuccessfully}>
        {/* Enhanced Avatar Section */}
        <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg group-hover:scale-105 transition-transform duration-200">
              <AvatarImage src={profileData.avatar_url} alt="Profile" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {getInitials(profileData.display_name || user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
            {isEditing && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="h-6 w-6 text-white" />
              </div>}
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <h4 className="font-semibold text-base text-foreground">{t('settings.profile.picture.title')}</h4>

            </div>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="avatar-upload" />
            <Button variant="outline" size="sm" disabled={!isEditing} onClick={() => document.getElementById('avatar-upload')?.click()} className="hover-lift interactive-bounce">
              <Upload className="h-4 w-4 mr-2" />
              {profileData.avatar_url ? t('settings.profile.picture.change') : t('settings.profile.picture.upload')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label={t('settings.profile.first_name.label')}>
            <Input value={profileData.first_name} onChange={e => handleInputChange("first_name", e.target.value)} placeholder={t('settings.profile.first_name.placeholder')} disabled={!isEditing} />
          </FormFieldGroup>

          <FormFieldGroup label={t('settings.profile.last_name.label')}>
            <Input value={profileData.last_name} onChange={e => handleInputChange("last_name", e.target.value)} placeholder={t('settings.profile.last_name.placeholder')} disabled={!isEditing} />
          </FormFieldGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldGroup label={t('settings.profile.display_name.label')}>
            <Input value={profileData.display_name} onChange={e => handleInputChange("display_name", e.target.value)} placeholder={t('settings.profile.display_name.placeholder')} disabled={!isEditing} />
          </FormFieldGroup>

          <FormFieldGroup label={t('settings.profile.phone_number.label')}>
            <Input value={profileData.phone_number} onChange={e => handleInputChange("phone_number", e.target.value)} placeholder={t('settings.profile.phone_number.placeholder')} disabled={!isEditing} />
          </FormFieldGroup>
        </div>


        <FormFieldGroup label={t('settings.profile.email.label')}>
          {!isEmailEditing ? <div className="flex items-center gap-2">
              <Input value={user?.email || ""} disabled className="bg-muted flex-1" />
              <Button variant="outline" size="sm" onClick={handleEmailEdit} className="hover:bg-primary hover:text-primary-foreground">
                {t('settings.profile.email.change_button')}
              </Button>
            </div> : <div className="space-y-3">
              <Input value={emailData.current_email} disabled className="bg-muted" placeholder={t('settings.profile.email.current_placeholder')} />
              <Input value={emailData.new_email} onChange={e => setEmailData(prev => ({
            ...prev,
            new_email: e.target.value
          }))} placeholder={t('settings.profile.email.new_placeholder')} type="email" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleEmailCancel} disabled={isEmailSaving}>
                  {t('settings.buttons.cancel')}
                </Button>
                <Button size="sm" onClick={handleEmailChange} disabled={isEmailSaving} className="bg-primary hover:bg-primary/90">
                  {isEmailSaving ? t('settings.profile.email.sending') : t('settings.profile.email.send_verification')}
                </Button>
              </div>
            </div>}
        </FormFieldGroup>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('settings.profile.account_role')}</p>

            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {userProfile?.role || t('settings.profile.role_staff')}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <Separator />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t('settings.notifications.title')}</h3>
          </div>
          
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-sm">{t('settings.notifications.email.label')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={notificationData.email_notifications_enabled} onCheckedChange={async checked => {
                setNotificationData(prev => ({
                  ...prev,
                  email_notifications_enabled: checked
                }));
                await handleSaveNotificationSettings();
              }} />
                <Button variant="outline" size="sm" onClick={handleTestEmail} disabled={!notificationData.email_notifications_enabled} className="ml-2">
                  {t('settings.notifications.email.test_button')}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-sm">{t('settings.notifications.sms.label')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={notificationData.sms_notifications_enabled} onCheckedChange={async checked => {
                setNotificationData(prev => ({
                  ...prev,
                  sms_notifications_enabled: checked
                }));
                await handleSaveNotificationSettings();
              }} />
                <Button variant="outline" size="sm" onClick={handleTestSMS} disabled={!notificationData.sms_notifications_enabled || !profileData.phone_number} className="ml-2">
                  {t('settings.notifications.sms.test_button')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Password & Security */}
      <FormSection title={t('settings.security.title')} description={t('settings.security.description')} icon={<Lock className="h-5 w-5" />} isEditing={isPasswordEditing} onEdit={handlePasswordEdit} onSave={handlePasswordChange} onCancel={handlePasswordCancel} isSaving={isPasswordSaving} savedSuccessfully={passwordSavedSuccessfully}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <FormFieldGroup label={t('settings.security.current_password.label')}>
              <div className="relative">
                <Input type={showPassword.current ? "text" : "password"} value={passwordData.current_password} onChange={e => setPasswordData(prev => ({
                ...prev,
                current_password: e.target.value
              }))} placeholder={t('settings.security.current_password.placeholder')} disabled={!isPasswordEditing} />
                {isPasswordEditing && <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(prev => ({
                ...prev,
                current: !prev.current
              }))}>
                    {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>}
              </div>
            </FormFieldGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormFieldGroup label={t('settings.security.new_password.label')}>
              <div className="relative">
                <Input type={showPassword.new ? "text" : "password"} value={passwordData.new_password} onChange={e => setPasswordData(prev => ({
                ...prev,
                new_password: e.target.value
              }))} placeholder={t('settings.security.new_password.placeholder')} disabled={!isPasswordEditing} />
                {isPasswordEditing && <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(prev => ({
                ...prev,
                new: !prev.new
              }))}>
                    {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>}
              </div>
            </FormFieldGroup>

            <FormFieldGroup label={t('settings.security.confirm_password.label')}>
              <div className="relative">
                <Input type={showPassword.confirm ? "text" : "password"} value={passwordData.confirm_password} onChange={e => setPasswordData(prev => ({
                ...prev,
                confirm_password: e.target.value
              }))} placeholder={t('settings.security.confirm_password.placeholder')} disabled={!isPasswordEditing} />
                {isPasswordEditing && <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(prev => ({
                ...prev,
                confirm: !prev.confirm
              }))}>
                    {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>}
              </div>
            </FormFieldGroup>
          </div>

          {/* Password Requirements */}
          
        </div>
      </FormSection>

      {/* Language & Localization */}
      <FormSection 
        title={t('settings.language.title')} 
        description="Configure language and regional settings" 
        icon={<Globe className="h-5 w-5" />} 
        isEditing={false} 
        onEdit={() => {}} 
        onSave={() => {}} 
        onCancel={() => {}} 
        isSaving={false}
      >
        <div className="space-y-6">
          {/* System Language - Disabled */}
          <FormFieldGroup label={t('settings.language.system_language.label')}>
            <div className="space-y-2">
              <Select value={preferencesData.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="bg-muted cursor-not-allowed">
                  <SelectValue placeholder={t('settings.language.system_language.placeholder')} />  
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.language.system_language.additional_languages')}
              </p>
            </div>
          </FormFieldGroup>

          {/* Date Format */}
          <FormFieldGroup label={t('settings.language.date_format.label')}>
            <Select 
              value={preferencesData.date_format} 
              onValueChange={async value => {
                const updatedPrefs = {
                  ...preferencesData,
                  date_format: value
                };
                setPreferencesData(updatedPrefs);
                await updatePreferences.mutateAsync(updatedPrefs);
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

          {/* Time Zone */}
          <FormFieldGroup label={t('settings.language.time_zone.label')}>
            <Select 
              value={preferencesData.timezone} 
              onValueChange={async value => {
                const updatedPrefs = {
                  ...preferencesData,
                  timezone: value
                };
                setPreferencesData(updatedPrefs);
                await updatePreferences.mutateAsync(updatedPrefs);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {/* UTC */}
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="GMT">GMT</SelectItem>
                
                {/* Pacific/New Zealand */}
                <SelectItem value="Pacific/Auckland">Pacific/Auckland (New Zealand)</SelectItem>
                <SelectItem value="Pacific/Chatham">Pacific/Chatham (Chatham Islands)</SelectItem>
                <SelectItem value="Pacific/Fiji">Pacific/Fiji</SelectItem>
                <SelectItem value="Pacific/Tongatapu">Pacific/Tongatapu (Tonga)</SelectItem>
                
                {/* Australia */}
                <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                <SelectItem value="Australia/Melbourne">Australia/Melbourne</SelectItem>
                <SelectItem value="Australia/Brisbane">Australia/Brisbane</SelectItem>
                <SelectItem value="Australia/Perth">Australia/Perth</SelectItem>
                <SelectItem value="Australia/Adelaide">Australia/Adelaide</SelectItem>
                
                {/* Asia */}
                <SelectItem value="Asia/Tokyo">Asia/Tokyo (Japan)</SelectItem>
                <SelectItem value="Asia/Shanghai">Asia/Shanghai (China)</SelectItem>
                <SelectItem value="Asia/Hong_Kong">Asia/Hong Kong</SelectItem>
                <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                <SelectItem value="Asia/Bangkok">Asia/Bangkok (Thailand)</SelectItem>
                <SelectItem value="Asia/Dubai">Asia/Dubai (UAE)</SelectItem>
                <SelectItem value="Asia/Kolkata">Asia/Kolkata (India)</SelectItem>
                
                {/* Europe */}
                <SelectItem value="Europe/London">Europe/London (UK)</SelectItem>
                <SelectItem value="Europe/Paris">Europe/Paris (France)</SelectItem>
                <SelectItem value="Europe/Berlin">Europe/Berlin (Germany)</SelectItem>
                <SelectItem value="Europe/Rome">Europe/Rome (Italy)</SelectItem>
                <SelectItem value="Europe/Madrid">Europe/Madrid (Spain)</SelectItem>
                <SelectItem value="Europe/Amsterdam">Europe/Amsterdam (Netherlands)</SelectItem>
                <SelectItem value="Europe/Brussels">Europe/Brussels (Belgium)</SelectItem>
                <SelectItem value="Europe/Zurich">Europe/Zurich (Switzerland)</SelectItem>
                
                {/* Americas - North */}
                <SelectItem value="America/New_York">America/New York (Eastern Time)</SelectItem>
                <SelectItem value="America/Chicago">America/Chicago (Central Time)</SelectItem>
                <SelectItem value="America/Denver">America/Denver (Mountain Time)</SelectItem>
                <SelectItem value="America/Los_Angeles">America/Los Angeles (Pacific Time)</SelectItem>
                <SelectItem value="America/Anchorage">America/Anchorage (Alaska)</SelectItem>
                <SelectItem value="Pacific/Honolulu">Pacific/Honolulu (Hawaii)</SelectItem>
                <SelectItem value="America/Toronto">America/Toronto (Canada)</SelectItem>
                <SelectItem value="America/Vancouver">America/Vancouver (Canada)</SelectItem>
                
                {/* Americas - South */}
                <SelectItem value="America/Sao_Paulo">America/São Paulo (Brazil)</SelectItem>
                <SelectItem value="America/Buenos_Aires">America/Buenos Aires (Argentina)</SelectItem>
                <SelectItem value="America/Santiago">America/Santiago (Chile)</SelectItem>
                <SelectItem value="America/Mexico_City">America/Mexico City</SelectItem>
                
                {/* Africa */}
                <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (South Africa)</SelectItem>
                <SelectItem value="Africa/Cairo">Africa/Cairo (Egypt)</SelectItem>
                <SelectItem value="Africa/Lagos">Africa/Lagos (Nigeria)</SelectItem>
                <SelectItem value="Africa/Nairobi">Africa/Nairobi (Kenya)</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldGroup>

          {/* Date & Time Preview */}
          <DateTimePreview key={`${preferencesData.date_format}-${preferencesData.time_format}-${preferencesData.timezone}`} />
        </div>
      </FormSection>

      {/* Security Settings - HIDDEN until fully functional */}
      {false && <FormSection title="Security & Privacy" description="Manage your account security and privacy settings" icon={<Shield className="h-5 w-5" />} isEditing={false} onEdit={() => {}} onSave={handleSaveSecuritySettings} onCancel={() => {}} isSaving={updateSecuritySettings.isPending}>
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch checked={securityData.two_factor_enabled} onCheckedChange={checked => setSecurityData({
            ...securityData,
            two_factor_enabled: checked
          })} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium text-sm">Login Notifications</p>
              <p className="text-xs text-muted-foreground">
                Get notified when someone logs into your account
              </p>
            </div>
            <Switch checked={securityData.login_notifications} onCheckedChange={checked => setSecurityData({
            ...securityData,
            login_notifications: checked
          })} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium text-sm">Security Alerts</p>
              <p className="text-xs text-muted-foreground">
                Receive alerts about important security events
              </p>
            </div>
            <Switch checked={securityData.security_alerts} onCheckedChange={checked => setSecurityData({
            ...securityData,
            security_alerts: checked
          })} />
          </div>

        </div>
      </FormSection>}
    </div>;
};

// Date & Time Preview Component
const DateTimePreview = () => {  
  const { t, i18n } = useTranslation();
  const [previewKey, setPreviewKey] = React.useState(0);
  const { data: userPreferences } = useUserPreferences();
  
  // Force re-render when preferences change
  React.useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [userPreferences?.date_format, userPreferences?.time_format, userPreferences?.timezone]);
  
  const now = new Date();
  const { formattedDate: dateOnly } = useFormattedDate(now, false);
  const { formattedDate: dateWithTime } = useFormattedDate(now, true);
  const { formattedTime: timeOnly } = useFormattedTime(now);

  return (
    <Alert className="bg-muted/30 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            {t('settings.language.time_zone.format_preview')}
          </h4>
          <AlertDescription className="space-y-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
                <span className="text-muted-foreground">{t('settings.language.time_zone.date_only')}:</span>
                <span className="font-mono font-medium">{dateOnly || "Loading..."}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t('settings.language.time_zone.time_only')}:
                </span>
                <span className="font-mono font-medium">{timeOnly || "Loading..."}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
                <span className="text-muted-foreground">{t('settings.language.time_zone.date_and_time')}:</span>
                <span className="font-mono font-medium">{dateWithTime || "Loading..."}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              {t('settings.language.time_zone.timezone_preview_description')}
            </p>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};