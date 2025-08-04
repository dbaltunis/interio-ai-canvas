import { useState, useMemo, useCallback } from "react";
import { User } from "./useUsers";

export const useBulkUserSelection = (users: User[]) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const selectUser = useCallback((userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  }, []);

  const selectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  }, [users]);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const toggleUser = useCallback((userId: string) => {
    const isSelected = selectedUsers.includes(userId);
    selectUser(userId, !isSelected);
  }, [selectedUsers, selectUser]);

  const selectionStats = useMemo(() => ({
    total: users.length,
    selected: selectedUsers.length,
    allSelected: users.length > 0 && selectedUsers.length === users.length,
    someSelected: selectedUsers.length > 0 && selectedUsers.length < users.length,
    noneSelected: selectedUsers.length === 0,
  }), [users.length, selectedUsers.length]);

  return {
    selectedUsers,
    selectUser,
    selectAll,
    clearSelection,
    toggleUser,
    selectionStats,
  };
};