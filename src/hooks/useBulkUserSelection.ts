import { useState, useMemo } from "react";
import { User } from "./useUsers";

export const useBulkUserSelection = (users: User[]) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const selectUser = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const selectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const toggleUser = (userId: string) => {
    const isSelected = selectedUsers.includes(userId);
    selectUser(userId, !isSelected);
  };

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