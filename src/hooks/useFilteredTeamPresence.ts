import { useMemo } from 'react';
import { useTeamPresence, TeamMemberPresence } from './useTeamPresence';
import { useIsDealer } from './useIsDealer';

/**
 * Roles that dealers are allowed to see and chat with.
 * Dealers should NOT see other dealers or staff members.
 */
const DEALER_VISIBLE_ROLES = ['Owner', 'Admin', 'System Owner'];

/**
 * A wrapper hook that filters team presence data based on the current user's role.
 * 
 * - Dealers can ONLY see: Owners, Admins, and System Owners
 * - Dealers CANNOT see: other Dealers or Staff
 * - Non-dealers (Owners, Admins, Staff) see everyone as normal
 */
export const useFilteredTeamPresence = (search?: string) => {
  const teamPresenceQuery = useTeamPresence(search);
  const { data: isDealer, isLoading: isDealerLoading } = useIsDealer();

  const filteredData = useMemo((): TeamMemberPresence[] => {
    if (!teamPresenceQuery.data) return [];
    
    // While loading dealer status, return all data to prevent flicker
    // The filtering will apply once we know the dealer status
    if (isDealerLoading) {
      return teamPresenceQuery.data;
    }
    
    // Dealers can only see Owners/Admins/System Owners
    if (isDealer) {
      return teamPresenceQuery.data.filter(
        user => DEALER_VISIBLE_ROLES.includes(user.role)
      );
    }
    
    // Non-dealers see everyone
    return teamPresenceQuery.data;
  }, [teamPresenceQuery.data, isDealer, isDealerLoading]);

  return { 
    ...teamPresenceQuery, 
    data: filteredData,
    // Include dealer loading state in the overall loading state
    isLoading: teamPresenceQuery.isLoading || isDealerLoading
  };
};
