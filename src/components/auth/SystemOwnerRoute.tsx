import { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { AuthPage } from './AuthPage';
import { useUserRole } from '@/hooks/useUserRole';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface SystemOwnerRouteProps {
  children: ReactNode;
}

export const SystemOwnerRoute = ({ children }: SystemOwnerRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();

  const loading = authLoading || roleLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Check if user is System Owner
  const isSystemOwner = userRole?.isSystemOwner;

  if (!isSystemOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be a platform administrator to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
