import React, { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserList } from './UserManagement/UserList';
import { UserEditModal } from './UserManagement/UserEditModal';
import { useUserManagement } from './UserManagement/useUserManagement';
import { AlertCircle } from 'lucide-react';

interface UserManagementProps {
  session: Session;
}

export function UserManagement({ session }: UserManagementProps) {
  const {
    users,
    selectedUser,
    loading,
    error,
    setSelectedUser,
    handleEditUser,
    handleToggleAdmin,
    loadUsers,
  } = useUserManagement();

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Users</h2>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-red-700">{error}</p>
          </div>
        </div>
      )}

      <UserList
        users={users}
        onEdit={setSelectedUser}
        onToggleAdmin={handleToggleAdmin}
        loading={loading}
      />

      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleEditUser}
          loading={loading}
        />
      )}
    </div>
  );
}