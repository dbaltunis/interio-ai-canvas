import { useUserDisplay } from "@/hooks/useUserDisplay";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { DashboardDateFilter } from "./DashboardDateFilter";

/**
 * Simplified welcome header for Dealers
 * - No pending quotes count (they only see their own)
 * - No total clients count
 * - No customize button
 * - No Team Hub button
 * - Only shows greeting, avatar, date filter, and theme toggle
 */
export const DealerWelcomeHeader = () => {
  const { displayName, initials, avatarUrl, isLoading: userLoading } = useUserDisplay();
  const { theme, setTheme } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (userLoading) {
    return (
      <div className="flex items-center gap-4 p-4 md:p-5 bg-card border border-border/40 rounded-xl shadow-card">
        <Skeleton variant="circular" className="h-11 w-11 shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 md:p-5 bg-card border border-border/40 rounded-xl shadow-card transition-shadow hover:shadow-card-hover">
      <Avatar className="h-11 w-11 border-2 border-primary/20 shrink-0 shadow-sm">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : null}
        <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <h1 className="text-base md:text-lg font-semibold text-foreground truncate tracking-tight">
          {getGreeting()}, {displayName}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Welcome to your Dealer Portal
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Date Filter */}
        <DashboardDateFilter />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8 rounded-lg hover:bg-muted"
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
