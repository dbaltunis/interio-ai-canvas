
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
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

  // If user is authenticated, show just the avatar (no dropdown)
  const userInitials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="flex items-center">
      <Avatar className="h-9 w-9">
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
    </div>
  );
};
