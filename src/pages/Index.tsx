
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
    return searchParams.get('tab') || "projects";
  });
  const { signOut } = useAuth();

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
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-brand-neutral">Calendar</h1>
            <div className="text-center text-brand-neutral/70">
              Calendar functionality coming soon...
            </div>
          </div>
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
