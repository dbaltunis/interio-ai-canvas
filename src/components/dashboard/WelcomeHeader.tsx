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
    <div className="relative overflow-hidden rounded-xl p-6 sm:p-8 animate-fade-in glass-morphism-strong border-primary/20">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent opacity-60" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl opacity-30" />
      
      <div className="relative flex items-center gap-4 sm:gap-6">
        <div className="relative shrink-0">
          <Avatar className="h-14 w-14 sm:h-20 sm:w-20 border-2 border-primary/30 shadow-lg">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-base sm:text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-green-500 rounded-full border-2 border-background shadow-sm" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-foreground truncate mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {getGreeting()}, {displayName}! 👋
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
              <span className="font-semibold text-primary">{stats?.pendingQuotes || 0}</span> pending quotes
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
              <span className="font-semibold text-primary">{stats?.totalClients || 0}</span> clients
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
