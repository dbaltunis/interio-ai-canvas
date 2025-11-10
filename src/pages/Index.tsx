
import { useState, useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { ResponsiveHeader } from "@/components/layout/ResponsiveHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/components/auth/AuthProvider";
import { AIBackground } from "@/components/common/AIBackground";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { OrderingHubPage } from "@/components/ordering/OrderingHubPage";


// Lazy load heavy components with proper error handling
const Dashboard = lazy(() => 
  import("@/components/dashboard/Dashboard").catch(() => ({ default: () => <div>Error loading Dashboard</div> }))
);
const OnlineStorePage = lazy(() =>
  import("@/pages/OnlineStore").catch(() => ({ default: () => <div>Error loading Online Store</div> }))
);
const JobsPage = lazy(() => 
  import("@/components/jobs/JobsPage").catch(() => ({ default: () => <div>Error loading Jobs</div> }))
);
const LibraryPage = lazy(() => 
  import("@/components/library/LibraryPage").catch(() => ({ default: () => <div>Error loading Library</div> }))
);
const ClientManagement = lazy(() => 
  import("@/components/jobs/ClientManagement").then(module => ({
    default: (props: any) => <module.default {...props} />
  })).catch(() => ({ default: () => <div>Error loading Clients</div> }))
);
const EmailManagement = lazy(() => 
  import("@/components/jobs/EmailManagement").catch(() => ({ default: () => <div>Error loading Emails</div> }))
);
const CalendarView = lazy(() => 
  import("@/components/calendar/CalendarView").catch(() => ({ default: () => <div>Error loading Calendar</div> }))
);
const MobileSettings = lazy(() => 
  import("@/pages/MobileSettings").catch(() => ({ default: () => <div>Error loading Settings</div> }))
);
const MeasurementWizardDemo = lazy(() => 
  import("@/components/measurement-wizard/MeasurementWizardDemo").catch(() => ({ default: () => <div>Error loading Measurement Wizard</div> }))
);
const BugReportsPage = lazy(() =>
  import("@/pages/BugReportsPage").catch(() => ({ default: () => <div>Error loading Bug Reports</div> }))
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

  console.log('Index: Rendering with activeTab =', activeTab, 'user =', user?.email || 'no user');
  console.log('Index: Render time =', new Date().toISOString());

  // Sync activeTab with URL (single source of truth)
  useEffect(() => {
    const urlTab = searchParams.get('tab') || "dashboard";
    if (urlTab !== activeTab) {
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
            <ComponentWrapper>
              <Dashboard />
            </ComponentWrapper>
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
            <ComponentWrapper>
              <JobsPage key="jobs-persistent" />
            </ComponentWrapper>
          </Suspense>
        );
      case "clients":
        return (
          <Suspense fallback={<ClientManagementSkeleton />}>
            <ComponentWrapper>
              <ClientManagement onTabChange={handleTabChange} />
            </ComponentWrapper>
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
            <ComponentWrapper>
              <JobsPage key="jobs-persistent" />
            </ComponentWrapper>
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
