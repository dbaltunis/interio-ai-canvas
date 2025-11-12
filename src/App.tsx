
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import { AuthPage } from "./components/auth/AuthPage";
import { ErrorBoundary } from "./components/performance/ErrorBoundary";
import { EmailRealtimeProvider } from "./contexts/EmailRealtimeContext";
import { BugReportDialog } from "@/components/bug-report/BugReportDialog";
import { ThemeProvider } from "next-themes";
import { ThemeDarkSync } from "./components/system/ThemeDarkSync";
import { InteractionUnlockGuard } from "./components/system/InteractionUnlockGuard";
import { LoadingState } from "./components/ui/loading-state";
import "@/styles/theme.css";

// Lazy load all route components for better code splitting
const NotFound = lazy(() => import("./pages/NotFound"));
const Index = lazy(() => import("./pages/Index"));
const Settings = lazy(() => import("./pages/Settings"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PublicBookingPage = lazy(() => import("./components/calendar/PublicBookingPage").then(m => ({ default: m.PublicBookingPage })));
const PublicStorePage = lazy(() => import("./components/public-store/PublicStorePage").then(m => ({ default: m.PublicStorePage })));
const SubscriptionTest = lazy(() => import("./pages/SubscriptionTest").then(m => ({ default: m.SubscriptionTest })));
const ManualQuoteTest = lazy(() => import("./pages/ManualQuoteTest").then(m => ({ default: m.ManualQuoteTest })));
const Billing = lazy(() => import("./pages/Billing"));
const Purchasing = lazy(() => import("./pages/Purchasing"));
const AdminBugManagement = lazy(() => import("./pages/AdminBugManagement"));
const Documentation = lazy(() => import("./pages/Documentation"));
const OnlineStore = lazy(() => import("./pages/OnlineStore"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminAccountManagement = lazy(() => import("./pages/AdminAccountManagement"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && 'status' in error && typeof error.status === 'number') {
          return error.status >= 500 && failureCount < 2;
        }
        return failureCount < 2;
      },
    },
  },
});

// Navigation observer component
function NavObserver() {
  const location = useLocation();
  
  useEffect(() => {
    console.warn('[NAV] location changed ->', location.pathname + location.search + location.hash);
    
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
            <TooltipProvider>
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
                <AuthProvider>
                  <EmailRealtimeProvider>
                  <BugReportDialog />
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen">
                      <LoadingState size="lg" text="Loading..." />
                    </div>
                  }>
                  <Routes>
                {/* Public store routes */}
                <Route path="/store/:storeSlug/*" element={
                  <ErrorBoundary>
                    <PublicStorePage />
                  </ErrorBoundary>
                } />
                
                {/* Public booking routes */}
                <Route path="/book/:slug" element={
                  <ErrorBoundary>
                    <PublicBookingPage />
                  </ErrorBoundary>
                } />
                <Route path="/book" element={<NotFound />} />
                
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
                  <AdminRoute>
                    <ErrorBoundary>
                      <AdminAccountManagement />
                    </ErrorBoundary>
                  </AdminRoute>
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
                  </AuthProvider>
                </BrowserRouter>
              </ThemeProvider>
            </TooltipProvider>
      </QueryClientProvider>
      </ErrorBoundary>
    );
  };

export default App;
