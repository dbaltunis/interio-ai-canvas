
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

// Simple loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-lg text-brand-neutral">Loading...</div>
  </div>
);

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
    switch (activeTab) {
      case "dashboard":
        return (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        );
      case "projects":
        return (
          <Suspense fallback={<PageLoader />}>
            <JobsPage />
          </Suspense>
        );
      case "clients":
        return (
          <Suspense fallback={<PageLoader />}>
            <ClientManagement />
          </Suspense>
        );
      case "quotes":
        return (
          <Suspense fallback={<PageLoader />}>
            <EmailManagement />
          </Suspense>
        );
      case "inventory":
        return (
          <Suspense fallback={<PageLoader />}>
            <LibraryPage />
          </Suspense>
        );
      case 'calendar':
        return (
          <Suspense fallback={<PageLoader />}>
            <CalendarView />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<PageLoader />}>
            <JobsPage />
          </Suspense>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Use the new ResponsiveHeader */}
      <ResponsiveHeader activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content - Full Width */}
      <main className="w-full">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default Index;
