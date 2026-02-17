import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ResponsiveHeader } from "@/components/layout/ResponsiveHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/components/auth/AuthProvider";
import { AIBackground } from "@/components/common/AIBackground";
// OnboardingProvider removed - unified into Tips & Guidance in Team Hub
// Session timeout removed - users stay logged in via Supabase auto-refresh (v2.3.7)
import { useEnsureDefaultSequences } from "@/hooks/useNumberSequences";
import { OrderingHubPage } from "@/components/ordering/OrderingHubPage";
import { Button } from "@/components/ui/button";
import { VersionFooter } from "@/components/version/VersionFooter";
import { useHasPermission } from "@/hooks/usePermissions";
import { Loader2 } from "lucide-react";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useIsDealer } from "@/hooks/useIsDealer";

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
import { GenericPageSkeleton } from "@/components/skeleton/GenericPageSkeleton";

// Tab order for swipe navigation
const TAB_ORDER = ["dashboard", "projects", "clients", "calendar"];

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
  // Navigation history stack for proper back navigation (iOS-style)
  const [navigationHistory, setNavigationHistory] = useState<string[]>(() => {
    const savedTab = sessionStorage.getItem('active_tab');
    const urlTab = searchParams.get('tab');
    const initialTab = savedTab || urlTab || "dashboard";
    return [initialTab];
  });
  const { signOut, user } = useAuth();
  const isMobile = useIsMobile();
  
  // Permission checks — useHasPermission merges role defaults + custom permissions.
  // Owner/Admin always has full access. Custom permissions are additive, never subtractive.
  const canViewInventory = useHasPermission('view_inventory') !== false;
  const canViewEmails = useHasPermission('view_emails') !== false;
  const permissionsLoading = useHasPermission('view_settings') === undefined;
  const { data: isDealer } = useIsDealer();
  
  // Session timeout removed in v2.3.7 - users stay logged in via Supabase auto-refresh
  
  // Ensure default number sequences exist for all new users
  useEnsureDefaultSequences();

  // Preload core tabs after initial render — eliminates skeleton flash on tab switch
  useEffect(() => {
    const timer = setTimeout(() => {
      import("@/components/jobs/JobsPage");
      import("@/components/calendar/CalendarView");
      import("@/components/jobs/ClientManagement");
      import("@/components/library/LibraryPage");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Redirect away from restricted tabs if user doesn't have permission
  useEffect(() => {
    if (permissionsLoading) return;

    const restricted: Record<string, boolean> = {
      inventory: !canViewInventory,
      emails: !canViewEmails,
      // Dealers cannot access these tabs via URL
      calendar: !!isDealer,
      'ordering-hub': !!isDealer,
      'online-store': !!isDealer,
      tasks: !!isDealer,
      'bug-reports': !!isDealer,
    };

    const urlTab = searchParams.get('tab');
    const blocked = restricted[activeTab] || (urlTab && restricted[urlTab]);

    if (blocked) {
      setSearchParams({ tab: 'dashboard' }, { replace: true });
      setActiveTab('dashboard');
      sessionStorage.setItem('active_tab', 'dashboard');
    }
  }, [canViewInventory, canViewEmails, isDealer, activeTab, searchParams, setSearchParams, permissionsLoading]);

  // Sync activeTab with URL
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== activeTab) {
      if (permissionsLoading) return;
      setActiveTab(urlTab);
      sessionStorage.setItem('active_tab', urlTab);
    }
  }, [searchParams, activeTab, permissionsLoading]);


  const handleTabChange = useCallback((tabId: string, isBackNavigation = false) => {
    console.warn('[NAV] Index: handleTabChange called with:', tabId, 'isBack:', isBackNavigation);
    
    if (!isBackNavigation) {
      // Add to history stack (only for forward navigation)
      setNavigationHistory(prev => [...prev.slice(-9), tabId]); // Keep last 10 items
    }
    
    setSearchParams({ tab: tabId }, { replace: true });
    sessionStorage.setItem('active_tab', tabId);
  }, [setSearchParams]);

  // Swipe RIGHT = go back to previous screen (iOS-style back gesture)
  const handleSwipeBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      // Pop current from history and go to previous
      const newHistory = navigationHistory.slice(0, -1);
      const previousTab = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      handleTabChange(previousTab, true); // true = is back navigation
    }
  }, [navigationHistory, handleTabChange]);

  // Only swipe RIGHT for back navigation (no forward swipe)
  useSwipeNavigation({
    onSwipeRight: handleSwipeBack,
    // NO onSwipeLeft - forward navigation only via taps
    enabled: isMobile,
    edgeWidth: 40,
    threshold: 60,
    velocityThreshold: 0.3,
  });

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
          <Suspense fallback={<GenericPageSkeleton />}>
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
        if (!permissionsLoading && !canViewEmails) {
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
        // Only show access denied when permissions are LOADED and denied
        if (!permissionsLoading && canViewInventory === false) {
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
        // Single Suspense handles ALL loading - component returns null while loading permissions
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
          <Suspense fallback={<GenericPageSkeleton />}>
            <ComponentWrapper>
              <MobileSettings />
            </ComponentWrapper>
          </Suspense>
        );
      case 'measurement':
        return (
          <Suspense fallback={<GenericPageSkeleton />}>
            <ComponentWrapper>
              <MeasurementWizardDemo />
            </ComponentWrapper>
          </Suspense>
        );
      case 'bug-reports':
        return (
          <Suspense fallback={<GenericPageSkeleton />}>
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
    <AIBackground variant="subtle" className="min-h-screen w-full">
      <div className="relative min-h-screen pb-20 lg:pb-0 pt-safe lg:pt-0">
        <ResponsiveHeader activeTab={activeTab} onTabChange={handleTabChange} />

        <main className="w-full overflow-hidden">
          {renderActiveComponent()}
        </main>
        
        <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        
      </div>
    </AIBackground>
  );
};

export default Index;
