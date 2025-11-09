
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import { AuthPage } from "./components/auth/AuthPage";
import { ErrorBoundary } from "./components/performance/ErrorBoundary";
import { EmailRealtimeProvider } from "./contexts/EmailRealtimeContext";
import { BugReportDialog } from "@/components/bug-report/BugReportDialog";
// CalendarSyncProvider removed - using Google Calendar OAuth only
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import { ThemeProvider } from "next-themes";
import { ThemeDarkSync } from "./components/system/ThemeDarkSync";
import { InteractionUnlockGuard } from "./components/system/InteractionUnlockGuard";
import { installNavLogger } from "./debug/navLogger";
// Ensure theme variables and custom classes are loaded globally
import "@/styles/theme.css";

import AcceptInvitation from "./pages/AcceptInvitation";
import ResetPassword from "./pages/ResetPassword";
import { PublicBookingPage } from "./components/calendar/PublicBookingPage";
import { SubscriptionTest } from "./pages/SubscriptionTest";
import { ManualQuoteTest } from "./pages/ManualQuoteTest";
import Billing from "./pages/Billing";
import Purchasing from "./pages/Purchasing";
import AdminBugManagement from "./pages/AdminBugManagement";
import Documentation from "./pages/Documentation";

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
        <EmailRealtimeProvider>
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
                  <BugReportDialog />
                  <Routes>
                {/* Public booking routes */}
                <Route path="/book/:slug" element={
                  <ErrorBoundary>
                    <PublicBookingPage />
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
                  </AuthProvider>
                </BrowserRouter>
              </ThemeProvider>
            </TooltipProvider>
        </EmailRealtimeProvider>
      </QueryClientProvider>
      </ErrorBoundary>
    );
  };

export default App;
