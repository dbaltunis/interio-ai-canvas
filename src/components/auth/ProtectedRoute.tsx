
import { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { AuthPage } from './AuthPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute: loading =', loading, 'user =', user?.email || 'no user');
  console.log('ProtectedRoute: Current time =', new Date().toISOString());

  if (loading) {
    console.log('ProtectedRoute: Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, showing auth page');
    return <AuthPage />;
  }

  console.log('ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
};
