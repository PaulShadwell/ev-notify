import { useState, useCallback } from 'react';
import { User } from '../../../types/user';
import { fetchUsers, updateUserProfile, toggleUserAdminRole } from '../../../lib/database';

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEditUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      await updateUserProfile(selectedUser.id, userData);
      await loadUsers();
      setSelectedUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    try {
      setLoading(true);
      await toggleUserAdminRole(userId, makeAdmin);
      await loadUsers();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    selectedUser,
    loading,
    error,
    setSelectedUser,
    handleEditUser,
    handleToggleAdmin,
    loadUsers,
  };
}