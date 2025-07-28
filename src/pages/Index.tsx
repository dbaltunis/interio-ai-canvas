
import { useState, useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { ResponsiveHeader } from "@/components/layout/ResponsiveHeader";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useAuth } from "@/components/auth/AuthProvider";

// Lazy load heavy components
const Dashboard = lazy(() => import("@/components/dashboard/Dashboard"));
const JobsPage = lazy(() => import("@/components/jobs/JobsPage"));
const LibraryPage = lazy(() => import("@/components/library/LibraryPage"));
const ClientManagement = lazy(() => import("@/components/jobs/ClientManagement"));
const EmailManagement = lazy(() => import("@/components/jobs/EmailManagement"));
const CalendarView = lazy(() => import("@/components/calendar/CalendarView"));

// Skeleton loading components
import { DashboardSkeleton } from "@/components/dashboard/skeleton/DashboardSkeleton";
import { JobsPageSkeleton } from "@/components/jobs/skeleton/JobsPageSkeleton";
import { ClientManagementSkeleton } from "@/components/clients/skeleton/ClientManagementSkeleton";
import { GenericPageSkeleton } from "@/components/skeleton/GenericPageSkeleton";

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
      <div className="animate-fade-in">{children}</div>
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
          <Suspense fallback={<GenericPageSkeleton />}>
            <ComponentWrapper>
              <EmailManagement />
            </ComponentWrapper>
          </Suspense>
        );
      case "inventory":
        return (
          <Suspense fallback={<GenericPageSkeleton />}>
            <ComponentWrapper>
              <LibraryPage />
            </ComponentWrapper>
          </Suspense>
        );
      case 'calendar':
        return (
          <Suspense fallback={<GenericPageSkeleton />}>
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
