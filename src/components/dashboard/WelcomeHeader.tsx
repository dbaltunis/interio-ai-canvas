import { useState } from "react";
import { useUserDisplay } from "@/hooks/useUserDisplay";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Settings2, Moon, Sun, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { Badge } from "@/components/ui/badge";
import { TeamCollaborationCenter } from "../collaboration/TeamCollaborationCenter";

interface WelcomeHeaderProps {
  onCustomizeClick: () => void;
}

export const WelcomeHeader = ({ onCustomizeClick }: WelcomeHeaderProps) => {
  const [teamHubOpen, setTeamHubOpen] = useState(false);
  const { displayName, initials, avatarUrl, isLoading: userLoading } = useUserDisplay();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { theme, setTheme } = useTheme();
  const { activeUsers, currentUser } = useUserPresence();
  const { conversations } = useDirectMessages();

  const otherActiveUsers = activeUsers.filter(u => u.user_id !== currentUser?.user_id && u.status === 'online');
  const unreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);
  const hasActivity = otherActiveUsers.length > 0 || unreadCount > 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (userLoading || statsLoading) {
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
        <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{stats?.pendingQuotes || 0}</span> pending quotes
          </p>
          <span className="text-border">•</span>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{stats?.totalClients || 0}</span> clients
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTeamHubOpen(true)}
          className="h-8 w-8 rounded-lg hover:bg-muted relative"
          title="Team Hub"
        >
          <Users className="h-4 w-4" />
          {hasActivity && (
            <span className="absolute -top-0.5 -right-0.5">
              {unreadCount > 0 ? (
                <Badge variant="destructive" size="sm" className="h-4 min-w-4 p-0 text-[9px] flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              ) : (
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse block" />
              )}
            </span>
          )}
        </Button>
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
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onCustomizeClick}
          className="h-8 w-8 rounded-lg hover:bg-muted"
          title="Customize dashboard"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      <TeamCollaborationCenter 
        isOpen={teamHubOpen}
        onToggle={() => setTeamHubOpen(!teamHubOpen)}
      />
    </div>
  );
};
