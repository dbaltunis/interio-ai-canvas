import { useAuth } from "@/components/auth/AuthProvider";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";

export const useUserDisplay = () => {
  const { user } = useAuth();
  const { data: userProfile, isLoading } = useCurrentUserProfile();

  const getUserInitials = (displayName?: string, email?: string) => {
    if (displayName) {
      return displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    
    return "U";
  };

  const getDisplayName = () => {
    return userProfile?.display_name || user?.email || "User";
  };

  const getCurrentUserInitials = () => {
    return getUserInitials(userProfile?.display_name, user?.email);
  };

  const getAvatarUrl = () => {
    return userProfile?.avatar_url;
  };

  return {
    user,
    userProfile,
    isLoading,
    displayName: getDisplayName(),
    initials: getCurrentUserInitials(),
    avatarUrl: getAvatarUrl(),
    getUserInitials,
  };
};