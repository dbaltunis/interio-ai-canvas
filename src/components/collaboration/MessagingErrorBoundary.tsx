import React from 'react';
import { ErrorBoundary } from '@/components/performance/ErrorBoundary';

interface MessagingErrorBoundaryProps {
  children: React.ReactNode;
}

export const MessagingErrorBoundary: React.FC<MessagingErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center text-muted-foreground">
          <p>Messaging system temporarily unavailable</p>
          <p className="text-sm">Please refresh the page to try again</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};