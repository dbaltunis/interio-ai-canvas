
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserDisplay } from "@/hooks/useUserDisplay";
import { useNavigate } from "react-router-dom";

interface UserProfileProps {
  onOpenTeamHub?: () => void;
}

export const UserProfile = ({ onOpenTeamHub }: UserProfileProps = {}) => {
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
    <button
      onClick={onOpenTeamHub}
      className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
      title="Open Team Hub"
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
    </button>
  );
};
