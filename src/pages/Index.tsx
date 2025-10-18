
import { useState, useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { ResponsiveHeader } from "@/components/layout/ResponsiveHeader";
import { useAuth } from "@/components/auth/AuthProvider";
import { motion } from "framer-motion";
import { AIBackground } from "@/components/common/AIBackground";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";


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
const MeasurementWizardDemo = lazy(() => 
  import("@/components/measurement-wizard/MeasurementWizardDemo").catch(() => ({ default: () => <div>Error loading Measurement Wizard</div> }))
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
    const tab = savedTab || urlTab || "projects";
    console.log('Index: Initial tab =', tab, 'savedTab =', savedTab, 'urlTab =', urlTab);
    return tab;
  });
  const { signOut, user } = useAuth();
  
  // Enable session timeout tracking
  useSessionTimeout();

  console.log('Index: Rendering with activeTab =', activeTab, 'user =', user?.email || 'no user');
  console.log('Index: Render time =', new Date().toISOString());

  // Update URL when active tab changes, but only if it's different from current URL
  useEffect(() => {
    const currentTab = searchParams.get('tab') || "projects";
    if (activeTab !== currentTab) {
      console.warn('[NAV] Index: setSearchParams called - activeTab:', activeTab, 'currentTab:', currentTab);
      setSearchParams({ tab: activeTab }, { replace: true });
    }
    // Save to sessionStorage for persistence
    sessionStorage.setItem('active_tab', activeTab);
  }, [activeTab]); // Removed searchParams and setSearchParams from deps to prevent resets

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
      case 'calendar':
        return (
          <Suspense fallback={<CalendarSkeleton />}>
            <ComponentWrapper>
              <CalendarView />
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
        <div className="relative min-h-screen">
          <ResponsiveHeader activeTab={activeTab} onTabChange={handleTabChange} />

          <motion.main 
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveComponent()}
          </motion.main>
          
          
        </div>
      </AIBackground>
    </OnboardingProvider>
  );
};

export default Index;
