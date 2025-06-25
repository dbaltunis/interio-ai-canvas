
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, Building, Calculator, Users, Package, Hammer, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const initials = getInitials(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} />
            <AvatarFallback className="bg-brand-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Quick Access Menu Items */}
        <DropdownMenuItem onClick={() => navigate('/clients')}>
          <Users className="mr-2 h-4 w-4" />
          <span>Clients</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/quotes')}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Quotes</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/inventory')}>
          <Package className="mr-2 h-4 w-4" />
          <span>Inventory</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/workshop')}>
          <Hammer className="mr-2 h-4 w-4" />
          <span>Workshop</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/calculator')}>
          <Calculator className="mr-2 h-4 w-4" />
          <span>Calculator</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/settings?tab=company')}>
          <Building className="mr-2 h-4 w-4" />
          <span>Company Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
