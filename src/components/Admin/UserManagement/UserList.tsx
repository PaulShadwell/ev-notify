import React from 'react';
import { User } from '../../../types/user';
import { UserListItem } from './UserListItem';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleAdmin: (userId: string, isAdmin: boolean) => Promise<void>;
}

export function UserList({ users, onEdit, onToggleAdmin }: UserListProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehicle Info
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              onEdit={onEdit}
              onToggleAdmin={onToggleAdmin}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}