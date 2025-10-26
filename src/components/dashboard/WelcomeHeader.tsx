import { useUserDisplay } from "@/hooks/useUserDisplay";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Settings2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface WelcomeHeaderProps {
  onCustomizeClick: () => void;
}

export const WelcomeHeader = ({ onCustomizeClick }: WelcomeHeaderProps) => {
  const { displayName, initials, avatarUrl, isLoading: userLoading } = useUserDisplay();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { theme, setTheme } = useTheme();

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
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{stats?.pendingQuotes || 0}</span> pending quotes
          </p>
          <span className="text-muted-foreground/40">•</span>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{stats?.totalClients || 0}</span> clients
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8 p-0 hover:bg-primary/10"
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCustomizeClick}
          className="h-8 w-8 p-0 hover:bg-primary/10"
          title="Customize dashboard"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
