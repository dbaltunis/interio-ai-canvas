// Quote Template System v2.0.0 - Bug Fixes Applied
import { BrandHeader } from "@/components/layout/BrandHeader";
import { UserProfile } from "@/components/layout/UserProfile";
import { SettingsView } from "@/components/settings/SettingsView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { useHasPermission } from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Settings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const hasViewSettings = useHasPermission('view_settings');
  const hasViewProfile = useHasPermission('view_profile');
  const canAccessSettings = hasViewSettings || hasViewProfile;
  
  const handleBackToApp = () => {
    navigate('/', { replace: true });
  };

  // Show loading while permissions are being checked
  if (hasViewSettings === undefined || hasViewProfile === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <Card className="max-w-md border-border/50">
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
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <Card className="max-w-md border-border/50">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-destructive/10 rounded-lg inline-block mb-4">
              <SettingsIcon className="h-8 w-8 text-destructive" />
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
    <div className="min-h-screen bg-background">
      {/* App-style Header - Like Jobs page */}
      {!isMobile && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                {/* App Logo/Brand */}
                <BrandHeader size="sm" />
                
                {/* Back to App link */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToApp}
                  className="text-muted-foreground hover:text-foreground gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to App</span>
                </Button>
              </div>
              
              <UserProfile />
            </div>
          </div>
        </header>
      )}

      {/* Settings Content */}
      <main className={cn(
        "animate-fade-in",
        isMobile ? "p-4 pb-20" : "px-4 sm:px-6 lg:px-8 py-6"
      )}>
        <div className="max-w-6xl mx-auto">
          <SettingsView />
        </div>
      </main>
    </div>
  );
};

export default Settings;
