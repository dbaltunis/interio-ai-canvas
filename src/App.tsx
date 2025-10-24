
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthPage } from "./components/auth/AuthPage";
import { ErrorBoundary } from "./components/performance/ErrorBoundary";
import { EmailRealtimeProvider } from "./contexts/EmailRealtimeContext";
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
  }, [location]);
  return null;
}

const App = () => {
  // Install navigation logging on app start
  useEffect(() => { 
    installNavLogger(); 
  }, []);

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
              themes={['light','dark','apple-graphite']}
              value={{
                light: 'light',
                dark: 'dark',
                midnight: 'midnight',
                'apple-graphite': 'apple-graphite',
              }}
            >
              <ThemeDarkSync />
              <InteractionUnlockGuard />
              <Toaster />
              <BrowserRouter>
                <NavObserver />
                <AuthProvider>
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
