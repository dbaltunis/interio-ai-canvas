import { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { useAccountStatus } from '@/hooks/useBlockAccount';
import { AccountBlockedDialog } from './AccountBlockedDialog';

interface AccountStatusGuardProps {
  children: ReactNode;
}

export function AccountStatusGuard({ children }: AccountStatusGuardProps) {
  const { user } = useAuth();
  const { data: accountStatus, isLoading, isError } = useAccountStatus(user?.id);

  // Don't block while loading, on error, or if no user
  // This prevents the error boundary from triggering on first login
  // when the user_profiles row might not exist yet
  if (isLoading || isError || !user) {
    return <>{children}</>;
  }

  // Check if account is blocked/suspended/trial_ended
  const status = accountStatus?.account_status;
  
  if (status && status !== 'active') {
    return (
      <>
        {/* Render children dimmed in background */}
        <div className="pointer-events-none opacity-30 blur-sm">
          {children}
        </div>
        {/* Show blocking dialog */}
        <AccountBlockedDialog 
          status={status as 'blocked' | 'trial_ended' | 'suspended'} 
          reason={accountStatus?.blocked_reason}
        />
      </>
    );
  }

  return <>{children}</>;
}
