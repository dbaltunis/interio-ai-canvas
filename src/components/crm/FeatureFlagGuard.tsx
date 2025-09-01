import { ReactNode } from "react";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import NotFound from "@/pages/NotFound";

interface FeatureFlagGuardProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureFlagGuard = ({ flag, children, fallback }: FeatureFlagGuardProps) => {
  const isEnabled = useFeatureFlag(flag);
  
  if (!isEnabled) {
    return fallback || <NotFound />;
  }
  
  return <>{children}</>;
};