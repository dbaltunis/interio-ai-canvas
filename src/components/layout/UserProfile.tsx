
import { User, Settings, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { data: userProfile } = useCurrentUserProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleSettings = () => {
    navigate("/settings");
  };


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

  // If user is authenticated, show profile dropdown
  const userInitials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
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
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
