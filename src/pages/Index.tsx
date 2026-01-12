import { useState, useEffect, Suspense, lazy, ComponentType } from "react";
import { useSearchParams } from "react-router-dom";
import { ResponsiveHeader } from "@/components/layout/ResponsiveHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/components/auth/AuthProvider";
import { AIBackground } from "@/components/common/AIBackground";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
// Session timeout removed - users stay logged in via Supabase auto-refresh (v2.3.7)
import { useEnsureDefaultSequences } from "@/hooks/useNumberSequences";
import { OrderingHubPage } from "@/components/ordering/OrderingHubPage";
import { Button } from "@/components/ui/button";
import { VersionFooter } from "@/components/version/VersionFooter";
import { useHasPermission, useUserPermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";


/**
 * Lazy load helper with automatic retry and exponential backoff.
 * Handles intermittent module loading failures (HMR, caching, network).
 */
function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  moduleName: string,
  maxRetries = 3
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Wait before retry with exponential backoff (1s, 2s, 4s)
        if (attempt > 0) {
          console.log(`🔄 Retrying ${moduleName} (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
        
        const module = await importFn();
        if (attempt > 0) {
          console.log(`✅ ${moduleName} loaded successfully after ${attempt + 1} attempts`);
        }
        return module;
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Failed to load ${moduleName} (attempt ${attempt + 1}/${maxRetries}):`, error);
      }
    }
    
    // All retries failed - return error component
    console.error(`❌ Failed to load ${moduleName} after ${maxRetries} attempts:`, lastError);
    
    return {
      default: (() => (
        <div className="p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
            <RefreshCw className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-destructive font-medium">Failed to load {moduleName}</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {lastError?.message || 'An unexpected error occurred'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </Button>
        </div>
      )) as unknown as T
    };
  });
}

// Lazy load heavy components with automatic retry
const Dashboard = lazyWithRetry(
  () => import("@/components/dashboard/Dashboard"),
  "Dashboard"
);

const MyTasksPage = lazyWithRetry(
  () => import("@/pages/MyTasksPage").then(m => ({ default: m.MyTasksPage })),
  "Tasks"
);

const OnlineStorePage = lazyWithRetry(
  () => import("@/pages/OnlineStore"),
  "Online Store"
);

const JobsPage = lazyWithRetry(
  () => import("@/components/jobs/JobsPage"),
  "Jobs"
);

const LibraryPage = lazyWithRetry(
  () => import("@/components/library/LibraryPage"),
  "Library"
);

const ClientManagement = lazyWithRetry(
  () => import("@/components/jobs/ClientManagement").then(module => ({
    default: (props: any) => <module.default {...props} />
  })),
  "Clients"
);

const EmailManagement = lazyWithRetry(
  () => import("@/components/jobs/EmailManagement"),
  "Emails"
);

const CalendarView = lazyWithRetry(
  () => import("@/components/calendar/CalendarView"),
  "Calendar"
);

const MobileSettings = lazyWithRetry(
  () => import("@/pages/MobileSettings"),
  "Settings"
);

const MeasurementWizardDemo = lazyWithRetry(
  () => import("@/components/measurement-wizard/MeasurementWizardDemo"),
  "Measurement Wizard"
);

const BugReportsPage = lazyWithRetry(
  () => import("@/pages/BugReportsPage"),
  "Bug Reports"
);

