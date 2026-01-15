import { ComponentType, Suspense, ReactNode } from 'react';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

interface LazyWrapperProps {
  fallback?: ReactNode;
  className?: string;
  children: ReactNode;
}

// Elegant inline skeleton fallback
const DefaultFallback = () => (
  <div className="animate-pulse space-y-3 p-4">
    <div className="h-4 bg-muted rounded w-3/4" />
    <div className="h-4 bg-muted rounded w-1/2" />
    <div className="h-4 bg-muted rounded w-5/6" />
  </div>
);

export const LazyWrapper = ({ 
  fallback = <DefaultFallback />, 
  className,
  children 
}: LazyWrapperProps) => {
  return (
    <Suspense fallback={
      <div className={`flex items-center justify-center p-8 ${className || ''}`}>
        {fallback}
      </div>
    }>
      {children}
    </Suspense>
  );
};

// Higher-order component for lazy loading with skeleton
export const withLazySkeleton = <P extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  moduleName: string,
  SkeletonComponent: ComponentType
) => {
  const LazyComponent = lazyWithRetry(importFn, moduleName);
  
  return function LazySkeletonWrapper(props: P) {
    return (
      <Suspense fallback={<SkeletonComponent />}>
        <div className="animate-fade-in">
          <LazyComponent {...props as any} />
        </div>
      </Suspense>
    );
  };
};