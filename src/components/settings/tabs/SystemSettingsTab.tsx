import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Shield, Download, Loader2, Check } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { useCompactMode } from "@/hooks/useCompactMode";
import { FeatureFlagsSettings } from "@/components/settings/FeatureFlagsSettings";
import { SettingsInheritanceInfo } from "../SettingsInheritanceInfo";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { useBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { NumberSequenceSettings } from "@/components/settings/NumberSequenceSettings";
import { InventoryDeductionSettings } from "@/components/settings/InventoryDeductionSettings";
import { StatusManagement } from "../user-management/StatusManagement";
import { toast } from "sonner";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";
import { AccentThemeSelector } from "./system/AccentThemeSelector";
import { NotificationSettingsCard } from "./system/NotificationSettingsCard";
import { SystemMaintenanceCard } from "./system/SystemMaintenanceCard";
import { useNavigate } from "react-router-dom";

export const SystemSettingsTab = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { compact, toggleCompact } = useCompactMode();
  const { data: profile } = useCurrentUserProfile();
  const { data: businessSettings, isLoading: isLoadingSettings } = useBusinessSettings();
  const updateBusinessSettings = useUpdateBusinessSettings();
  const navigate = useNavigate();
  
  // Terms & Conditions state
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  
  // Track original values for dirty state
  const [originalTerms, setOriginalTerms] = useState('');
  const [originalPrivacy, setOriginalPrivacy] = useState('');
  
  // Load existing values when businessSettings loads
  useEffect(() => {
    if (businessSettings) {
      const terms = businessSettings.general_terms_and_conditions || '';
      const privacy = businessSettings.privacy_policy || '';
      setTermsAndConditions(terms);
      setPrivacyPolicy(privacy);
      setOriginalTerms(terms);
      setOriginalPrivacy(privacy);
    }
  }, [businessSettings]);
  
  // Compute hasChanges for Terms section
  const hasTermsChanges = useMemo(() => {
    return termsAndConditions !== originalTerms || privacyPolicy !== originalPrivacy;
  }, [termsAndConditions, privacyPolicy, originalTerms, originalPrivacy]);
  
  const isTeamMember = profile?.parent_account_id && profile.parent_account_id !== profile.user_id;
  const isInheritingSettings = isTeamMember && businessSettings?.user_id !== profile?.user_id;

  const handleSaveTerms = async () => {
    if (!businessSettings?.id) {
      toast.error('Business settings not found');
      return;
    }
    
    try {
      await updateBusinessSettings.mutateAsync({
        id: businessSettings.id,
        general_terms_and_conditions: termsAndConditions,
        privacy_policy: privacyPolicy,
      });
      // Update original values after save
      setOriginalTerms(termsAndConditions);
      setOriginalPrivacy(privacyPolicy);
      toast.success('Terms & Conditions saved successfully');
    } catch (error) {
      console.error('Error saving terms:', error);
      toast.error('Failed to save Terms & Conditions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Help */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">System Settings</h3>
          <p className="text-sm text-muted-foreground">Configure app preferences and maintenance</p>
        </div>
        <SectionHelpButton sectionId="system" />
      </div>

      <SettingsInheritanceInfo 
        settingsType="system and feature" 
        isInheriting={isInheritingSettings}
      />
      
      {/* Feature Flags & Inventory Configuration */}
      <FeatureFlagsSettings />

      {/* Number Sequences Configuration */}
      <NumberSequenceSettings />

      {/* Inventory Deduction Configuration */}
      <InventoryDeductionSettings />

      {/* Status Management */}
      <StatusManagement />

      {/* Appearance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Appearance
          </CardTitle>
          <CardDescription>
            Theme, accent colors, and density preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme Mode</Label>
            <Select value={theme ?? 'system'} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Current: {resolvedTheme} mode</p>
          </div>

          <div className="space-y-3">
            <Label>Accent Color Palette</Label>
            <AccentThemeSelector />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                Compact mode
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] leading-none ${compact ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {compact ? 'ON' : 'OFF'}
                </span>
              </Label>
              <p className="text-xs text-muted-foreground">Denser layout with tighter spacing</p>
            </div>
            <Switch checked={compact} onCheckedChange={() => toggleCompact()} />
          </div>
        </CardContent>
      </Card>

      {/* Email Templates Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Templates
          </CardTitle>
          <CardDescription>
            Manage system email templates for automated communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/settings?tab=communications')}
          >
            <Mail className="h-4 w-4 mr-2" />
            Go to Email Templates
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings - Now uses persistent component */}
      <NotificationSettingsCard />

      {/* Terms & Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Terms & Conditions
          </CardTitle>
          <CardDescription>
            Manage your business terms and conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>General Terms & Conditions</Label>
            <Textarea 
              placeholder="Enter your general terms and conditions..."
              className="min-h-32"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Privacy Policy</Label>
            <Textarea 
              placeholder="Enter your privacy policy..."
              className="min-h-32"
              value={privacyPolicy}
              onChange={(e) => setPrivacyPolicy(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSaveTerms}
              disabled={!hasTermsChanges || updateBusinessSettings.isPending}
              variant={hasTermsChanges ? "default" : "secondary"}
            >
              {updateBusinessSettings.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : hasTermsChanges ? (
                "Save Changes"
              ) : (
                <><Check className="h-4 w-4 mr-1" /> Saved</>
              )}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance - Now uses functional component */}
      <SystemMaintenanceCard />
    </div>
  );
};