// Skeleton loading components
import { DashboardSkeleton } from "@/components/dashboard/skeleton/DashboardSkeleton";
import { JobsPageSkeleton } from "@/components/jobs/skeleton/JobsPageSkeleton";
import { ClientManagementSkeleton } from "@/components/clients/skeleton/ClientManagementSkeleton";
import { CalendarSkeleton } from "@/components/calendar/skeleton/CalendarSkeleton";
import { EmailManagementSkeleton } from "@/components/jobs/email/skeleton/EmailManagementSkeleton";
import { InventorySkeleton } from "@/components/inventory/skeleton/InventorySkeleton";
import { ErrorBoundary } from "@/components/performance/ErrorBoundary";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Check sessionStorage first for persistence across page focus/blur
    const savedTab = sessionStorage.getItem('active_tab');
    const urlTab = searchParams.get('tab');
    const tab = savedTab || urlTab || "dashboard";
    console.log('Index: Initial tab =', tab, 'savedTab =', savedTab, 'urlTab =', urlTab);
    return tab;
  });
  const { signOut, user } = useAuth();
  
  // Permission checks for tab access control - works like jobs and clients
  // Check explicit permissions first, then fall back to role-based
  const { data: userRoleData } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[Index] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });
  
  // Check if user has ANY explicit permissions in the table
  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;
  
  // Check if view_inventory is explicitly in user_permissions table
  const hasViewInventoryPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_inventory'
  ) ?? false;
  
  // Check if view_emails is explicitly in user_permissions table
  const hasViewEmailsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_emails'
  ) ?? false;
  
  // Works like jobs and clients:
  // - System Owner: always has access
  // - Owner/Admin: only bypass restrictions if NO explicit permissions exist in table at all
  //   If ANY explicit permissions exist, respect ALL settings (missing = disabled)
  // - Staff/Regular users: Always check explicit permissions
  const canViewInventory = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasViewInventoryPermission
        : hasViewInventoryPermission;

  const canViewEmails = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasViewEmailsPermission
        : hasViewEmailsPermission;
  
  // Session timeout removed in v2.3.7 - users stay logged in via Supabase auto-refresh
  
  // Ensure default number sequences exist for all new users
  useEnsureDefaultSequences();

  console.log('Index: Rendering with activeTab =', activeTab, 'canViewInventory =', canViewInventory, 'hasAnyExplicitPermissions =', hasAnyExplicitPermissions, 'hasViewInventoryPermission =', hasViewInventoryPermission, 'user =', user?.email || 'no user');
  console.log('Index: Render time =', new Date().toISOString());

  // CRITICAL: Redirect away from inventory tab if user doesn't have permission
  // This must run FIRST and check both URL and current state
  // Works like jobs and clients - checks explicit permissions first
  useEffect(() => {
    // Wait for permissions to load
    if (permissionsLoading || explicitPermissions === undefined) return;
    
    // Only redirect if permissions have loaded and user doesn't have permission
    if (canViewInventory === false) {
      const urlTab = searchParams.get('tab');
      const currentTab = activeTab;
      
      // If URL has inventory tab, redirect immediately
      if (urlTab === 'inventory') {
        console.warn('[NAV] Index: Blocking inventory tab in URL - user lacks permission, redirecting to dashboard');
        setSearchParams({ tab: 'dashboard' }, { replace: true });
        setActiveTab('dashboard');
        sessionStorage.setItem('active_tab', 'dashboard');
        return;
      }
      
      // If current active tab is inventory, redirect immediately
      if (currentTab === 'inventory') {
        console.warn('[NAV] Index: User lacks view_inventory permission, redirecting from inventory tab');
        setSearchParams({ tab: 'dashboard' }, { replace: true });
        setActiveTab('dashboard');
        sessionStorage.setItem('active_tab', 'dashboard');
      }
    }

    // Redirect away from emails tab if user doesn't have permission
    if (canViewEmails === false) {
      const urlTab = searchParams.get('tab');
      const currentTab = activeTab;
      
      // If URL has emails tab, redirect immediately
      if (urlTab === 'emails') {
        console.warn('[NAV] Index: Blocking emails tab in URL - user lacks permission, redirecting to dashboard');
        setSearchParams({ tab: 'dashboard' }, { replace: true });
        setActiveTab('dashboard');
        sessionStorage.setItem('active_tab', 'dashboard');
        return;
      }
      
      // If current active tab is emails, redirect immediately
      if (currentTab === 'emails') {
        console.warn('[NAV] Index: User lacks view_emails permission, redirecting from emails tab');
        setSearchParams({ tab: 'dashboard' }, { replace: true });
        setActiveTab('dashboard');
        sessionStorage.setItem('active_tab', 'dashboard');
      }
    }
  }, [canViewInventory, canViewEmails, activeTab, searchParams, setSearchParams, permissionsLoading, explicitPermissions]);

  // Sync activeTab with URL (single source of truth) - but validate permissions first
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    // ONLY sync from URL if URL actually has a tab parameter
    // Don't override sessionStorage when URL has no tab
    if (urlTab && urlTab !== activeTab) {
      // BLOCK inventory tab if user doesn't have permission (works like jobs and clients)
      if (urlTab === 'inventory') {
        // Wait for permissions to load
        if (permissionsLoading || explicitPermissions === undefined) {
          console.warn('[NAV] Index: Permission loading, deferring inventory tab until permission check completes');
          return;
        }
        // If permission is explicitly false, block it
        if (canViewInventory === false) {
          console.warn('[NAV] Index: Blocking inventory tab access - user lacks permission');
          setSearchParams({ tab: 'dashboard' }, { replace: true });
          setActiveTab('dashboard');
          sessionStorage.setItem('active_tab', 'dashboard');
          return;
        }
      }

      // BLOCK emails tab if user doesn't have permission (works like inventory)
      if (urlTab === 'emails') {
        // Wait for permissions to load
        if (permissionsLoading || explicitPermissions === undefined) {
          console.warn('[NAV] Index: Permission loading, deferring emails tab until permission check completes');
          return;
        }
        // If permission is explicitly false, block it
        if (canViewEmails === false) {
          console.warn('[NAV] Index: Blocking emails tab access - user lacks permission');
          setSearchParams({ tab: 'dashboard' }, { replace: true });
          setActiveTab('dashboard');
          sessionStorage.setItem('active_tab', 'dashboard');
          return;
        }
      }
      
      console.warn('[NAV] Index: Syncing activeTab from URL:', urlTab);
      setActiveTab(urlTab);
      sessionStorage.setItem('active_tab', urlTab);
    }
  }, [searchParams, activeTab, canViewInventory, setSearchParams, permissionsLoading, explicitPermissions]);

  const handleTabChange = (tabId: string) => {
    console.warn('[NAV] Index: handleTabChange called with:', tabId);
    setSearchParams({ tab: tabId }, { replace: true });
    sessionStorage.setItem('active_tab', tabId);
  };

  const renderActiveComponent = () => {
    const ComponentWrapper = ({ children }: { children: React.ReactNode }) => (
      <ErrorBoundary>
        <div>{children}</div>
      </ErrorBoundary>
    );

    switch (activeTab) {
      case "dashboard":
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard />
          </Suspense>
        );
      case "tasks":
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <MyTasksPage />
          </Suspense>
        );
      case "online-store":
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ComponentWrapper>
              <OnlineStorePage />
            </ComponentWrapper>
          </Suspense>
        );
      case "projects":
        return (
          <Suspense fallback={<JobsPageSkeleton />}>
            <JobsPage key="jobs-persistent" />
          </Suspense>
        );
      case "clients":
        return (
          <Suspense fallback={<ClientManagementSkeleton />}>
            <ClientManagement onTabChange={handleTabChange} />
          </Suspense>
        );
      case "quotes":
        return (
          <Suspense fallback={<EmailManagementSkeleton />}>
            <ComponentWrapper>
              <EmailManagement />
            </ComponentWrapper>
          </Suspense>
        );
      case "emails":
        // Only render if user has permission (after permissions are loaded)
        if (explicitPermissions !== undefined && !permissionsLoading && !canViewEmails) {
          return (
            <div className="p-6 text-center">
              <p className="text-destructive">You don't have permission to view emails.</p>
            </div>
          );
        }
        return (
          <Suspense fallback={<EmailManagementSkeleton />}>
            <ComponentWrapper>
              <EmailManagement />
            </ComponentWrapper>
          </Suspense>
        );
      case "inventory":
        // Check permission before rendering - redirect handled in useEffect above
        // Works like jobs and clients - checks explicit permissions first
        // If permissions are still loading, show loading state
        if (permissionsLoading || explicitPermissions === undefined) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <div className="text-lg text-muted-foreground">Loading permissions...</div>
              </div>
            </div>
          );
        }
        // If permission is explicitly false, show access denied
        if (canViewInventory === false) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-lg font-semibold">Access Denied</p>
                <p className="text-sm text-muted-foreground">You don't have permission to view the Library.</p>
                <Button variant="outline" onClick={() => handleTabChange('dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          );
        }
        // Only render if permission is true
        return (
          <Suspense fallback={<InventorySkeleton />}>
            <ComponentWrapper>
              <LibraryPage />
            </ComponentWrapper>
          </Suspense>
        );
      case "ordering-hub":
        return (
          <ComponentWrapper>
            <OrderingHubPage />
          </ComponentWrapper>
        );
      case 'calendar':
        return (
          <Suspense fallback={<CalendarSkeleton />}>
            <ComponentWrapper>
              <CalendarView />
            </ComponentWrapper>
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ComponentWrapper>
              <MobileSettings />
            </ComponentWrapper>
          </Suspense>
        );
      case 'measurement':
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ComponentWrapper>
              <MeasurementWizardDemo />
            </ComponentWrapper>
          </Suspense>
        );
      case 'bug-reports':
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ComponentWrapper>
              <BugReportsPage />
            </ComponentWrapper>
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<JobsPageSkeleton />}>
            <JobsPage key="jobs-persistent" />
          </Suspense>
        );
    }
  };

  return (
    <OnboardingProvider>
      <AIBackground variant="subtle" className="min-h-screen w-full">
        <div className="relative min-h-screen pb-20 lg:pb-0 pt-safe lg:pt-0">
          <ResponsiveHeader activeTab={activeTab} onTabChange={handleTabChange} />

          <main className="w-full">
            {renderActiveComponent()}
          </main>
          
          <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
          <VersionFooter />
        </div>
      </AIBackground>
    </OnboardingProvider>
  );
};

export default Index;
