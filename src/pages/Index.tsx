
import { useState, useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { ResponsiveHeader } from "@/components/layout/ResponsiveHeader";
import { useAuth } from "@/components/auth/AuthProvider";

// Lazy load heavy components with proper error handling
const Dashboard = lazy(() => 
  import("@/components/dashboard/Dashboard").catch(() => ({ default: () => <div>Error loading Dashboard</div> }))
);
const JobsPage = lazy(() => 
  import("@/components/jobs/JobsPage").catch(() => ({ default: () => <div>Error loading Jobs</div> }))
);
const LibraryPage = lazy(() => 
  import("@/components/library/LibraryPage").catch(() => ({ default: () => <div>Error loading Library</div> }))
);
const ClientManagement = lazy(() => 
  import("@/components/jobs/ClientManagement").catch(() => ({ default: () => <div>Error loading Clients</div> }))
);
const EmailManagement = lazy(() => 
  import("@/components/jobs/EmailManagement").catch(() => ({ default: () => <div>Error loading Emails</div> }))
);
const CalendarView = lazy(() => 
  import("@/components/calendar/CalendarView").catch(() => ({ default: () => <div>Error loading Calendar</div> }))
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
    // Default to "projects" (Jobs page) instead of "jobs"
    const tab = searchParams.get('tab') || "projects";
    console.log('Index: Initial tab =', tab);
    return tab;
  });
  const { signOut, user } = useAuth();

  console.log('Index: Rendering with activeTab =', activeTab, 'user =', user?.email || 'no user');
  console.log('Index: Render time =', new Date().toISOString());

  // Update URL when active tab changes, but only if it's different from current URL
  useEffect(() => {
    const currentTab = searchParams.get('tab') || "projects";
    if (activeTab !== currentTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderActiveComponent = () => {
    const ComponentWrapper = ({ children }: { children: React.ReactNode }) => (
      <ErrorBoundary>
        <div className="animate-fade-in">{children}</div>
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
      case "projects":
        return (
          <Suspense fallback={<JobsPageSkeleton />}>
            <ComponentWrapper>
              <JobsPage />
            </ComponentWrapper>
          </Suspense>
        );
      case "clients":
        return (
          <Suspense fallback={<ClientManagementSkeleton />}>
            <ComponentWrapper>
              <ClientManagement />
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
      case 'calendar':
        return (
          <Suspense fallback={<CalendarSkeleton />}>
            <ComponentWrapper>
              <CalendarView />
            </ComponentWrapper>
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<JobsPageSkeleton />}>
            <ComponentWrapper>
              <JobsPage />
            </ComponentWrapper>
          </Suspense>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Use the new ResponsiveHeader */}
      <ResponsiveHeader activeTab={activeTab} onTabChange={handleTabChange} />


      {/* Main Content - Full Width with smooth transitions */}
      <main className="w-full">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default Index;
