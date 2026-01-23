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
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-settings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[Settings] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if user has ANY explicit permissions in the table
  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;
  
  // Check if view_settings is explicitly in user_permissions table
  const hasViewSettingsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_settings'
  ) ?? false;

  // Works like jobs, clients, inventory, and emails:
  // - System Owner: always has access
  // - Owner/Admin: only bypass restrictions if NO explicit permissions exist in table at all
  //   If ANY explicit permissions exist, respect ALL settings (missing = disabled)
  // - Staff/Regular users: Always check explicit permissions
  const canViewSettings = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasViewSettingsPermission
        : hasViewSettingsPermission;
  
  const handleBackToApp = () => {
    navigate('/', { replace: true });
  };


  // Let parent Suspense handle loading state
  if (permissionsLoading || explicitPermissions === undefined || roleLoading) {
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
