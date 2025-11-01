import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";

interface SettingsInheritanceInfoProps {
  settingsType: string;
  isInheriting?: boolean;
}

export const SettingsInheritanceInfo = ({ 
  settingsType, 
  isInheriting = false 
}: SettingsInheritanceInfoProps) => {
  const { data: profile } = useCurrentUserProfile();
  
  const isTeamMember = profile?.parent_account_id && profile.parent_account_id !== profile.user_id;
  
  if (!isTeamMember) return null;
  
  return (
    <Alert className="bg-brand-accent/10 border-brand-accent">
      <Info className="h-4 w-4 text-brand-accent" />
      <AlertDescription className="text-sm">
        {isInheriting ? (
          <>
            You are using the organization's {settingsType} settings. 
            Changes made here will create your own custom settings.
          </>
        ) : (
          <>
            You have custom {settingsType} settings. To use the organization's settings,
            delete your custom settings.
          </>
        )}
      </AlertDescription>
    </Alert>
  );
};
