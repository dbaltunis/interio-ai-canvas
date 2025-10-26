
import { useState, useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { ResponsiveHeader } from "@/components/layout/ResponsiveHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/components/auth/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { AIBackground } from "@/components/common/AIBackground";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useIsMobile } from "@/hooks/use-mobile";


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
const MobileSettings = lazy(() => 
  import("@/pages/MobileSettings").catch(() => ({ default: () => <div>Error loading Settings</div> }))
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
  const [direction, setDirection] = useState(0);
  const { signOut, user } = useAuth();
  const isMobile = useIsMobile();
  
  // Enable session timeout tracking
  useSessionTimeout();

  // Tab navigation order for swipe (exclude settings from swipe nav)
  const tabOrder = ["dashboard", "projects", "clients", "inventory", "calendar"];

  // Swipe navigation for mobile
  useSwipeNavigation({
    onSwipeLeft: () => {
      if (!isMobile) return;
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex < tabOrder.length - 1) {
        setDirection(1);
        setActiveTab(tabOrder[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      if (!isMobile) return;
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex > 0) {
        setDirection(-1);
        setActiveTab(tabOrder[currentIndex - 1]);
      }
    },
    threshold: 75
  });

  console.log('Index: Rendering with activeTab =', activeTab, 'user =', user?.email || 'no user');
  console.log('Index: Render time =', new Date().toISOString());

  // Sync activeTab state with URL changes
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== activeTab) {
      console.warn('[NAV] Index: URL changed, updating activeTab from', activeTab, 'to', urlTab);
      setActiveTab(urlTab);
      sessionStorage.setItem('active_tab', urlTab);
    }
  }, [searchParams]);

  // Update URL when activeTab changes internally (from UI clicks, not from navigation)
  useEffect(() => {
    const currentTab = searchParams.get('tab') || "projects";
    if (activeTab !== currentTab) {
      console.warn('[NAV] Index: activeTab changed, updating URL from', currentTab, 'to', activeTab);
      // Preserve other search params like eventId
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', activeTab);
      setSearchParams(newParams, { replace: true });
    }
    sessionStorage.setItem('active_tab', activeTab);
  }, [activeTab, searchParams, setSearchParams]);

  const handleTabChange = (tabId: string) => {
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(tabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
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

  // Slide animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <OnboardingProvider>
      <AIBackground variant="subtle" className="min-h-screen w-full">
        <div className="relative min-h-screen pb-20 lg:pb-0 pt-safe lg:pt-0">
          <ResponsiveHeader activeTab={activeTab} onTabChange={handleTabChange} />

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.main 
              key={activeTab}
              custom={direction}
              variants={isMobile ? slideVariants : undefined}
              initial={isMobile ? "enter" : { opacity: 0 }}
              animate={isMobile ? "center" : { opacity: 1 }}
              exit={isMobile ? "exit" : { opacity: 0 }}
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full"
            >
              {renderActiveComponent()}
            </motion.main>
          </AnimatePresence>
          
          <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </AIBackground>
    </OnboardingProvider>
  );
};

export default Index;
