import { useState, useMemo, useCallback } from "react";
import { User } from "./useUsers";

export const useUserFilters = (users: User[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === null || user.role === roleFilter;

      // Status filter
      const matchesStatus = statusFilter === null || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const activeFilters = {
    search: searchTerm,
    role: roleFilter,
    status: statusFilter,
  };

  const stats = useMemo(() => ({
    total: users.length,
    filtered: filteredUsers.length,
    active: users.filter(u => u.status === 'Active').length,
    inactive: users.filter(u => u.status === 'Inactive').length,
    byRole: {
      Admin: users.filter(u => u.role === 'Admin').length,
      Manager: users.filter(u => u.role === 'Manager').length,
      Staff: users.filter(u => u.role === 'Staff').length,
    }
  }), [users, filteredUsers]);

  const setSearchTermCallback = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const setRoleFilterCallback = useCallback((role: string | null) => {
    setRoleFilter(role);
  }, []);

  const setStatusFilterCallback = useCallback((status: string | null) => {
    setStatusFilter(status);
  }, []);

  return {
    filteredUsers,
    activeFilters,
    stats,
    setSearchTerm: setSearchTermCallback,
    setRoleFilter: setRoleFilterCallback,
    setStatusFilter: setStatusFilterCallback,
  };
};