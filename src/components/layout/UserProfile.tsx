
import { User, Settings, LogOut, LogIn, Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { useCompactMode } from "@/hooks/useCompactMode";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { data: userProfile } = useCurrentUserProfile();
  const navigate = useNavigate();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { compact, toggleCompact } = useCompactMode();

  const currentTheme = theme ?? resolvedTheme ?? "light";
  const ActiveDot = () => (
    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-secondary" aria-hidden="true" />
  );

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
      <DropdownMenuContent className="z-50 w-56 bg-popover border shadow-md rounded-md" align="end" forceMount>
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
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={theme ?? resolvedTheme ?? "light"}
            onValueChange={(v) => setTheme(v)}
          >
            <DropdownMenuRadioItem value="light" className="flex items-center justify-between">
              <span className="flex items-center"><Sun className="mr-2 h-4 w-4" />Light mode</span>
              {currentTheme === 'light' && <ActiveDot />}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" className="flex items-center justify-between">
              <span className="flex items-center"><Moon className="mr-2 h-4 w-4" />InterioApp dark</span>
              {currentTheme === 'dark' && <ActiveDot />}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="apple-graphite" className="flex items-center justify-between">
              <span className="flex items-center"><Moon className="mr-2 h-4 w-4" />Graphite dark</span>
              {currentTheme === 'apple-graphite' && <ActiveDot />}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuCheckboxItem
            checked={compact}
            onCheckedChange={() => toggleCompact()}
            className="cursor-pointer flex items-center justify-between"
          >
            <span className="flex items-center"><Palette className="mr-2 h-4 w-4" />Compact mode</span>
            {compact && <ActiveDot />}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
