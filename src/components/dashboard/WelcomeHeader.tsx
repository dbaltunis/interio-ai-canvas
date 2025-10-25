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
      <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg border">
        <Skeleton variant="circular" className="h-16 w-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg border animate-fade-in">
      <Avatar className="h-16 w-16 border-2 border-primary/20">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : null}
        <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {displayName}! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          You have {stats?.pendingQuotes || 0} pending quotes and {stats?.totalClients || 0} active clients
        </p>
      </div>
    </div>
  );
};
