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

  // Permission check — useHasPermission merges role defaults + custom permissions.
  // Owner/Admin always has full access. Custom permissions are additive, never subtractive.
  const canViewSettings = useHasPermission('view_settings');
  const permissionsLoading = canViewSettings === undefined;

  const handleBackToApp = () => {
    navigate('/', { replace: true });
  };

  // Show nothing while permissions are loading
  if (permissionsLoading) {
    return null;
  }

  if (canViewSettings === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center animate-fade-in">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-red-500/10 rounded-lg inline-block mb-4">
              <SettingsIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Settings Access Required</h3>
            <p className="text-muted-foreground mb-6">You don't have permission to view settings.</p>
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
      {/* Settings Header - Matches app navigation style */}
      {!isMobile && (
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToApp}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div className="h-5 w-px bg-border" />
                <BrandHeader size="sm" />
              </div>
              
              <div 
                onClick={() => {}} 
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <UserProfile />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Settings Content - No wrapper card, direct content */}
      <main className={cn(
        "animate-fade-in",
        isMobile ? "p-4 pb-20" : "px-4 sm:px-6 lg:px-8 py-6"
      )}>
        <SettingsView />
      </main>
    </div>
  );
};

export default Settings;
