import { ComponentType, lazy, Suspense, ReactNode } from 'react';
import { LoadingState } from '@/components/ui/loading-state';

interface LazyWrapperProps {
  fallback?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const LazyWrapper = ({ 
  fallback = <LoadingState size="md" text="Loading..." />, 
  className,
  children 
}: LazyWrapperProps) => {
  return (
    <Suspense fallback={
      <div className={`flex items-center justify-center p-8 ${className}`}>
        {fallback}
      </div>
    }>
      {children}
    </Suspense>
  );
};

// Higher-order component for lazy loading with skeleton
export const withLazySkeleton = <P extends {}>(
  Component: ComponentType<P>,
  SkeletonComponent: ComponentType
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return (props: P) => (
    <Suspense fallback={<SkeletonComponent />}>
      <div className="animate-fade-in">
        <LazyComponent {...(props as any)} />
      </div>
    </Suspense>
  );
};