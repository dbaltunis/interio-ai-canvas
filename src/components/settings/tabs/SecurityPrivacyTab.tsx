import React, { useState, useEffect } from 'react';
import { SettingsCard, SettingsSection, SettingsToggle, SettingsInput, SettingsAction } from '@/components/ui/settings-components';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useUserSecuritySettings, useUpdateUserSecuritySettings } from "@/hooks/useUserSecuritySettings";
import { 
  Shield, 
  Key, 
  Smartphone, 
  Clock, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  Fingerprint,
  History,
  Globe,
  Bell,
  Download
} from 'lucide-react';

export const SecurityPrivacyTab = () => {
  const { toast } = useToast();
  const { data: securitySettings, isLoading } = useUserSecuritySettings();
  const updateSecuritySettings = useUpdateUserSecuritySettings();
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load security settings from database
  useEffect(() => {
    if (securitySettings) {
      setTwoFactorEnabled(securitySettings.two_factor_enabled);
      setLoginNotifications(securitySettings.login_notifications);
      setSecurityAlerts(securitySettings.security_alerts);
    }
  }, [securitySettings]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both password fields match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    // Simulate password change
    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully"
      });
    }, 1000);
  };

  const handleEnable2FA = async () => {
    const newValue = true;
    setTwoFactorEnabled(newValue);
    updateSecuritySettings.mutate({ two_factor_enabled: newValue });
  };

  const handleDisable2FA = async () => {
    const newValue = false;
    setTwoFactorEnabled(newValue);
    updateSecuritySettings.mutate({ two_factor_enabled: newValue });
  };

  const handleLoginNotificationsChange = (checked: boolean) => {
    setLoginNotifications(checked);
    updateSecuritySettings.mutate({ login_notifications: checked });
  };

  const handleSecurityAlertsChange = (checked: boolean) => {
    setSecurityAlerts(checked);
    updateSecuritySettings.mutate({ security_alerts: checked });
  };

  const downloadDataArchive = () => {
    toast({
      title: "Data Export Started",
      description: "Your data archive will be ready for download shortly"
    });
  };

  const clearLoginHistory = () => {
    toast({
      title: "Login History Cleared",
      description: "All login history has been removed"
    });
  };

  const recentSessions = [
    { id: 1, device: 'MacBook Pro', location: 'New York, US', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'iPhone 14', location: 'New York, US', lastActive: '1 hour ago', current: false },
    { id: 3, device: 'Windows PC', location: 'Los Angeles, US', lastActive: '3 days ago', current: false },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <SettingsSection title="Authentication & Access" description="Secure your account with strong authentication methods">
        <SettingsCard
          title="Password Security"
          description="Update your account password"
          icon={<Key className="h-5 w-5 text-primary" />}
          status="enabled"
        >
          <div className="space-y-4">
            <SettingsInput
              label="Current Password"
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter your current password"
            />
            
            <SettingsInput
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Enter your new password"
            />
            
            <SettingsInput
              label="Confirm New Password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm your new password"
            />

            <SettingsToggle
              label="Show Passwords"
              checked={showPassword}
              onCheckedChange={setShowPassword}
              icon={showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            />

            <Button onClick={handlePasswordChange} className="hover-lift">
              Update Password
            </Button>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          icon={<Smartphone className="h-5 w-5 text-primary" />}
          status={twoFactorEnabled ? "enabled" : "disabled"}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Authenticator App</h4>
                <p className="text-xs text-muted-foreground">
                  Use Google Authenticator, Authy, or similar apps
                </p>
              </div>
              <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                {twoFactorEnabled ? "Active" : "Inactive"}
              </Badge>
            </div>

            {!twoFactorEnabled ? (
              <SettingsAction
                title="Enable Two-Factor Authentication"
                description="Secure your account with 2FA"
                actionLabel="Enable 2FA"
                onAction={handleEnable2FA}
                icon={<Shield className="h-4 w-4" />}
                variant="success"
                loading={updateSecuritySettings.isPending}
              />
            ) : (
              <SettingsAction
                title="Disable Two-Factor Authentication"
                description="Remove 2FA protection from your account"
                actionLabel="Disable 2FA"
                onAction={handleDisable2FA}
                icon={<AlertTriangle className="h-4 w-4" />}
                variant="destructive"
                loading={updateSecuritySettings.isPending}
              />
            )}
          </div>
        </SettingsCard>

        <SettingsCard
          title="Biometric Authentication"
          description="Use fingerprint or face recognition for quick access"
          icon={<Fingerprint className="h-5 w-5 text-primary" />}
          status={biometricsEnabled ? "enabled" : "disabled"}
        >
          <SettingsToggle
            label="Enable Biometric Login"
            description="Use biometric authentication when available"
            checked={biometricsEnabled}
            onCheckedChange={setBiometricsEnabled}
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Session Management" description="Monitor and manage your active login sessions">
        <SettingsCard
          title="Active Sessions"
          description="Monitor and manage your active login sessions"
          icon={<Globe className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{session.device}</span>
                      {session.current && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.location} • {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="destructive" size="sm">
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Security Notifications" description="Stay informed about account security events">
        <SettingsCard
          title="Login Alerts"
          description="Get notified when someone logs into your account"
          icon={<Bell className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-4">
            <SettingsToggle
              label="Login Notifications"
              description="Email notifications for new login attempts"
              checked={loginNotifications}
              onCheckedChange={handleLoginNotificationsChange}
              disabled={isLoading || updateSecuritySettings.isPending}
            />
            
            <SettingsToggle
              label="Security Alerts"
              description="Notifications for suspicious account activity"
              checked={securityAlerts}
              onCheckedChange={handleSecurityAlertsChange}
              disabled={isLoading || updateSecuritySettings.isPending}
            />
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Privacy & Data" description="Control how your data is used and shared">
        <SettingsCard
          title="Data Sharing"
          description="Control what data is shared for service improvement"
          icon={<Shield className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-4">
            <SettingsToggle
              label="Analytics Data"
              description="Share usage analytics to help improve the service"
              checked={analyticsOptIn}
              onCheckedChange={setAnalyticsOptIn}
            />
            
            <SettingsToggle
              label="Third-party Data Sharing"
              description="Allow data sharing with integrated services"
              checked={dataSharing}
              onCheckedChange={setDataSharing}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Data Management"
          description="Download or delete your personal data"
          icon={<History className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-4">
            <SettingsAction
              title="Download Your Data"
              description="Export all your personal data in a portable format"
              actionLabel="Download Archive"
              onAction={downloadDataArchive}
              icon={<Download className="h-4 w-4" />}
            />
            
            <SettingsAction
              title="Clear Login History"
              description="Remove all stored login history and session data"
              actionLabel="Clear History"
              onAction={clearLoginHistory}
              icon={<History className="h-4 w-4" />}
              variant="destructive"
            />
          </div>
        </SettingsCard>
      </SettingsSection>
    </div>
  );
};