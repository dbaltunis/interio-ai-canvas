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
    <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg border animate-fade-in">
      <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-primary/20 shrink-0">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : null}
        <AvatarFallback className="text-sm sm:text-lg font-semibold bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
          {getGreeting()}, {displayName}! 👋
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {stats?.pendingQuotes || 0} pending quotes • {stats?.totalClients || 0} clients
        </p>
      </div>
    </div>
  );
};
