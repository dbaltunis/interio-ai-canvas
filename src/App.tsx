import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from 'react';
import { lazyWithRetry } from "./utils/lazyWithRetry";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import { SystemOwnerRoute } from "./components/auth/SystemOwnerRoute";
import { AccountStatusGuard } from "./components/auth/AccountStatusGuard";
import { AuthPage } from "./components/auth/AuthPage";
import { ErrorBoundary } from "./components/performance/ErrorBoundary";
import { EmailRealtimeProvider } from "./contexts/EmailRealtimeContext";
import { PresenceProvider } from "./contexts/PresenceContext";
import { TeachingProvider } from "./contexts/TeachingContext";
import { TutorialProvider } from "./contexts/TutorialContext";
import { TutorialPlayer } from "./components/tutorials/TutorialPlayer";
import { DebugModeProvider } from "./contexts/DebugModeContext";
import { BugReportDialog } from "@/components/bug-report/BugReportDialog";
import { DebugPanel } from "./components/debug/DebugPanel";
import { ThemeProvider } from "next-themes";
import { ThemeDarkSync } from "./components/system/ThemeDarkSync";

import { InteractionUnlockGuard } from "./components/system/InteractionUnlockGuard";
import { LoadingState } from "./components/ui/loading-state";
import { ProjectInventoryTrackingHandler } from "./components/projects/ProjectInventoryTrackingHandler";
import { SyncIndicator } from "./components/system/SyncIndicator";
// FloatingTeachingButton moved to TeamCollaborationCenter
import { TeachingOverlay } from "./components/teaching/TeachingOverlay";
import { TeachingActiveSpotlight } from "./components/teaching/TeachingActiveSpotlight";
import { WelcomeTour } from "./components/teaching/WelcomeTour";
import { NewUserWelcome } from "./components/onboarding/NewUserWelcome";
import { PageSkeleton } from "./components/skeletons/PageSkeleton";
import { BookingPageSkeleton } from "./components/booking/BookingPageSkeleton";
import { UpdateAnnouncementModal } from "./components/version/UpdateAnnouncementModal";
import { setSentryContext, captureException } from "./lib/sentry";
import "@/styles/theme.css";

// Lazy load all route components with automatic retry for better reliability
const NotFound = lazyWithRetry(() => import("./pages/NotFound"), "NotFound");
const OnboardingWizard = lazyWithRetry(() => import("./pages/OnboardingWizard"), "OnboardingWizard");
const Index = lazyWithRetry(() => import("./pages/Index"), "Index");
const Settings = lazyWithRetry(() => import("./pages/Settings"), "Settings");
const AcceptInvitation = lazyWithRetry(() => import("./pages/AcceptInvitation"), "AcceptInvitation");
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"), "ResetPassword");
const PublicBookingPage = lazyWithRetry(() => import("./components/calendar/PublicBookingPage").then(m => ({ default: m.PublicBookingPage })), "PublicBooking");
const PublicStorePage = lazyWithRetry(() => import("./components/public-store/PublicStorePage").then(m => ({ default: m.PublicStorePage })), "PublicStore");
const PublicWorkOrder = lazyWithRetry(() => import("./pages/PublicWorkOrder"), "PublicWorkOrder");
const SubscriptionTest = lazyWithRetry(() => import("./pages/SubscriptionTest").then(m => ({ default: m.SubscriptionTest })), "SubscriptionTest");
const ManualQuoteTest = lazyWithRetry(() => import("./pages/ManualQuoteTest").then(m => ({ default: m.ManualQuoteTest })), "ManualQuoteTest");
const Billing = lazyWithRetry(() => import("./pages/Billing"), "Billing");
const Purchasing = lazyWithRetry(() => import("./pages/Purchasing"), "Purchasing");
const AdminBugManagement = lazyWithRetry(() => import("./pages/AdminBugManagement"), "AdminBugManagement");
const Documentation = lazyWithRetry(() => import("./pages/Documentation"), "Documentation");
const OnlineStore = lazyWithRetry(() => import("./pages/OnlineStore"), "OnlineStore");
const AdminAnalytics = lazyWithRetry(() => import("./pages/AdminAnalytics"), "AdminAnalytics");
const AdminAccountManagement = lazyWithRetry(() => import("./pages/AdminAccountManagement"), "AdminAccountManagement");
const AdminAccountHealth = lazyWithRetry(() => import("./pages/AdminAccountHealth"), "AdminAccountHealth");
const OnboardingSubmissions = lazyWithRetry(() => import("./pages/OnboardingSubmissions"), "OnboardingSubmissions");
const SubscriptionSuccess = lazyWithRetry(() => import("./pages/SubscriptionSuccess"), "SubscriptionSuccess");
const SubscriptionCanceled = lazyWithRetry(() => import("./pages/SubscriptionCanceled"), "SubscriptionCanceled");



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && 'status' in error && typeof error.status === 'number') {
          return error.status >= 500 && failureCount < 2;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error: Error) => {
        // Global mutation error tracking via Sentry
        captureException(error, { source: 'react-query-mutation' });
      },
    },
  },
});

