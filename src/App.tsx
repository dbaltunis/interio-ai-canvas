
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/layout/Header';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import Clients from '@/pages/Clients';
import Quotes from '@/pages/Quotes';
import Settings from '@/pages/Settings';
import Auth from '@/pages/Auth';
import { useUserPresence } from '@/hooks/useUserPresence';
import './App.css';

const queryClient = new QueryClient();

// Component to handle user presence tracking
const UserPresenceProvider = ({ children }: { children: React.ReactNode }) => {
  // This component initializes user presence tracking
  useUserPresence();
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <UserPresenceProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </UserPresenceProvider>
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <Router>
            <Routes>
              <Route path="/auth" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } />
              <Route path="/clients" element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              } />
              <Route path="/quotes" element={
                <ProtectedRoute>
                  <Quotes />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
