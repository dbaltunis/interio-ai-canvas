import { useUserDisplay } from "@/hooks/useUserDisplay";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DashboardCustomizationButton } from "./DashboardCustomizationButton";
import type { KPIConfig } from "@/hooks/useKPIConfig";

interface WelcomeHeaderProps {
  kpiConfigs?: KPIConfig[];
  onToggleKPI?: (id: string) => void;
}

export const WelcomeHeader = ({ kpiConfigs, onToggleKPI }: WelcomeHeaderProps) => {
  const { displayName, initials, avatarUrl, isLoading: userLoading } = useUserDisplay();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (userLoading || statsLoading) {
    return (
      <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg border">
        <Skeleton variant="circular" className="h-12 w-12 sm:h-16 sm:w-16 shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-3 sm:h-4 w-full max-w-xs" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl p-4 sm:p-6 md:p-8 animate-fade-in glass-morphism-strong border-primary/20">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent opacity-60" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl opacity-30" />
      
      {/* Action buttons - responsive positioning */}
      <div className="relative sm:absolute sm:top-4 sm:right-4 flex items-center justify-end gap-2 z-10 mb-3 sm:mb-0">
        <ThemeToggle />
        {kpiConfigs && onToggleKPI && (
          <DashboardCustomizationButton
            kpiConfigs={kpiConfigs}
            onToggleKPI={onToggleKPI}
          />
        )}
      </div>
      
      <div className="relative space-y-4">
        {/* Top section - Avatar and Greeting */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <Avatar className="h-12 w-12 sm:h-16 md:h-20 sm:w-16 md:w-20 border-2 border-primary/30 shadow-lg">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 bg-green-500 rounded-full border-2 border-background shadow-sm" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text leading-tight">
              {getGreeting()}, {displayName}! 👋
            </h1>
          </div>
        </div>

        {/* Bottom section - Stats */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pl-0 sm:pl-20 md:pl-24">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm">
            <span className="text-2xl sm:text-3xl font-bold text-primary">{stats?.pendingQuotes || 0}</span>
            <span className="text-xs sm:text-sm text-muted-foreground">pending quotes</span>
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm">
            <span className="text-2xl sm:text-3xl font-bold text-primary">{stats?.totalClients || 0}</span>
            <span className="text-xs sm:text-sm text-muted-foreground">clients</span>
          </div>
        </div>
      </div>
    </div>
  );
};
