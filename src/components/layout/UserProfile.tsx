
import { LogIn, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserDisplay } from "@/hooks/useUserDisplay";
import { useNavigate } from "react-router-dom";
import { QuickStatusUpdate } from "./QuickStatusUpdate";

interface UserProfileProps {
  onOpenTeamHub?: () => void;
  showCollaborationIndicator?: boolean;
  unreadCount?: number;
}

export const UserProfile = ({ onOpenTeamHub, showCollaborationIndicator = false, unreadCount = 0 }: UserProfileProps = {}) => {
  const { user } = useAuth();
  const { userProfile, isLoading, initials, displayName, avatarUrl } = useUserDisplay();
  const navigate = useNavigate();

  const handleAuth = () => {
    navigate("/auth");
  };

  // If user is not authenticated, show login button
  if (!user) {
    return (
      <Button
        variant="outline"
        onClick={handleAuth}
        className="flex items-center gap-2"
      >
        <LogIn className="h-4 w-4" />
        Login
      </Button>
    );
  }

  // Show loading if profile is loading
  if (isLoading) {
    return (
      <div className="h-9 w-9 rounded-full bg-muted animate-pulse"></div>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      <QuickStatusUpdate />
      
      <button
        onClick={onOpenTeamHub}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer relative group"
        title={unreadCount > 0 ? `${unreadCount} unread messages` : "Open Team Hub"}
      >
        <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/20 transition-all">
          {avatarUrl && (
            <AvatarImage 
              src={avatarUrl} 
              alt={displayName} 
            />
          )}
          <AvatarFallback className="bg-brand-secondary text-brand-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {/* Show collaboration icon when there's activity */}
        {(showCollaborationIndicator || unreadCount > 0) && (
          <div className="hidden md:flex items-center">
            {unreadCount > 0 ? (
              <MessageCircle className="h-4 w-4 text-primary" />
            ) : (
              <Users className="h-4 w-4 text-primary" />
            )}
          </div>
        )}
      </button>
      
      {/* Notification badges */}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium z-10">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
      {showCollaborationIndicator && unreadCount === 0 && (
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse z-10" />
      )}
    </div>
  );
};
