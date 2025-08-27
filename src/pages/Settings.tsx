
import { BrandHeader } from "@/components/layout/BrandHeader";
import { UserProfile } from "@/components/layout/UserProfile";
import { SettingsView } from "@/components/settings/SettingsView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center animate-fade-in">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <h3 className="text-lg font-semibold text-foreground">Loading Settings...</h3>
            </div>
            <p className="text-muted-foreground">Please wait while we prepare your settings</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canAccessSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center animate-fade-in">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-red-500/10 rounded-lg inline-block mb-4">
              <SettingsIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Settings Access Required</h3>
            <p className="text-muted-foreground mb-6">You need profile or settings permissions to access this page.</p>
            <Button onClick={handleBackToApp} variant="outline" className="hover-lift">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Settings Header */}
      <header className="modern-card-elevated sticky top-0 z-40 backdrop-blur-lg bg-background/95 border-b border-border/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackToApp}
                className="flex items-center space-x-2 hover-lift interactive-bounce text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to App</span>
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SettingsIcon className="h-5 w-5 text-primary" />
                </div>
                <BrandHeader size="sm" />
              </div>
            </div>
            
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Enhanced Settings Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Card className="min-h-[calc(100vh-10rem)] hover:shadow-md transition-all duration-300">
          <CardContent className="p-8">
            <SettingsView />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