// Navigation observer component
function NavObserver() {
  const location = useLocation();
  
  useEffect(() => {
    console.warn('[NAV] location changed ->', location.pathname + location.search + location.hash);
    
    // Set route context for Sentry error tracking
    setSentryContext('navigation', {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
    });
    
    // Handle Shopify OAuth callback
    const params = new URLSearchParams(location.search);
    const shopifyConnected = params.get('shopify_connected');
    const shop = params.get('shop');
    
    if (shopifyConnected === 'true' && shop) {
      // Notify parent window (popup opener) of success
      if (window.opener) {
        window.opener.postMessage({
          type: 'shopify-oauth-success',
          shop
        }, '*');
        window.close();
      } else {
        // If not in popup, show toast and clean URL
        toast({
          title: "Success",
          description: `Shopify store ${shop} connected successfully!`,
        });
        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    } else if (shopifyConnected === 'false') {
      const errorMessage = params.get('error') || 'Failed to connect Shopify store';
      if (window.opener) {
        window.opener.postMessage({
          type: 'shopify-oauth-error',
          message: errorMessage
        }, '*');
        window.close();
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [location]);
  
  return null;
}

const App = () => {
  // Navigation logging disabled to prevent security errors
  // useEffect(() => { 
  //   installNavLogger(); 
  // }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DebugModeProvider>
            <TooltipProvider>
            <SyncIndicator />
            {/* Ensure custom themes also apply the dark class */}
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              themes={['light','dark']}
              value={{
                light: 'light',
                dark: 'dark',
              }}
            >
              <ThemeDarkSync />
              <InteractionUnlockGuard />
              <Toaster />
              <BrowserRouter>
                <NavObserver />
                <UpdateAnnouncementModal />
                <AuthProvider>
                  
                  <AccountStatusGuard>
                  <TeachingProvider>
                  <TutorialProvider>
                  <PresenceProvider>
                    <EmailRealtimeProvider>
                      <BugReportDialog />
                      <DebugPanel />
                      <TeachingOverlay />
                      <TeachingActiveSpotlight />
                      <NewUserWelcome />
                      <WelcomeTour />
                      <TutorialPlayer />
                  <Suspense fallback={<PageSkeleton />}>
                  <Routes>
                {/* Public store routes */}
                <Route path="/store/:storeSlug/*" element={
                  <ErrorBoundary>
                    <PublicStorePage />
                  </ErrorBoundary>
                } />
                
                {/* Onboarding Wizard - public route */}
                <Route path="/onboarding-checklist" element={
                  <ErrorBoundary>
                    <OnboardingWizard />
                  </ErrorBoundary>
                } />

                {/* Public booking routes */}
                <Route path="/book/:slug" element={
                  <ErrorBoundary>
                    <Suspense fallback={<BookingPageSkeleton />}>
                      <PublicBookingPage />
                    </Suspense>
                  </ErrorBoundary>
                } />
                <Route path="/book" element={<NotFound />} />
                
                {/* Public work order route */}
                <Route path="/work-order/:token" element={
                  <ErrorBoundary>
                    <PublicWorkOrder />
                  </ErrorBoundary>
                } />
                
                {/* Invitation acceptance route */}
                <Route path="/accept-invitation" element={
                  <ErrorBoundary>
                    <AcceptInvitation />
                  </ErrorBoundary>
                } />
                
                {/* Authentication route */}
                <Route path="/auth" element={
                  <ErrorBoundary>
                    <AuthPage />
                  </ErrorBoundary>
                } />

                {/* Reset password route */}
                <Route path="/reset-password" element={
                  <ErrorBoundary>
                    <ResetPassword />
                  </ErrorBoundary>
                } />

                {/* Subscription success route - public */}
                <Route path="/subscription-success" element={
                  <ErrorBoundary>
                    <SubscriptionSuccess />
                  </ErrorBoundary>
                } />

                {/* Subscription canceled route - public */}
                <Route path="/subscription-canceled" element={
                  <ErrorBoundary>
                    <SubscriptionCanceled />
                  </ErrorBoundary>
                } />
                
                {/* Settings page - requires authentication */}
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Settings />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />

                {/* Billing page - owner only */}
                <Route path="/billing" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Billing />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />

                {/* Purchasing page - requires purchasing permission */}
                <Route path="/purchasing" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Purchasing />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />

                {/* Admin Bug Management - admin only */}
                <Route path="/admin/bugs" element={
                  <AdminRoute>
                    <ErrorBoundary>
                      <AdminBugManagement />
                    </ErrorBoundary>
                  </AdminRoute>
                } />

                {/* Admin Analytics Dashboard */}
                <Route path="/admin/analytics" element={
                  <AdminRoute>
                    <ErrorBoundary>
                      <AdminAnalytics />
                    </ErrorBoundary>
                  </AdminRoute>
                } />

                {/* Admin Account Management */}
                <Route path="/admin/accounts" element={
                  <SystemOwnerRoute>
                    <ErrorBoundary>
                      <AdminAccountManagement />
                    </ErrorBoundary>
                  </SystemOwnerRoute>
                } />

                {/* Admin Account Health Dashboard */}
                <Route path="/admin/health" element={
                  <SystemOwnerRoute>
                    <ErrorBoundary>
                      <AdminAccountHealth />
                    </ErrorBoundary>
                  </SystemOwnerRoute>
                } />

                {/* Admin Onboarding Submissions */}
                <Route path="/admin/onboarding-submissions" element={
                  <SystemOwnerRoute>
                    <ErrorBoundary>
                      <OnboardingSubmissions />
                    </ErrorBoundary>
                  </SystemOwnerRoute>
                } />

                {/* Test pages for Phase 1 features */}
                <Route path="/test/subscriptions" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <SubscriptionTest />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />

                <Route path="/test/manual-quotes" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <ManualQuoteTest />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                
                {/* Documentation page */}
                <Route path="/documentation" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Documentation />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />

                {/* Online Store Management */}
                <Route path="/online-store" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <OnlineStore />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />


                {/* Main application - all functionality handled through tabs */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Index />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                
                {/* Catch all other routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
                    </EmailRealtimeProvider>
                  </PresenceProvider>
                  </TutorialProvider>
                  </TeachingProvider>
                  </AccountStatusGuard>
                  <ProjectInventoryTrackingHandler />
                </AuthProvider>
                 </BrowserRouter>
              </ThemeProvider>
            </TooltipProvider>
        </DebugModeProvider>
      </QueryClientProvider>
      </ErrorBoundary>
    );
  };

export default App;
