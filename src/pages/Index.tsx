import { useState, useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { ResponsiveHeader } from "@/components/layout/ResponsiveHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/components/auth/AuthProvider";
import { AIBackground } from "@/components/common/AIBackground";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useEnsureDefaultSequences } from "@/hooks/useNumberSequences";
import { OrderingHubPage } from "@/components/ordering/OrderingHubPage";
import { Button } from "@/components/ui/button";


// Lazy load heavy components with proper error handling
const Dashboard = lazy(() => 
  import("@/components/dashboard/Dashboard").catch((error) => {
    console.error('❌ Failed to load Dashboard:', error);
    return { 
      default: () => (
        <div className="p-6 text-center space-y-3">
          <p className="text-destructive">Failed to load Dashboard</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    };
  })
);
const MyTasksPage = lazy(() => 
  import("@/pages/MyTasksPage").then(m => ({ default: m.MyTasksPage })).catch((error) => {
    console.error('❌ Failed to load Tasks:', error);
    return { 
      default: () => (
        <div className="p-6 text-center space-y-3">
          <p className="text-destructive">Failed to load Tasks</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    };
  })
);
const OnlineStorePage = lazy(() =>
  import("@/pages/OnlineStore").catch((error) => {
    console.error('❌ Failed to load Online Store:', error);
    return { 
      default: () => (
        <div className="p-6 text-center space-y-3">
          <p className="text-destructive">Failed to load Online Store</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    };
  })
);
const JobsPage = lazy(() => 
  import("@/components/jobs/JobsPage").catch((error) => {
    console.error('❌ Failed to load Jobs:', error);
    return { 
      default: () => (
        <div className="p-6 text-center space-y-3">
          <p className="text-destructive">Failed to load Jobs</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    };
  })
);
const LibraryPage = lazy(() => 
  import("@/components/library/LibraryPage").catch((error) => {
    console.error('❌ Failed to load Library:', error);
    return { 
      default: () => (
        <div className="p-6 text-center space-y-3">
          <p className="text-destructive">Failed to load Library</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    };
  })
);
const ClientManagement = lazy(() => 
  import("@/components/jobs/ClientManagement").then(module => ({
    default: (props: any) => <module.default {...props} />
  })).catch((error) => {
    console.error('❌ Failed to load Clients:', error);
    return { 
      default: () => (
        <div className="p-6 text-center space-y-3">
          <p className="text-destructive">Failed to load Clients</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    };
  })
);
const EmailManagement = lazy(() => 
  import("@/components/jobs/EmailManagement").catch((error) => {
    console.error('❌ Failed to load EmailManagement:', error);
    return { 
      default: () => (
        <div className="p-6 text-center space-y-3">
          <p className="text-destructive">Failed to load Emails</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    };
  })
);
const CalendarView = lazy(() => 
  import("@/components/calendar/CalendarView").catch((error) => {
    console.error('❌ Failed to load Calendar:', error);
    return { 
      default: () => (
        <div className="p-6 text-center space-y-3">
          <p className="text-destructive">Failed to load Calendar</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    };
  })
);
const MobileSettings = lazy(() => 
  import("@/pages/MobileSettings").catch((error) => {
    console.error('❌ Failed to load Settings:', error);
    return { 
      default: () => (
        <div className="p-6 text-center space-y-3">
          <p className="text-destructive">Failed to load Settings</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    };
  })
);
const MeasurementWizardDemo = lazy(() => 
  import("@/components/measurement-wizard/MeasurementWizardDemo").catch((error) => {
    console.error('❌ Failed to load Measurement Wizard:', error);
    return { 
      default: () => (
        <div className="p-6 text-center space-y-3">
          <p className="text-destructive">Failed to load Measurement Wizard</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    };
  })
);
const BugReportsPage = lazy(() =>
  import("@/pages/BugReportsPage").catch((error) => {
    console.error('❌ Failed to load Bug Reports:', error);
    return { 
      default: () => (
        <div className="p-6 text-center space-y-3">
          <p className="text-destructive">Failed to load Bug Reports</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    };
  })
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
  
  // Enable session timeout tracking
  useSessionTimeout();
  
  // Ensure default number sequences exist for all new users
  useEnsureDefaultSequences();

  console.log('Index: Rendering with activeTab =', activeTab, 'user =', user?.email || 'no user');
  console.log('Index: Render time =', new Date().toISOString());

  // Sync activeTab with URL (single source of truth)
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    // ONLY sync from URL if URL actually has a tab parameter
    // Don't override sessionStorage when URL has no tab
    if (urlTab && urlTab !== activeTab) {
      console.warn('[NAV] Index: Syncing activeTab from URL:', urlTab);
      setActiveTab(urlTab);
      sessionStorage.setItem('active_tab', urlTab);
    }
  }, [searchParams, activeTab]);

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
        return (
          <Suspense fallback={<EmailManagementSkeleton />}>
            <ComponentWrapper>
              <EmailManagement />
            </ComponentWrapper>
          </Suspense>
        );
      case "inventory":
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
        </div>
      </AIBackground>
    </OnboardingProvider>
  );
};

export default Index;
