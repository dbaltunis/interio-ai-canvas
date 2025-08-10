
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
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import { ThemeProvider } from "next-themes";
import { ThemeDarkSync } from "./components/system/ThemeDarkSync";

// Ensure theme variables and custom classes are loaded globally
import "@/styles/theme.css";

import AcceptInvitation from "./pages/AcceptInvitation";
import { PublicBookingPage } from "./components/calendar/PublicBookingPage";

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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <EmailRealtimeProvider>
        <TooltipProvider>
          {/* Ensure custom themes also apply the dark class */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            themes={['light','dark','midnight','apple-graphite']}
            value={{
              light: 'light',
              dark: 'dark',
              midnight: 'midnight',
              'apple-graphite': 'apple-graphite',
            }}
          >
            <ThemeDarkSync />
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                
                {/* Settings page - requires authentication */}
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Settings />
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

export default App;
