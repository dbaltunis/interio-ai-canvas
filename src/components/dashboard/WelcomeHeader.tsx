import { useUserDisplay } from "@/hooks/useUserDisplay";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export const WelcomeHeader = () => {
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
      <div className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-lg">
        <Skeleton variant="circular" className="h-12 w-12 shrink-0" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-lg">
      <Avatar className="h-12 w-12 border-2 border-border/30 shrink-0">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : null}
        <AvatarFallback className="text-sm font-semibold bg-muted text-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-foreground truncate">
          {getGreeting()}, {displayName}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {stats?.pendingQuotes || 0} pending quotes • {stats?.totalClients || 0} clients
        </p>
      </div>
    </div>
  );
};
