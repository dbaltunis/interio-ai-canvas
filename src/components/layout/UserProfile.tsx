
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";

interface UserProfileProps {
  onOpenTeamHub?: () => void;
}

export const UserProfile = ({ onOpenTeamHub }: UserProfileProps = {}) => {
  const { user } = useAuth();
  const { data: userProfile } = useCurrentUserProfile();
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

  // If user is authenticated, show clickable avatar
  const userInitials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : "U";

  return (
    <button
      onClick={onOpenTeamHub}
      className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
      title="Open Team Hub"
    >
      <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/20 transition-all">
        {userProfile?.avatar_url && (
          <AvatarImage 
            src={userProfile.avatar_url} 
            alt={userProfile.display_name || user.email || "User avatar"} 
          />
        )}
        <AvatarFallback className="bg-brand-secondary text-brand-primary">
          {userInitials}
        </AvatarFallback>
      </Avatar>
    </button>
  );
};
