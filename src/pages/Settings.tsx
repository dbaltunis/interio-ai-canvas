
import { BrandHeader } from "@/components/layout/BrandHeader";
import { UserProfile } from "@/components/layout/UserProfile";
import { SettingsView } from "@/components/settings/SettingsView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useHasPermission } from "@/hooks/usePermissions";

const Settings = () => {
  const hasViewSettings = useHasPermission('view_settings');
  const hasViewProfile = useHasPermission('view_profile');
  const canAccessSettings = hasViewSettings || hasViewProfile;
  
  const handleBackToApp = () => {
    window.location.href = "/";
  };

  // Show loading while permissions are being checked
  if (hasViewSettings === undefined || hasViewProfile === undefined) {
    return (
      <div className="min-h-screen ai-gradient-bg flex items-center justify-center">
        <div className="liquid-glass p-8 rounded-xl border text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">Loading...</h3>
        </div>
      </div>
    );
  }

  if (!canAccessSettings) {
    return (
      <div className="min-h-screen ai-gradient-bg flex items-center justify-center">
        <div className="liquid-glass p-8 rounded-xl border text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">Settings Access Required</h3>
          <p className="text-muted-foreground mb-4">You need profile or settings permissions to access this page.</p>
          <Button onClick={handleBackToApp} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to App
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ai-gradient-bg">
      {/* Settings Header */}
      <header className="glass-morphism border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackToApp}
                className="flex items-center space-x-2 text-brand-neutral hover:text-brand-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to App</span>
              </Button>
              <div className="h-6 w-px bg-brand-secondary/20" />
              <BrandHeader size="sm" />
            </div>
            
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="liquid-glass rounded-xl border min-h-[calc(100vh-8rem)]">
          <div className="p-6">
            <SettingsView />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
